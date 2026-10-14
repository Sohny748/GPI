import { useCallback, useEffect, useState } from 'react';
import {
    Search, Plus, GraduationCap, X, Pencil, Trash2, Users, Loader2, Check, FileDown,
} from 'lucide-react';
import { api } from '../api';
import { formatDate } from '../lib/constants';
import { genererRapport } from '../lib/rapport';
import { PageHeader, Badge, EmptyState, Field, inputClass, ErrorText, EditModal } from '../components/ui';
import { useToast, useConfirmation } from '../components/notifications';

const STATUTS = {
    planifiee: { label: 'Planifiée', color: 'bg-sky-100 text-sky-400 border-sky-200' },
    en_cours: { label: 'En cours', color: 'bg-orange-100 text-orange-400 border-orange-200' },
    terminee: { label: 'Terminée', color: 'bg-vert-100 text-vert-400 border-vert-200' },
    annulee: { label: 'Annulée', color: 'bg-rose-100 text-rose-400 border-rose-200' },
};

const MODALITES = { presentiel: 'Présentiel', distanciel: 'Distanciel', hybride: 'Hybride' };
const STATUTS_PART = { inscrit: 'Inscrit', present: 'Présent', absent: 'Absent', valide: 'Validé' };
const VIDE = {
    titre: '', theme: '', description: '', formateur: '', organisme: '', lieu: '',
    modalite: 'presentiel', date_debut: '', date_fin: '', duree_heures: '',
    statut: 'planifiee', id_equipement: '',
};

