import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Monitor, Pencil, FileText, FileDown, Trash2 } from 'lucide-react';
import { api } from '../api';
import { SkeletonPage, PageHeader, EmptyState, Badge, Field, inputClass, ErrorText, EditModal } from '../components/ui';
import { useToast, useConfirmation } from '../components/notifications';
import { STATUTS_EQUIPEMENT, formatDate, formatAr } from '../lib/constants';
import BoutonRapport from '../components/BoutonRapport';
import DocumentsModal from '../components/DocumentsModal';
import { fichesCompletes, ficheComplete } from '../lib/ficheEquipement';

const VIDE_FORM = {
    code_inventaire: '', numero_serie: '', designation: '', description: '',
    date_acquisition: '', date_mise_service: '', prix_acquisition: '',
    garantie_debut: '', garantie_fin: '', statut: 'en_stock',
    id_modele: '', id_direction: '', id_service: '', id_localisation: '', id_etat: '', id_fournisseur: '',
};

const versForm = (eq) => ({
    code_inventaire: eq.code_inventaire ?? '',
    numero_serie: eq.numero_serie ?? '',
    designation: eq.designation ?? '',
    description: eq.description ?? '',
    date_acquisition: eq.date_acquisition ?? '',
    date_mise_service: eq.date_mise_service ?? '',
    prix_acquisition: eq.prix_acquisition ?? '',
    garantie_debut: eq.garantie_debut ?? '',
    garantie_fin: eq.garantie_fin ?? '',
    statut: eq.statut ?? 'en_stock',
    id_modele: eq.id_modele ?? '',
    id_direction: eq.id_direction ?? '',
    id_service: eq.id_service ?? '',
    id_localisation: eq.id_localisation ?? '',
    id_etat: eq.id_etat ?? '',
    id_fournisseur: eq.id_fournisseur ?? '',
});

