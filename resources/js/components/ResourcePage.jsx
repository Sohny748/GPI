import { useCallback, useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, FileText, ReceiptText } from 'lucide-react';
import { api } from '../api';
import { SkeletonPage, PageHeader, EmptyState, Badge, Field, inputClass, ErrorText, EditModal } from './ui';
import { formatDate } from '../lib/constants';
import { useToast, useConfirmation } from './notifications';
import BoutonRapport from './BoutonRapport';
import DocumentsModal from './DocumentsModal';
import DetailsAchatModal from './DetailsAchatModal';

/**
 * Page de gestion générique : table + recherche + filtre optionnel,
 * création et modification en modale, suppression avec confirmation.
 *
 * colonnes : [{ key, label, width?, mono?, badge?, date?, render? }]
 * champs   : [{ key, label, required?, type?: text|date|number|textarea|select|ref, options?, source?, get? }]
 */
export default function ResourcePage({
    titre,
    sousTitre,
    endpoint,
    idKey,
    colonnes,
    champs,
    valeursDefaut = {},
    filtreStatut = null,
    labelElement,
    documents = null, // { type: 'equipement'|'achat'|… } — active le bouton Docs par ligne
    detailsAchats = false, // active le bouton « Détails » (lignes d'achat) par ligne
    ficheComplete = null, // (item) => void — PDF complet d'une ligne
    fichesCompletesTitre = null, // active le bouton « Fiches complètes » de l'en-tête
}) {
    const [items, setItems] = useState(null);
    const [ref, setRef] = useState(null);
    const [q, setQ] = useState('');
    const [statutFiltre, setStatutFiltre] = useState('');
    const [modal, setModal] = useState(null); // null | { mode, item? }
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);
    const [modalDocs, setModalDocs] = useState(null); // null | { item }
    const [modalDetails, setModalDetails] = useState(null); // null | { item } (achat)

    const chargeRef = () => api.get('/referentiel').then(({ data }) => setRef(data));

    const load = useCallback(async () => {
        const params = Object.fromEntries(Object.entries({ q, statut: statutFiltre }).filter(([, v]) => v !== ''));
        const { data } = await api.get(endpoint, { params });
        setItems(Array.isArray(data) ? data : data.data ?? []);
    }, [endpoint, q, statutFiltre]);

    useEffect(() => {
        const t = setTimeout(() => { load(); }, 250);
        return () => clearTimeout(t);
    }, [load]);

    useEffect(() => { chargeRef(); }, []);

    const toast = useToast();
    const confirmer = useConfirmation();

    const notifier = (text, type = 'info') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    const ouvrirCreation = () => {
        const vide = {};
        champs.forEach((c) => {
            vide[c.key] = c.type === 'select' && c.options ? (c.options.find(([v]) => v !== '')?.[0] ?? '') : '';
        });
        setForm({ ...vide, ...valeursDefaut });
        setErrors(null);
        setModal({ mode: 'create' });
        };

    const ouvrirEdition = (item) => {
        const data = {};
        champs.forEach((c) => {
            let v = item[c.key] ?? '';
            if (c.type === 'date' && v) v = String(v).slice(0, 10);
            data[c.key] = v;
        });
        setForm(data);
        setErrors(null);
        setModal({ mode: 'edit', item });
        };

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors(null);
        try {
            const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]));
            if (modal?.mode === 'edit') {
                await api.put(`${endpoint}/${modal.item[idKey]}`, payload);
                toast.succes('Modifications enregistrées.');
            } else {
                await api.post(endpoint, payload);
                toast.succes(`${labelElement ?? 'Élément'} créé(e) avec succès.`);
            }
            setModal(null);
            await load();
        } catch (err) {
            setErrors(err.response?.data?.errors ?? { erreur: [err.response?.data?.message ?? 'Enregistrement impossible.'] });
        } finally {
            setBusy(false);
        }
    };

    const supprimer = async (item) => {
        const col = colonnes.find((c) => ! c.render && ! c.badge && ! c.date);
        const nom = col ? (item[col.key] ?? '') : '';
        const ok = await confirmer({
            titre: 'Supprimer cet élément ?',
            message: `« ${nom} » sera définitivement supprimé. Cette action est irréversible.`,
            danger: true,
            texteOK: 'Supprimer',
        });
        if (! ok) return;
        try {
            await api.delete(`${endpoint}/${item[idKey]}`);
            toast.succes('Élément supprimé.');
            await load();
        } catch (err) {
            toast.erreur(err.response?.data?.message ?? 'Suppression impossible (élément utilisé ailleurs).');
        }
    };

    if (! items) return <SkeletonPage lignes={5} />;

    // Colonnes du rapport PDF dérivées automatiquement des colonnes de la table
    const colonnesRapport = colonnes
        .filter((c) => c.key)
        .map((c) => ({
            label: c.label,
            valeur: (item) => {
                if (c.render) {
                    const v = c.render(item);
                    return typeof v === 'string' || typeof v === 'number' ? v : (item[c.key] ?? '—');
                }
                if (c.date) return formatDate(item[c.key]) ?? '—';
                if (c.badge) return c.badgeLabel?.(item[c.key]) ?? item[c.key] ?? '—';
                return item[c.key] ?? '—';
            },
            numeric: c.key === 'montant_total' || c.key === 'prix_acquisition',
        }));

    const colNom = colonnes.find((c) => ! c.render && ! c.badge && ! c.date);

    return (
        <div className="anim-fade-up">
            <PageHeader
                title={titre}
                subtitle={sousTitre ?? `${items.length} élément(s)`}
                actions={
                    <div className="flex items-center gap-2">
                        <BoutonRapport
                            endpoint={endpoint}
                            params={Object.fromEntries(Object.entries({ q, statut: statutFiltre }).filter(([, v]) => v !== ''))}
                            titre={`Rapport — ${titre}`}
                            colonnes={colonnesRapport}
                        />
                        {ficheComplete && fichesCompletesTitre && items.length > 0 && (
                            <button
                                onClick={() => fichesCompletesTitre(items)}
                                title="Un PDF regroupant la fiche complète de chaque élément affiché"
                                className="btn-moderne inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm shadow-indigo-600/25"
                            >
                                <ReceiptText size={15} /> Fiches complètes
                            </button>
                        )}
                        <button onClick={ouvrirCreation} className="btn-moderne inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-vert-600 hover:bg-vert-700 text-white text-sm font-bold shadow-sm shadow-vert-600/30">
                            <Plus size={15} /> Ajouter
                        </button>
                    </div>
                }
            />

            {message && (
                <div className={`mb-4 rounded-lg border p-3 text-sm ${
                    message.type === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-500'
                        : 'bg-blue-100 border-blue-200 text-blue-300'
                }`}>{message.text}</div>
            )}

            {/* Recherche + filtre statut optionnel */}
            <div className="anim-fade-up anim-d1 bg-card rounded-2xl border border-slate-200/50 shadow-sm p-3 mb-4 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className={`${inputClass} pl-9`} />
                </div>
                {filtreStatut && (
                    <select value={statutFiltre} onChange={(e) => setStatutFiltre(e.target.value)} className={`${inputClass} sm:w-48`}>
                        <option value="">Tous les statuts</option>
                        {filtreStatut.map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden anim-fade-up anim-d2 lift">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200/50">
                                {colonnes.map((c) => (
                                    <th key={c.key} className={`px-4 py-2.5 font-bold ${c.width ?? ''}`}>{c.label}</th>
                                ))}
                                <th className="px-4 py-2.5 text-right font-bold w-44">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item, i) => (
                                <tr
                                    key={item[idKey]}
                                    className="anim-fade-up ligne-table hover:bg-blue-50/40"
                                    style={{ animationDelay: `${Math.min(i * 35, 420)}ms` }}
                                >
                                    {colonnes.map((c) => (
                                        <td key={c.key} className="px-4 py-2.5 text-slate-700">
                                            {c.render
                                                ? c.render(item)
                                                : c.badge
                                                    ? <Badge color={c.badge(item[c.key])}>{c.badgeLabel?.(item[c.key]) ?? item[c.key] ?? '—'}</Badge>
                                                    : c.date
                                                        ? formatDate(item[c.key])
                                                        : c.mono
                                                            ? <span className="font-mono text-xs font-semibold text-blue-300">{item[c.key] ?? '—'}</span>
                                                            : (item[c.key] ?? '—')}
                                        </td>
                                    ))}
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {documents && (
                                                <button
                                                    onClick={() => setModalDocs({ item })}
                                                    title="Documents (PDF, images…)"
                                                    className="btn-moderne inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200/60 bg-sky-100 hover:bg-sky-200 text-sky-400 text-xs font-semibold"
                                                >
                                                    <FileText size={13} /> Docs
                                                </button>
                                            )}
                                            {ficheComplete && (
                                                <button
                                                    onClick={() => ficheComplete(item)}
                                                    title="Fiche complète PDF (toutes les informations + détails + documents)"
                                                    className="btn-moderne inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200/60 bg-indigo-100 hover:bg-indigo-200 text-indigo-400 text-xs font-semibold"
                                                >
                                                    <ReceiptText size={13} /> Fiche
                                                </button>
                                            )}
                                            <button
                                                onClick={() => ouvrirEdition(item)}
                                                title="Modifier"
                                                className="btn-moderne inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-orange-200/60 bg-orange-100 hover:bg-orange-200 text-orange-400 text-xs font-semibold"
                                            >
                                                <Pencil size={13} /> Modifier
                                            </button>
                                            <button
                                                onClick={() => supprimer(item)}
                                                title="Supprimer"
                                                className="btn-moderne inline-flex items-center px-2.5 py-1.5 rounded-lg border border-rose-200/60 bg-rose-100 hover:bg-rose-200 text-rose-400 text-xs font-semibold"
                                            >
                                                <Trash2 size={13} /> Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={colonnes.length + 1}>
                                        <EmptyState title="Aucun élément" hint="Ajoutez le premier ou ajustez la recherche." />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modale création / édition */}
            <EditModal
                open={!! modal}
                mode={modal?.mode}
                onClose={() => setModal(null)}
                onSubmit={submit}
                busy={busy}
                title={modal?.mode === 'edit'
                    ? `Modifier — ${colonnes.find((c) => c.mono)?.render?.(modal.item) ?? modal.item[idKey]}`
                    : `Nouvel élément — ${titre}`}
                width="max-w-xl"
            >
                {/* (contenu champs rendu par EditModal children ci-dessous) */}
                <ErrorText key={errors ? JSON.stringify(errors) : 'aucune'} errors={errors} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {champs.map((c) => (
                        <Field key={c.key} label={c.label} required={c.required}>
                            {c.type === 'select' ? (
                                <select value={form[c.key] ?? ''} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} className={inputClass}>
                                    {(c.options ?? []).map(([v, l]) => (
                                        <option key={v} value={v}>{l}</option>
                                    ))}
                                </select>
                            ) : c.type === 'ref' ? (
                                <select value={form[c.key] ?? ''} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} className={inputClass}>
                                    <option value="">—</option>
                                    {(ref?.[c.source] ?? []).map((o) => (
                                        <option key={o[c.idSource ?? Object.keys(o)[0]]} value={o[c.idSource ?? Object.keys(o)[0]]}>{c.get(o)}</option>
                                    ))}
                                </select>
                            ) : c.type === 'textarea' ? (
                                <textarea rows={2} value={form[c.key] ?? ''} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} className={inputClass} />
                            ) : (
                                <input
                                    type={c.type ?? 'text'}
                                    required={c.required}
                                    value={form[c.key] ?? ''}
                                    onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                                    className={inputClass}
                                />
                            )}
                        </Field>
                    ))}
                </div>
            </EditModal>

            {/* Modale documents (PDF / images) */}
            {documents && modalDocs && (
                <DocumentsModal
                    open={!! modalDocs}
                    onClose={() => setModalDocs(null)}
                    documentableType={documents.type}
                    documentableId={modalDocs.item[idKey]}
                    titre={colNom ? (modalDocs.item[colNom.key] ?? `#${modalDocs.item[idKey]}`) : `#${modalDocs.item[idKey]}`}
                />
            )}

            {/* Modale détails d'achat (lignes d'articles) */}
            {detailsAchats && modalDetails && (
                <DetailsAchatModal
                    open={!! modalDetails}
                    onClose={() => setModalDetails(null)}
                    achat={modalDetails.item}
                    onTotalChange={() => load()}
                />
            )}
        </div>
    );
}
