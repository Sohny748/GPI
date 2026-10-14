import { useCallback, useEffect, useState } from 'react';
import { Plus, ArrowLeftRight, Undo2, X, FileText, FileDown, Trash2 } from 'lucide-react';
import { api } from '../api';
import { SkeletonPage, PageHeader, EmptyState, Field, inputClass, ErrorText } from '../components/ui';
import { useToast, useConfirmation } from '../components/notifications';
import { formatDate } from '../lib/constants';
import BoutonRapport from '../components/BoutonRapport';
import DocumentsModal from '../components/DocumentsModal';
import { ficheAffectation } from '../lib/ficheElement';

export default function Affectations() {
    const [items, setItems] = useState(null);
    const [equipements, setEquipements] = useState([]);
    const [agents, setAgents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ id_equipement: '', id_agent: '', date_affectation: new Date().toISOString().slice(0, 10), motif: '', commentaire: '' });
    const [errors, setErrors] = useState(null);
    const [busy, setBusy] = useState(false);
    const toast = useToast();
    const confirmer = useConfirmation();
    const [docTarget, setDocTarget] = useState(null);

    const load = useCallback(async () => {
        const { data } = await api.get('/affectations');
        setItems(data);
    }, []);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        api.get('/equipements', { params: { per_page: 100 } }).then(({ data }) => setEquipements(data.data));
        api.get('/agents').then(({ data }) => setAgents(data));
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors(null);
        try {
            await api.post('/affectations', {
                ...form,
                id_equipement: Number(form.id_equipement),
                id_agent: Number(form.id_agent),
            });
            toast.succes('Affectation enregistrée. L\u2019équipement est désormais en service.');
            setShowForm(false);
            setForm({ id_equipement: '', id_agent: '', date_affectation: new Date().toISOString().slice(0, 10), motif: '', commentaire: '' });
            await load();
        } catch (err) {
            setErrors(err.response?.data?.errors ?? { erreur: ['Affectation impossible.'] });
            toast.erreur('Affectation impossible — vérifiez que l\u2019équipement est disponible.');
        } finally {
            setBusy(false);
        }
    };

    const supprimerAffectation = async (a) => {
        const ok = await confirmer({
            titre: 'Supprimer cette affectation ?',
            message: `L'affectation #${a.id_affectation} (${a.agent ? `${a.agent.prenom} ${a.agent.nom_naiss}` : '—'} — ${a.equipement?.code_inventaire ?? '—'}) sera définitivement supprimée de l'historique. Cette action est irréversible.`,
            danger: true,
            texteOK: 'Supprimer',
        });
        if (! ok) return;
        try {
            await api.delete(`/affectations/${a.id_affectation}`);
            toast.succes('Affectation supprimée.');
            await load();
        } catch (err) {
            toast.erreur(err.response?.data?.message ?? 'Suppression impossible.');
        }
    };

    const restituer = async (id) => {
        const ok = await confirmer({
            titre: 'Restituer cet équipement ?',
            message: 'L\u2019affectation prendra fin aujourd\u2019hui et l\u2019équipement retournera au stock.',
            texteOK: 'Restituer',
        });
        if (! ok) return;
        try {
            await api.post(`/affectations/${id}/restitution`, {});
            toast.succes('Équipement restitué au stock.');
            await load();
        } catch (err) {
            toast.erreur(err.response?.data?.message ?? 'Restitution impossible.');
        }
    };

    if (! items) return <SkeletonPage lignes={6} />;

    const colonnesRapport = [
        ['Agent', (a) => (a.agent ? `${a.agent.prenom} ${a.agent.nom_naiss}` : '—')],
        ['Matricule', (a) => a.agent?.matricule ?? ''],
        ['Équipement', (a) => a.equipement?.code_inventaire ?? ''],
        ['Désignation', (a) => a.equipement?.designation ?? ''],
        ['Début', (a) => formatDate(a.date_affectation) ?? ''],
        ['Fin', (a) => (a.date_fin ? formatDate(a.date_fin) : 'En cours')],
        ['Motif', 'motif'],
    ];

    const actives = items.filter((a) => ! a.date_fin);
    const passees = items.filter((a) => a.date_fin);

    return (
        <div className="anim-fade-up">
            <PageHeader
                title="Affectations"
                subtitle={`${actives.length} en cours · ${passees.length} terminée(s)`}
                actions={
                    <div className="flex items-center gap-2">
                        <BoutonRapport titre="Affectations" lignes={items} colonnes={colonnesRapport} disabled={! items?.length} />
                        <button onClick={() => setShowForm(true)} className="btn-moderne inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-sm">
                            <Plus size={15} /> Affecter un équipement
                        </button>
                    </div>
                }
            />

            <div className="bg-card rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Affectations en cours
                </div>
                <div className="divide-y divide-slate-100">
                    {actives.map((a, iRow) => (
                        <div key={a.id_affectation} className="anim-fade-up ligne-table p-4 flex items-center justify-between gap-3 hover:bg-blue-50/40 transition" style={{ animationDelay: `${Math.min(iRow * 50, 500)}ms` }}>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-400 flex items-center justify-center shrink-0">
                                    <ArrowLeftRight size={16} />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-800 text-sm truncate">
                                        {a.agent ? `${a.agent.prenom} ${a.agent.nom_naiss}` : '—'}
                                        <span className="text-slate-400 font-normal"> · {a.agent?.fonction}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        {a.equipement?.code_inventaire} — {a.equipement?.designation} · depuis le {formatDate(a.date_affectation)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => ficheAffectation(a)}
                                    title="Fiche PDF de cette affectation"
                                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200/50 bg-sky-50 hover:bg-sky-100 text-sky-600 hover:text-sky-700 text-xs font-semibold transition-colors"
                                >
                                    <FileDown size={13} /> Fiche
                                </button>
                                <button
                                    onClick={() => setDocTarget({ id: a.id_affectation, label: `${a.agent?.prenom ?? ''} ${a.agent?.nom_naiss ?? ''} — ${a.equipement?.code_inventaire ?? ''}` })}
                                    title="Documents de l'affectation (bon de remise, PV…)"
                                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200/50 bg-indigo-50 hover:bg-card-high text-indigo-400 hover:text-indigo-500 text-xs font-semibold transition-colors"
                                >
                                    <FileText size={13} /> Docs
                                </button>
                                <button
                                    onClick={() => restituer(a.id_affectation)}
                                title="Restituer au stock"
                                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300"
                            >
                                <Undo2 size={13} /> Restituer
                                </button>
                            </div>
                        </div>
                    ))}
                    {actives.length === 0 && <EmptyState icon={ArrowLeftRight} title="Aucune affectation active" />}
                </div>
            </div>

            {passees.length > 0 && (
                <div className="bg-card rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Historique
                    </div>
                    <div className="divide-y divide-slate-100">
                        {passees.map((a, iRow) => (
                            <div key={a.id_affectation} className="anim-fade-up p-3.5 flex items-center justify-between text-sm" style={{ animationDelay: `${Math.min(iRow * 35, 420)}ms` }}>
                                <div className="min-w-0">
                                    <span className="font-medium text-slate-700">{a.agent ? `${a.agent.prenom} ${a.agent.nom_naiss}` : '—'}</span>
                                    <span className="text-slate-500"> · {a.equipement?.code_inventaire}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                        {formatDate(a.date_affectation)} → {formatDate(a.date_fin)}
                                    </span>
                                    <button
                                        onClick={() => ficheAffectation(a)}
                                        title="Fiche PDF de cette affectation"
                                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-sky-200/50 bg-sky-50 hover:bg-sky-100 text-sky-600 hover:text-sky-700 text-[11px] font-semibold transition-colors"
                                    >
                                        <FileDown size={12} /> Fiche
                                    </button>
                                    <button
                                        onClick={() => supprimerAffectation(a)}
                                        title="Supprimer cette affectation de l'historique"
                                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-rose-200/50 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-[11px] font-semibold transition-colors"
                                    >
                                        <Trash2 size={12} /> Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modale création */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                            <h2 className="font-bold text-slate-800">Affecter un équipement</h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-700"><X size={18} /></button>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-3">
                            <ErrorText errors={errors} />
                            <Field label="Équipement" required>
                                <select required value={form.id_equipement} onChange={(e) => setForm({ ...form, id_equipement: e.target.value })} className={inputClass}>
                                    <option value="">Choisir un équipement…</option>
                                    {equipements.map((eq) => (
                                        <option key={eq.id_equipement} value={eq.id_equipement}>
                                            {eq.code_inventaire} — {eq.designation} ({eq.statut.replace('_', ' ')})
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Agent" required>
                                <select required value={form.id_agent} onChange={(e) => setForm({ ...form, id_agent: e.target.value })} className={inputClass}>
                                    <option value="">Choisir un agent…</option>
                                    {agents.map((ag) => (
                                        <option key={ag.id_agent} value={ag.id_agent}>
                                            {ag.prenom} {ag.nom_naiss} — {ag.matricule}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Date d'affectation" required>
                                <input type="date" required value={form.date_affectation} onChange={(e) => setForm({ ...form, date_affectation: e.target.value })} className={inputClass} />
                            </Field>
                            <Field label="Motif">
                                <input value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} className={inputClass} placeholder="Besoin de service…" />
                            </Field>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50">Annuler</button>
                                <button disabled={busy} className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-bold">
                                    {busy ? 'Affectation…' : 'Affecter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {docTarget && (
                <DocumentsModal
                    open
                    onClose={() => setDocTarget(null)}
                    documentableType="affectation"
                    documentableId={docTarget.id}
                    titre={docTarget.label}
                />
            )}
        </div>
    );
}
