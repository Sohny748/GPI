import { useCallback, useEffect, useState } from 'react';
import { Search, Plus, LifeBuoy, X, Send, Pencil, FileText, FileDown, Trash2 } from 'lucide-react';
import { api } from '../api';
import { SkeletonPage, PageHeader, EmptyState, Badge, Field, inputClass, ErrorText, EditModal } from '../components/ui';
import { useToast, useConfirmation } from '../components/notifications';
import { PRIORITES, STATUTS_TICKET, formatDate } from '../lib/constants';
import BoutonRapport from '../components/BoutonRapport';
import DocumentsModal from '../components/DocumentsModal';
import { ficheTicket } from '../lib/ficheElement';

export default function Tickets() {
    const [tickets, setTickets] = useState(null);
    const [equipements, setEquipements] = useState([]);
    const [agents, setAgents] = useState([]);
    const [q, setQ] = useState('');
    const [statut, setStatut] = useState('');
    const [modal, setModal] = useState(null); // null | { mode, ticket? }
    const [selected, setSelected] = useState(null);
    const [commentaire, setCommentaire] = useState('');
    const [form, setForm] = useState({ titre: '', description: '', priorite: 'moyenne', statut: 'ouvert', id_equipement: '', id_agent: '' });
    const [errors, setErrors] = useState(null);
    const [busy, setBusy] = useState(false);
    const toast = useToast();
    const confirmer = useConfirmation();
    const [docTarget, setDocTarget] = useState(null);

    const colonnesRapport = [
        ['Référence', 'reference_ticket'],
        ['Titre', 'titre'],
        ['Priorité', (t) => PRIORITES[t.priorite]?.label ?? t.priorite],
        ['Statut', (t) => STATUTS_TICKET[t.statut]?.label ?? t.statut],
        ['Équipement', (t) => t.equipement?.code_inventaire ?? ''],
        ['Déclarant', (t) => (t.agent ? `${t.agent.prenom} ${t.agent.nom_naiss}` : '')],
        ['Créé le', (t) => formatDate(t.date_creation) ?? ''],
    ];

    const load = useCallback(async () => {
        const params = Object.fromEntries(Object.entries({ q, statut }).filter(([, v]) => v !== ''));
        const { data } = await api.get('/tickets', { params });
        setTickets(data);
    }, [q, statut]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        api.get('/equipements', { params: { per_page: 100 } }).then(({ data }) => setEquipements(data.data));
        api.get('/agents').then(({ data }) => setAgents(data));
    }, []);

    const ouvrirCreation = () => {
        setForm({ titre: '', description: '', priorite: 'moyenne', statut: 'ouvert', id_equipement: '', id_agent: '' });
        setErrors(null);
        setModal({ mode: 'create' });
    };

    const ouvrirEdition = (t) => {
        setForm({
            titre: t.titre ?? '',
            description: t.description ?? '',
            priorite: t.priorite ?? 'moyenne',
            statut: t.statut ?? 'ouvert',
            id_equipement: t.id_equipement ?? '',
            id_agent: t.id_agent ?? '',
        });
        setErrors(null);
        setModal({ mode: 'edit', ticket: t });
    };

    const supprimerTicket = async (t) => {
        const ok = await confirmer({
            titre: 'Supprimer ce ticket ?',
            message: `« ${t.reference_ticket ?? '#' + t.id_ticket} — ${t.titre ?? ''} » sera définitivement supprimé. Cette action est irréversible.`,
            danger: true,
            texteOK: 'Supprimer',
        });
        if (! ok) return;
        try {
            await api.delete(`/tickets/${t.id_ticket}`);
            toast.succes('Ticket supprimé.');
            await load();
        } catch (err) {
            toast.erreur(err.response?.data?.message ?? 'Suppression impossible.');
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors(null);
        try {
            const payload = {
                ...form,
                id_equipement: form.id_equipement || null,
                id_agent: form.id_agent || null,
            };
            if (modal?.mode === 'edit') {
                await api.put(`/tickets/${modal.ticket.id_ticket}`, payload);
                toast.succes('Modifications enregistrées.');
            } else {
                await api.post('/tickets', payload);
                toast.succes('Ticket créé avec succès.');
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

    const changeStatut = async (id, newStatut) => {
        await api.put(`/tickets/${id}`, { statut: newStatut });
        await load();
        if (selected?.id_ticket === id) setSelected({ ...selected, statut: newStatut });
    };

    const addCommentaire = async (e) => {
        e.preventDefault();
        if (! commentaire.trim()) return;
        const { data } = await api.post(`/tickets/${selected.id_ticket}/commentaires`, { contenu: commentaire });
        setSelected({ ...selected, commentaires: [...(selected.commentaires ?? []), data] });
        setCommentaire('');
    };

    if (! tickets) return <SkeletonPage lignes={6} />;

    return (
        <div className="anim-fade-up">
            <PageHeader
                title="Tickets d'assistance"
                subtitle={`${tickets.length} ticket(s)`}
                actions={
                    <div className="flex items-center gap-2">
                        <BoutonRapport titre="Tickets d'assistance" lignes={tickets ?? []} colonnes={colonnesRapport} disabled={! tickets?.length} />
                        <button onClick={ouvrirCreation} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm shadow-blue-600/25">
                            <Plus size={15} /> Nouveau ticket
                        </button>
                    </div>
                }
            />

            <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm p-3 mb-4 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un ticket…" className={`${inputClass} pl-9`} />
                </div>
                <select value={statut} onChange={(e) => setStatut(e.target.value)} className={`${inputClass} sm:w-44`}>
                    <option value="">Tous les statuts</option>
                    {Object.entries(STATUTS_TICKET).map(([k, m]) => (
                        <option key={k} value={k}>{m.label}</option>
                    ))}
                </select>
            </div>

            <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {tickets.map((t, iRow) => (
                        <div key={t.id_ticket} className="anim-fade-up ligne-table p-4 hover:bg-blue-50/30 transition flex items-start justify-between gap-3" style={{ animationDelay: `${Math.min(iRow * 35, 420)}ms` }}>
                            <div className="min-w-0 cursor-pointer flex-1" onClick={() => setSelected(t)}>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-blue-300">{t.reference_ticket}</span>
                                    <Badge color={PRIORITES[t.priorite]?.color}>{PRIORITES[t.priorite]?.label}</Badge>
                                    <Badge color={STATUTS_TICKET[t.statut]?.color}>{STATUTS_TICKET[t.statut]?.label}</Badge>
                                </div>
                                <div className="font-semibold text-slate-800 mt-1">{t.titre}</div>
                                <div className="text-[11px] text-slate-500">
                                    {t.equipement ? `${t.equipement.code_inventaire} · ` : ''}
                                    {t.agent ? `${t.agent.prenom} ${t.agent.nom_naiss} · ` : ''}
                                    créé le {formatDate(t.date_creation)}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => ficheTicket(t)}
                                    title="Fiche PDF de ce ticket"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200/50 bg-sky-50 hover:bg-sky-100 text-sky-600 hover:text-sky-700 text-xs font-semibold transition-colors"
                                >
                                    <FileDown size={13} /> Fiche
                                </button>
                                <button
                                    onClick={() => setDocTarget({ id: t.id_ticket, label: t.reference_ticket })}
                                    title="Pièces jointes (PDF, images…)"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200/50 bg-indigo-50 hover:bg-card-high text-indigo-400 hover:text-indigo-500 text-xs font-semibold transition-colors"
                                >
                                    <FileText size={13} /> Pièces
                                </button>
                                <button
                                    onClick={() => ouvrirEdition(t)}
                                    title="Modifier ce ticket"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200/50 bg-slate-100 hover:bg-card-high text-slate-600 hover:text-sky-400 text-xs font-semibold transition-colors"
                                >
                                    <Pencil size={13} /> Modifier
                                </button>
                                <button
                                    onClick={() => supprimerTicket(t)}
                                    title="Supprimer ce ticket"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200/50 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold transition-colors"
                                >
                                    <Trash2 size={13} /> Supprimer
                                </button>
                                <select
                                    value={t.statut}
                                    onChange={(e) => changeStatut(t.id_ticket, e.target.value)}
                                    title="Changer le statut"
                                    className="text-xs border border-slate-200/50 rounded-lg px-2 py-1.5 bg-card-high text-slate-700"
                                >
                                    {Object.entries(STATUTS_TICKET).map(([k, m]) => (
                                        <option key={k} value={k}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                    {tickets.length === 0 && <EmptyState icon={LifeBuoy} title="Aucun ticket" hint="Créez le premier ticket d'assistance." />}
                </div>
            </div>

            {/* Modale création / édition */}
            <EditModal
                open={!! modal}
                mode={modal?.mode}
                onClose={() => setModal(null)}
                onSubmit={submit}
                busy={busy}
                title={modal?.mode === 'edit' ? `Modifier — ${modal.ticket.reference_ticket}` : 'Nouveau ticket'}
                width="max-w-lg"
            >
                <ErrorText errors={errors} />
                <div className="space-y-3">
                    <Field label="Titre" required>
                        <input required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Description">
                        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Priorité" required>
                            <select value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value })} className={inputClass}>
                                {Object.entries(PRIORITES).map(([k, m]) => (
                                    <option key={k} value={k}>{m.label}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Statut">
                            <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className={inputClass}>
                                {Object.entries(STATUTS_TICKET).map(([k, m]) => (
                                    <option key={k} value={k}>{m.label}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Équipement">
                            <select value={form.id_equipement} onChange={(e) => setForm({ ...form, id_equipement: e.target.value })} className={inputClass}>
                                <option value="">—</option>
                                {equipements.map((eq) => (
                                    <option key={eq.id_equipement} value={eq.id_equipement}>{eq.code_inventaire} — {eq.designation}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Agent déclarant">
                            <select value={form.id_agent} onChange={(e) => setForm({ ...form, id_agent: e.target.value })} className={inputClass}>
                                <option value="">—</option>
                                {agents.map((ag) => (
                                    <option key={ag.id_agent} value={ag.id_agent}>{ag.prenom} {ag.nom_naiss}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </div>
            </EditModal>

            {docTarget && (
                <DocumentsModal
                    open
                    onClose={() => setDocTarget(null)}
                    documentableType="ticket"
                    documentableId={docTarget.id}
                    titre={docTarget.label}
                />
            )}

            {/* Modale détail */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col border border-slate-200/50">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50">
                            <div>
                                <div className="font-mono text-xs font-bold text-blue-300">{selected.reference_ticket}</div>
                                <h2 className="font-bold text-slate-800">{selected.titre}</h2>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => { ouvrirEdition(selected); setSelected(null); }}
                                    title="Modifier ce ticket"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200/50 bg-slate-100 hover:bg-card-high text-slate-600 hover:text-sky-400 text-xs font-semibold transition-colors"
                                >
                                    <Pencil size={13} /> Modifier
                                </button>
                                <button onClick={() => setSelected(null)} className="p-1.5 text-slate-400 hover:text-slate-800"><X size={18} /></button>
                            </div>
                        </div>
                        <div className="p-5 overflow-y-auto space-y-4 flex-1">
                            {selected.description && <p className="text-sm text-slate-600">{selected.description}</p>}
                            <div className="flex gap-2 flex-wrap">
                                <Badge color={PRIORITES[selected.priorite]?.color}>Priorité {PRIORITES[selected.priorite]?.label}</Badge>
                                <Badge color={STATUTS_TICKET[selected.statut]?.color}>{STATUTS_TICKET[selected.statut]?.label}</Badge>
                                <Badge>Clôturé le {formatDate(selected.date_cloture) === '—' ? '—' : formatDate(selected.date_cloture)}</Badge>
                            </div>
                            <div className="border-t border-slate-100 pt-3">
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Commentaires ({selected.commentaires?.length ?? 0})</h4>
                                <div className="space-y-2">
                                    {selected.commentaires?.map((c) => (
                                        <div key={c.id_commentaire} className="rounded-xl bg-slate-50 border border-slate-200/50 p-3">
                                            <div className="text-xs font-bold text-slate-700">{c.utilisateur?.username ?? 'Système'}</div>
                                            <p className="text-sm text-slate-600">{c.contenu}</p>
                                        </div>
                                    ))}
                                    {(selected.commentaires?.length ?? 0) === 0 && <p className="text-xs text-slate-500">Aucun commentaire.</p>}
                                </div>
                            </div>
                        </div>
                        <form onSubmit={addCommentaire} className="p-4 border-t border-slate-200/50 flex gap-2">
                            <input
                                value={commentaire}
                                onChange={(e) => setCommentaire(e.target.value)}
                                placeholder="Ajouter un commentaire…"
                                className={inputClass}
                            />
                            <button className="shrink-0 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                                <Send size={15} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