export default function Formations() {
    const toast = useToast();
    const confirmer = useConfirmation();
    const [items, setItems] = useState(null);
    const [equipements, setEquipements] = useState([]);
    const [agents, setAgents] = useState([]);
    const [q, setQ] = useState('');
    const [statutFiltre, setStatutFiltre] = useState('');
    const [modal, setModal] = useState(null); // null | { mode, formation? }
    const [form, setForm] = useState(VIDE);
    const [errors, setErrors] = useState(null);
    const [busy, setBusy] = useState(false);
    const [selected, setSelected] = useState(null); // formation affichée (participants)

    const load = useCallback(async () => {
        const params = Object.fromEntries(Object.entries({ q, statut: statutFiltre }).filter(([, v]) => v !== ''));
        const { data } = await api.get('/formations', { params });
        setItems(data);
    }, [q, statutFiltre]);

    useEffect(() => {
        const t = setTimeout(() => { load(); }, 250);
        return () => clearTimeout(t);
    }, [load]);

    useEffect(() => {
        api.get('/formations-ref/equipements').then(({ data }) => setEquipements(data));
        api.get('/formations-ref/agents').then(({ data }) => setAgents(data));
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors(null);
        try {
            const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]));
            if (modal?.mode === 'edit') {
                await api.put(`/formations/${modal.formation.id_formation}`, payload);
            } else {
                await api.post('/formations', payload);
            }
            setModal(null);
            
            await load();
        } catch (err) {
            setErrors(err.response?.data?.errors ?? { erreur: ['Enregistrement impossible.'] });
            } finally {
            setBusy(false);
        }
    };

    const supprimer = async (f) => {
        if (! await confirmer({
            titre: 'Supprimer cette formation ?',
            message: `« ${f.titre} » et sa liste de participants seront définitivement supprimés.`,
            danger: true,
            texteOK: 'Supprimer',
        })) return;
        await api.delete(`/formations/${f.id_formation}`);
        toast.succes('Formation supprimée.');
        await load();
    };

    if (! items) return <div className="flex items-center justify-center py-24 text-slate-500"><Loader2 size={26} className="animate-spin" /></div>;

    const colonnesRapport = [
        ['Titre', 'titre'],
        ['Thème', (f) => f.theme ?? ''],
        ['Équipement', (f) => (f.equipement ? `${f.equipement.code_inventaire} — ${f.equipement.designation}` : 'Général')],
        ['Formateur', (f) => f.formateur ?? ''],
        ['Organisme', (f) => f.organisme ?? ''],
        ['Modalité', (f) => MODALITES[f.modalite] ?? f.modalite],
        ['Début', (f) => formatDate(f.date_debut) ?? ''],
        ['Fin', (f) => formatDate(f.date_fin) ?? ''],
        ['Durée (h)', (f) => f.duree_heures ?? ''],
        ['Statut', (f) => STATUTS[f.statut]?.label ?? f.statut],
        ['Participants', (f) => (f.participants?.length ? `${f.participants.filter((p) => p.statut === 'valide').length}/${f.participants.length} validé(s)` : '')],
    ];

    return (
        <div className="anim-fade-up">
            <PageHeader
                title="Formations"
                subtitle={`${items.length} session(s) de formation`}
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => genererRapport({
                                titre: 'Formations',
                                sousTitre: `${items.length} session(s)`,
                                colonnes: colonnesRapport.map(([label, val]) => ({ label, valeur: typeof val === 'function' ? val : (f) => f[val] ?? '' })),
                                lignes: items,
                                synthese: `${items.length} formation(s) — ${items.reduce((s, f) => s + (f.participants?.length ?? 0), 0)} participation(s)`,
                            })}
                            disabled={! items.length}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-[.97] text-white text-sm font-bold shadow-sm shadow-sky-600/25 transition-all disabled:opacity-50"
                        >
                            <FileDown size={15} /> Rapport PDF
                        </button>
                        <button
                            onClick={() => { setForm(VIDE); setErrors(null); setModal({ mode: 'create' }); }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-vert-600 hover:bg-vert-700 active:scale-[.97] text-white text-sm font-bold shadow-sm shadow-vert-600/30 transition-all"
                        >
                            <Plus size={15} /> Nouvelle formation
                        </button>
                    </div>
                }
            />

            {/* Filtres */}
            <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm p-3 mb-4 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par titre, thème, formateur, organisme…" className={`${inputClass} pl-9`} />
                </div>
                <select value={statutFiltre} onChange={(e) => setStatutFiltre(e.target.value)} className={`${inputClass} sm:w-44`}>
                    <option value="">Tous les statuts</option>
                    {Object.entries(STATUTS).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
                </select>
            </div>

            {/* Cartes */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map((f, i) => (
                    <div
                        key={f.id_formation}
                        className="anim-fade-up lift bg-card rounded-2xl border border-slate-200/50 shadow-sm p-4 hover:shadow-md transition group"
                        style={{ animationDelay: `${Math.min(i * 35, 300)}ms` }}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-vert-100 text-vert-400 flex items-center justify-center shrink-0">
                                    <GraduationCap size={19} />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-slate-800 text-sm truncate">{f.titre}</div>
                                    <div className="text-[11px] text-slate-500 truncate">{f.theme ?? 'Formation'}</div>
                                </div>
                            </div>
                            <Badge color={STATUTS[f.statut]?.color}>{STATUTS[f.statut]?.label ?? f.statut}</Badge>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                            {f.equipement && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Équipement</span>
                                    <span className="font-mono font-semibold text-blue-300">{f.equipement.code_inventaire}</span>
                                </div>
                            )}
                            <div className="flex justify-between"><span className="text-slate-400">Formateur</span><span className="font-medium truncate max-w-[60%]">{f.formateur ?? '—'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Dates</span><span>{formatDate(f.date_debut)}{f.date_fin ? ` → ${formatDate(f.date_fin)}` : ''}</span></div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Participants</span>
                                <span className="inline-flex items-center gap-1 font-semibold">
                                    <Users size={12} /> {f.participants?.length ?? 0}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end gap-1.5">
                            <button
                                onClick={() => setSelected(f)}
                                title="Gérer les participants et la validation"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-vert-200/60 bg-vert-100 hover:bg-vert-200 active:scale-[.95] text-vert-400 text-xs font-semibold transition-all"
                            >
                                <Users size={13} /> Participants
                            </button>
                            <button
                                onClick={() => {
                                    setForm({
                                        ...VIDE,
                                        ...Object.fromEntries(Object.entries(f).filter(([k]) => k in VIDE).map(([k, v]) => [k, v ?? ''])),
                                        date_debut: f.date_debut ? String(f.date_debut).slice(0, 10) : '',
                                        date_fin: f.date_fin ? String(f.date_fin).slice(0, 10) : '',
                                        id_equipement: f.id_equipement ?? '',
                                    });
                                    setErrors(null);
                                    setModal({ mode: 'edit', formation: f });
                                    }}
                                title="Modifier"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-orange-200/60 bg-orange-100 hover:bg-orange-200 active:scale-[.95] text-orange-400 text-xs font-semibold transition-all"
                            >
                                <Pencil size={13} /> Modifier
                            </button>
                            <button
                                onClick={() => supprimer(f)}
                                title="Supprimer"
                                className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-rose-200/60 bg-rose-100 hover:bg-rose-200 active:scale-[.95] text-rose-400 text-xs font-semibold transition-all"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && <EmptyState icon={GraduationCap} title="Aucune formation" hint="Créez la première session de formation." />}

            {/* Modale création / édition */}
            <EditModal
                open={!! modal}
                mode={modal?.mode}
                onClose={() => setModal(null)}
                onSubmit={submit}
                busy={busy}
                title={modal?.mode === 'edit' ? `Modifier — ${modal.formation.titre}` : 'Nouvelle formation'}
                width="max-w-xl"
            >
                <ErrorText errors={errors} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Titre" required>
                        <input required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className={inputClass} placeholder="Prise en main des imprimantes réseau" />
                    </Field>
                    <Field label="Thème">
                        <input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} className={inputClass} placeholder="Maintenance niveau 1" />
                    </Field>
                    <Field label="Équipement concerné">
                        <select value={form.id_equipement} onChange={(e) => setForm({ ...form, id_equipement: e.target.value })} className={inputClass}>
                            <option value="">— Général (toute la flotte) —</option>
                            {equipements.map((eq) => (
                                <option key={eq.id_equipement} value={eq.id_equipement}>{eq.code_inventaire} — {eq.designation}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Modalité" required>
                        <select value={form.modalite} onChange={(e) => setForm({ ...form, modalite: e.target.value })} className={inputClass}>
                            {Object.entries(MODALITES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                        </select>
                    </Field>
                    <Field label="Formateur">
                        <input value={form.formateur} onChange={(e) => setForm({ ...form, formateur: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Organisme">
                        <input value={form.organisme} onChange={(e) => setForm({ ...form, organisme: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Lieu">
                        <input value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Durée (heures)">
                        <input type="number" min="1" value={form.duree_heures} onChange={(e) => setForm({ ...form, duree_heures: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Date de début" required>
                        <input type="date" required value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Date de fin">
                        <input type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Statut" required>
                        <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className={inputClass}>
                            {Object.entries(STATUTS).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
                        </select>
                    </Field>
                    <div className="sm:col-span-2">
                        <Field label="Description">
                            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
                        </Field>
                    </div>
                </div>
            </EditModal>

            {selected && (
                <ParticipantsModal
                    formation={selected}
                    agents={agents}
                    onClose={() => setSelected(null)}
                    onChanged={load}
                />
            )}
        </div>
    );
}

/* ---------- Modale participants ---------- */

function ParticipantsModal({ formation, agents, onClose, onChanged }) {
    const [parts, setParts] = useState(formation.participants ?? []);
    const [agentId, setAgentId] = useState('');
    const [busy, setBusy] = useState(false);
    const [erreur, setErreur] = useState(null);
    const toast = useToast();
    const confirmer = useConfirmation();

    const dejaInscrits = new Set(parts.map((p) => p.id_agent ?? p.agent?.id_agent));
    const disponibles = agents.filter((a) => ! dejaInscrits.has(a.id_agent));

    const recharger = async () => {
        const { data } = await api.get(`/formations/${formation.id_formation}`);
        setParts(data.participants ?? []);
        onChanged();
    };

    const ajouter = async () => {
        if (! agentId) return;
        setBusy(true);
        setErreur(null);
        try {
            await api.post(`/formations/${formation.id_formation}/participants`, { id_agent: agentId });
            
            setAgentId('');
            await recharger();
        } catch (err) {
            setErreur(err.response?.data?.message ?? 'Ajout impossible.');
            } finally {
            setBusy(false);
        }
    };

    const changerStatut = async (p, statut) => {
        await api.put(`/formations/${formation.id_formation}/participants/${p.id_participant}`, { statut, note: p.note });
        
        await recharger();
    };

    const retirer = async (p) => {
        if (! await confirmer({
            titre: 'Retirer ce participant ?',
            message: `${p.agent?.prenom ?? ''} ${p.agent?.nom_naiss ?? ''} ne sera plus inscrit à cette formation.`,
            danger: true,
            texteOK: 'Retirer',
        })) return;
        await api.delete(`/formations/${formation.id_formation}/participants/${p.id_participant}`);
        toast.succes('Participant retiré.');
        await recharger();
    };

    const valides = parts.filter((p) => p.statut === 'valide').length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 gpi-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <div
                className="gpi-pop relative w-full max-w-lg bg-card rounded-2xl border border-slate-200/50 shadow-2xl max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50">
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            <Users size={16} className="text-vert-400" /> Participants — {formation.titre}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{valides} validé(s) sur {parts.length} inscrit(s)</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X size={16} /></button>
                </div>

                <div className="overflow-y-auto px-5 py-4 flex-1 space-y-2">
                    {parts.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">Aucun participant. Ajoutez les agents formés ci-dessous.</p>}
                    {parts.map((p, i) => (
                        <div
                            key={p.id_participant}
                            className="anim-fade-up flex items-center gap-2.5 rounded-xl border border-slate-200/50 bg-slate-50 p-2.5"
                            style={{ animationDelay: `${Math.min(i * 45, 250)}ms` }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {(p.agent?.prenom?.[0] ?? '') + (p.agent?.nom_naiss?.[0] ?? '')}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-slate-800 truncate">{p.agent?.prenom} {p.agent?.nom_naiss}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{p.agent?.matricule}</div>
                            </div>
                            <select
                                value={p.statut}
                                onChange={(e) => changerStatut(p, e.target.value)}
                                className={`text-xs border rounded-lg px-2 py-1.5 font-semibold ${
                                    p.statut === 'valide' ? 'bg-vert-100 text-vert-400 border-vert-200'
                                    : p.statut === 'present' ? 'bg-sky-100 text-sky-400 border-sky-200'
                                    : p.statut === 'absent' ? 'bg-rose-100 text-rose-400 border-rose-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                            >
                                {Object.entries(STATUTS_PART).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                            </select>
                            <button onClick={() => retirer(p)} title="Retirer" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-100 transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="px-5 py-4 border-t border-slate-200/50">
                    {erreur && <div className="mb-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-500 text-sm p-2.5">{erreur}</div>}
                    <div className="flex gap-2">
                        <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200/70 bg-card text-sm text-slate-700">
                            <option value="">Choisir un agent…</option>
                            {disponibles.map((a) => (
                                <option key={a.id_agent} value={a.id_agent}>{a.prenom} {a.nom_naiss} ({a.matricule})</option>
                            ))}
                        </select>
                        <button
                            onClick={ajouter}
                            disabled={busy || ! agentId}
                            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-vert-600 hover:bg-vert-700 active:scale-[.97] text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                        >
                            {busy ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Inscrire</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