export default function Equipements() {
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState({ q: '', statut: '', id_categorie: '' });
    const [referentiel, setReferentiel] = useState(null);
    const [modal, setModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', equipement }
    const [form, setForm] = useState(VIDE_FORM);
    const [errors, setErrors] = useState(null);
    const [busy, setBusy] = useState(false);
    const [docTarget, setDocTarget] = useState(null);
    const toast = useToast();
    const confirmer = useConfirmation();

    const colonnesRapport = [
        ['Code', 'code_inventaire'],
        ['Désignation', 'designation'],
        ['Modèle', (eq) => [eq.marque?.nom_marque, eq.modele?.nom_modele].filter(Boolean).join(' ')],
        ['Catégorie', (eq) => eq.categorie?.nom_categorie ?? ''],
        ['Localisation', (eq) => (eq.localisation ? `${eq.localisation.batiment?.site?.nom_site ?? ''} · ${eq.localisation.nom_localisation}` : 'Stock')],
        ['Statut', (eq) => STATUTS_EQUIPEMENT[eq.statut]?.label ?? eq.statut],
        ['Prix (Ar)', (eq) => (eq.prix_acquisition != null ? String(eq.prix_acquisition) : '')],
        ['Acquisition', 'date_acquisition'],
        ['Fin garantie', 'garantie_fin'],
    ];

    const load = useCallback(async (params = filters) => {
        const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
        const { data } = await api.get('/equipements', { params: clean });
        setData(data);
    }, [filters]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        api.get('/referentiel').then(({ data }) => setReferentiel(data));
    }, []);

    const setF = (k) => (e) => {
        const next = { ...filters, [k]: e.target.value };
        setFilters(next);
        if (k !== 'q') load(next);
    };

    const ouvrirCreation = () => {
        setForm(VIDE_FORM);
        setErrors(null);
        setModal({ mode: 'create' });
    };

    const ouvrirEdition = (eq) => {
        setForm(versForm(eq));
        setErrors(null);
        setModal({ mode: 'edit', equipement: eq });
    };

    const supprimerEquipement = async (eq) => {
        const ok = await confirmer({
            titre: 'Supprimer cet équipement ?',
            message: `« ${eq.code_inventaire} — ${eq.designation ?? ''} » sera définitivement supprimé. Cette action est irréversible.`,
            danger: true,
            texteOK: 'Supprimer',
        });
        if (! ok) return;
        try {
            await api.delete(`/equipements/${eq.id_equipement}`);
            toast.succes('Équipement supprimé.');
            await load();
        } catch (err) {
            toast.erreur(err.response?.data?.message ?? 'Suppression impossible (équipement utilisé ailleurs : affectation, ticket, maintenance…).');
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors(null);
        try {
            const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]));
            if (modal?.mode === 'edit') {
                await api.put(`/equipements/${modal.equipement.id_equipement}`, payload);
                toast.succes('Modifications enregistrées.');
            } else {
                await api.post('/equipements', payload);
                toast.succes('Équipement créé avec succès.');
            }
            setModal(null);
            await load();
        } catch (err) {
            setErrors(err.response?.data?.errors ?? { erreur: ['Enregistrement impossible.'] });
            toast.erreur('Enregistrement impossible — vérifiez les champs.');
        } finally {
            setBusy(false);
        }
    };

    if (! data) return <SkeletonPage lignes={6} />;

    const champsForm = (
        <>
            <ErrorText errors={errors} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Code inventaire" required>
                    <input required value={form.code_inventaire} onChange={(e) => setForm({ ...form, code_inventaire: e.target.value })} className={inputClass} placeholder="GPI-00042" />
                </Field>
                <Field label="N° de série">
                    <input value={form.numero_serie} onChange={(e) => setForm({ ...form, numero_serie: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Désignation" required>
                    <input required value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Statut" required>
                    <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className={inputClass}>
                        {Object.entries(STATUTS_EQUIPEMENT).map(([k, m]) => (
                            <option key={k} value={k}>{m.label}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Modèle">
                    <select value={form.id_modele} onChange={(e) => setForm({ ...form, id_modele: e.target.value })} className={inputClass}>
                        <option value="">—</option>
                        {referentiel?.modeles?.map((m) => (
                            <option key={m.id_modele} value={m.id_modele}>{m.marque?.nom_marque} {m.nom_modele}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Direction">
                    <select value={form.id_direction} onChange={(e) => setForm({ ...form, id_direction: e.target.value })} className={inputClass}>
                        <option value="">—</option>
                        {referentiel?.directions?.map((d) => (
                            <option key={d.id_direction} value={d.id_direction}>{d.nom_direction}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Localisation">
                    <select value={form.id_localisation} onChange={(e) => setForm({ ...form, id_localisation: e.target.value })} className={inputClass}>
                        <option value="">Stock</option>
                        {referentiel?.localisations?.map((l) => (
                            <option key={l.id_localisation} value={l.id_localisation}>{l.nom_localisation}</option>
                        ))}
                    </select>
                </Field>
                <Field label="État">
                    <select value={form.id_etat} onChange={(e) => setForm({ ...form, id_etat: e.target.value })} className={inputClass}>
                        <option value="">—</option>
                        {referentiel?.etats?.map((et) => (
                            <option key={et.id_etat} value={et.id_etat}>{et.nom_etat}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Date d'acquisition">
                    <input type="date" value={form.date_acquisition} onChange={(e) => setForm({ ...form, date_acquisition: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Prix d'acquisition (Ar)">
                    <input type="number" min="0" value={form.prix_acquisition} onChange={(e) => setForm({ ...form, prix_acquisition: e.target.value })} className={inputClass} />
                </Field>
            </div>
        </>
    );

    return (
        <div className="anim-fade-up">
            <PageHeader
                title="Équipements"
                subtitle={`${data.total} équipement(s) au parc`}
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fichesCompletes(data?.data ?? [])}
                            disabled={! data?.data?.length}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-[.97] text-white text-sm font-bold shadow-sm shadow-sky-600/25 transition-all disabled:opacity-50"
                            title="PDF : fiche détaillée de chaque équipement affiché (toutes informations)">
                            <FileDown size={15} /> Fiches complètes
                        </button>
                        <BoutonRapport titre="Équipements du parc" lignes={data?.data ?? []} colonnes={colonnesRapport} disabled={! data?.data?.length} />
                        <button
                            onClick={ouvrirCreation}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm shadow-blue-600/25"
                        >
                            <Plus size={15} /> Nouvel équipement
                        </button>
                    </div>
                }
            />

            {/* Filtres */}
            <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm p-3 mb-4 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={filters.q}
                        onChange={setF('q')}
                        placeholder="Rechercher par code inventaire, n° série, désignation…"
                        className={`${inputClass} pl-9`}
                    />
                </div>
                <select value={filters.statut} onChange={setF('statut')} className={`${inputClass} sm:w-44`}>
                    <option value="">Tous les statuts</option>
                    {Object.entries(STATUTS_EQUIPEMENT).map(([k, m]) => (
                        <option key={k} value={k}>{m.label}</option>
                    ))}
                </select>
                <select value={filters.id_categorie} onChange={setF('id_categorie')} className={`${inputClass} sm:w-48`}>
                    <option value="">Toutes catégories</option>
                    {referentiel?.categories?.map((c) => (
                        <option key={c.id_categorie} value={c.id_categorie}>{c.nom_categorie}</option>
                    ))}
                </select>
            </div>

            {/* Tableau */}
            <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200/50">
                                <th className="px-4 py-3 font-bold">Code</th>
                                <th className="px-4 py-3 font-bold">Désignation</th>
                                <th className="px-4 py-3 font-bold hidden md:table-cell">Catégorie</th>
                                <th className="px-4 py-3 font-bold hidden lg:table-cell">Localisation</th>
                                <th className="px-4 py-3 font-bold">Statut</th>
                                <th className="px-4 py-3 text-right font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.data.map((eq, iRow) => (
                                <tr key={eq.id_equipement} className="anim-fade-up ligne-table hover:bg-blue-50/30" style={{ animationDelay: `${Math.min(iRow * 35, 420)}ms` }}>
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-300">
                                        {eq.code_inventaire}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-800">{eq.designation}</div>
                                        <div className="text-[11px] text-slate-500">{eq.marque?.nom_marque} {eq.modele?.nom_modele}</div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-slate-600">
                                        {eq.categorie?.nom_categorie ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600">
                                        {eq.localisation ? `${eq.localisation.batiment?.site?.nom_site ?? ''} · ${eq.localisation.nom_localisation}` : 'Stock'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge color={STATUTS_EQUIPEMENT[eq.statut]?.color}>{STATUTS_EQUIPEMENT[eq.statut]?.label ?? eq.statut}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => ficheComplete(eq)}
                                                title="Fiche complète PDF (toutes les informations + historiques)"
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200/50 bg-sky-50 hover:bg-sky-100 text-sky-600 hover:text-sky-700 text-xs font-semibold transition-colors"
                                            >
                                                <FileDown size={13} /> Fiche
                                            </button>
                                            <button
                                                onClick={() => setDocTarget({ id: eq.id_equipement, label: `${eq.code_inventaire} — ${eq.designation}` })}
                                                title="Documents & fiche technique (PDF, images…)"
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200/50 bg-indigo-50 hover:bg-card-high text-indigo-400 hover:text-indigo-500 text-xs font-semibold transition-colors"
                                            >
                                                <FileText size={13} /> Docs
                                            </button>
                                            <button
                                                onClick={() => ouvrirEdition(eq)}
                                                title="Modifier cet équipement"
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200/50 bg-slate-100 hover:bg-card-high text-slate-600 hover:text-sky-400 text-xs font-semibold transition-colors"
                                            >
                                                <Pencil size={13} /> Modifier
                                            </button>
                                            <button
                                                onClick={() => supprimerEquipement(eq)}
                                                title="Supprimer cet équipement"
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200/50 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold transition-colors"
                                            >
                                                <Trash2 size={13} /> Supprimer
                                            </button>
                                            <Link
                                                to={`/equipements/${eq.id_equipement}`}
                                                title="Voir la fiche détaillée"
                                                className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-slate-200/50 bg-slate-100 hover:bg-card-high text-slate-600 hover:text-blue-300 text-xs font-semibold transition-colors"
                                            >
                                                Détail
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {data.data.length === 0 && (
                    <EmptyState icon={Monitor} title="Aucun équipement trouvé" hint="Ajustez les filtres ou créez un nouvel équipement." />
                )}

                {/* Pagination */}
                {data.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/50 bg-slate-100 text-xs">
                        <span className="text-slate-500">
                            Page {data.current_page} / {data.last_page} — {data.total} équipements
                        </span>
                        <div className="flex gap-1">
                            <button
                                disabled={data.current_page <= 1}
                                onClick={() => load({ ...filters, page: data.current_page - 1 })}
                                className="px-3 py-1.5 rounded-lg border border-slate-200/50 bg-card disabled:opacity-40 hover:bg-card-high font-semibold"
                            >
                                Précédent
                            </button>
                            <button
                                disabled={data.current_page >= data.last_page}
                                onClick={() => load({ ...filters, page: data.current_page + 1 })}
                                className="px-3 py-1.5 rounded-lg border border-slate-200/50 bg-card disabled:opacity-40 hover:bg-card-high font-semibold"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {docTarget && (
                <DocumentsModal
                    open
                    onClose={() => setDocTarget(null)}
                    documentableType="equipement"
                    documentableId={docTarget.id}
                    titre={`Documents & fiche technique — ${docTarget.label}`}
                />
            )}

            {/* Modale création / édition */}
            <EditModal
                open={!! modal}
                mode={modal?.mode}
                onClose={() => setModal(null)}
                onSubmit={submit}
                busy={busy}
                title={modal?.mode === 'edit' ? `Modifier — ${modal.equipement.code_inventaire}` : 'Nouvel équipement'}
            >
                {champsForm}
            </EditModal>
        </div>
    );
}
