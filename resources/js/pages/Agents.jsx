import { useEffect, useState } from 'react';
import { Search, Users, Plus, Pencil, FileDown, Trash2 } from 'lucide-react';
import { api } from '../api';
import { SkeletonPage, PageHeader, EmptyState, Badge, Field, inputClass, ErrorText, EditModal } from '../components/ui';
import { useToast, useConfirmation } from '../components/notifications';
import BoutonRapport from '../components/BoutonRapport';
import { ficheAgent } from '../lib/ficheElement';

const VIDE = {
    matricule: '', nom_naiss: '', prenom: '', sexe: 'M', fonction: '',
    telephone: '', email: '', date_embauche: '', statut: 'actif',
    id_direction: '', id_service: '',
};

export default function Agents() {
    const [agents, setAgents] = useState(null);
    const [referentiel, setReferentiel] = useState(null);
    const [q, setQ] = useState('');
    const [modal, setModal] = useState(null); // null | { mode, agent? }
    const [form, setForm] = useState(VIDE);
    const [errors, setErrors] = useState(null);
    const [busy, setBusy] = useState(false);
    const toast = useToast();
    const confirmer = useConfirmation();

    const colonnesRapport = [
        ['Matricule', 'matricule'],
        ['Nom', (a) => [a.prenom, a.nom_naiss].filter(Boolean).join(' ')],
        ['Sexe', 'sexe'],
        ['Fonction', 'fonction'],
        ['Direction', (a) => a.direction?.code_direction ?? ''],
        ['Service', (a) => a.service?.nom_service ?? ''],
        ['Téléphone', 'telephone'],
        ['Email', 'email'],
        ['Embauche', 'date_embauche'],
        ['Statut', 'statut'],
    ];

    const loadAgents = (query = '') => {
        const params = query ? { q: query } : {};
        return api.get('/agents', { params }).then(({ data }) => setAgents(data));
    };

    useEffect(() => {
        const t = setTimeout(() => { loadAgents(q); }, 250);
        return () => clearTimeout(t);
    }, [q]);

    useEffect(() => {
        api.get('/referentiel').then(({ data }) => setReferentiel(data));
    }, []);

    const servicesFiltres = (form.id_direction && referentiel?.services)
        ? referentiel.services.filter((s) => String(s.id_direction) === String(form.id_direction))
        : referentiel?.services ?? [];

    const ouvrirCreation = () => {
        setForm(VIDE);
        setErrors(null);
        setModal({ mode: 'create' });
    };

    const ouvrirEdition = (ag) => {
        setForm({
            matricule: ag.matricule ?? '',
            nom_naiss: ag.nom_naiss ?? '',
            prenom: ag.prenom ?? '',
            sexe: ag.sexe ?? 'M',
            fonction: ag.fonction ?? '',
            telephone: ag.telephone ?? '',
            email: ag.email ?? '',
            date_embauche: ag.date_embauche ?? '',
            statut: ag.statut ?? 'actif',
            id_direction: ag.id_direction ?? '',
            id_service: ag.id_service ?? '',
        });
        setErrors(null);
        setModal({ mode: 'edit', agent: ag });
    };

    const supprimerAgent = async (ag) => {
        const ok = await confirmer({
            titre: 'Supprimer cet agent ?',
            message: `« ${ag.prenom ?? ''} ${ag.nom_naiss ?? ''} » (${ag.matricule ?? '—'}) sera définitivement supprimé. Cette action est irréversible.`,
            danger: true,
            texteOK: 'Supprimer',
        });
        if (! ok) return;
        try {
            await api.delete(`/agents/${ag.id_agent}`);
            toast.succes('Agent supprimé.');
            await loadAgents(q);
        } catch (err) {
            toast.erreur(err.response?.data?.message ?? 'Suppression impossible (agent utilisé ailleurs).');
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors(null);
        try {
            const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]));
            if (modal?.mode === 'edit') {
                await api.put(`/agents/${modal.agent.id_agent}`, payload);
                toast.succes('Modifications enregistrées.');
            } else {
                await api.post('/agents', payload);
                toast.succes('Agent créé avec succès.');
            }
            setModal(null);
            await loadAgents(q);
        } catch (err) {
            setErrors(err.response?.data?.errors ?? { erreur: ['Enregistrement impossible.'] });
        } finally {
            setBusy(false);
        }
    };

    if (! agents) return <SkeletonPage lignes={6} />;

    return (
        <div className="anim-fade-up">
            <PageHeader
                title="Agents"
                subtitle={`${agents.length} agent(s) enregistré(s)`}
                actions={
                    <div className="flex items-center gap-2">
                        <BoutonRapport titre="Agents" lignes={agents ?? []} colonnes={colonnesRapport} disabled={! agents?.length} />
                        <button onClick={ouvrirCreation} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm shadow-blue-600/25">
                            <Plus size={15} /> Nouvel agent
                        </button>
                    </div>
                }
            />

            <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm p-3 mb-4">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par matricule, nom, fonction…" className={`${inputClass} pl-9`} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {agents.map((ag, iRow) => (
                    <div key={ag.id_agent} className="anim-fade-up lift bg-card rounded-2xl border border-slate-200/50 shadow-sm p-4 hover:shadow-md transition group" style={{ animationDelay: `${Math.min(iRow * 50, 500)}ms` }}>
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                                    {ag.prenom[0]}{ag.nom_naiss[0]}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-slate-800 text-sm truncate">{ag.prenom} {ag.nom_naiss}</div>
                                    <div className="text-[11px] text-slate-500 truncate">{ag.fonction ?? '—'}</div>
                                </div>
                            </div>
                            <Badge color={
                                ag.statut === 'actif' ? 'bg-vert-100 text-vert-400 border-vert-200'
                                : ag.statut === 'conge' ? 'bg-jaune-100 text-jaune-400 border-jaune-200'
                                : ag.statut === 'mutation' ? 'bg-blue-100 text-blue-300 border-blue-200' : 'bg-rose-100 text-rose-400 border-rose-200'
                            }>
                                {ag.statut}
                            </Badge>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                            <div className="flex justify-between"><span className="text-slate-400">Matricule</span><span className="font-mono font-semibold">{ag.matricule}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Service</span><span className="font-medium truncate max-w-[60%]">{ag.service?.nom_service ?? '—'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Direction</span><span className="font-medium">{ag.direction?.code_direction ?? '—'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Téléphone</span><span>{ag.telephone ?? '—'}</span></div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end gap-1.5">
                            <button
                                onClick={() => ficheAgent(ag)}
                                title="Fiche PDF individuelle de cet agent"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200/50 bg-sky-50 hover:bg-sky-100 text-sky-600 hover:text-sky-700 text-xs font-semibold transition-colors"
                            >
                                <FileDown size={13} /> Fiche
                            </button>
                            <button
                                onClick={() => ouvrirEdition(ag)}
                                title="Modifier cet agent"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200/50 bg-slate-100 hover:bg-card-high text-slate-600 hover:text-sky-400 text-xs font-semibold transition-colors"
                            >
                                <Pencil size={13} /> Modifier
                            </button>
                            <button
                                onClick={() => supprimerAgent(ag)}
                                title="Supprimer cet agent"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200/50 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold transition-colors"
                            >
                                <Trash2 size={13} /> Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {agents.length === 0 && <EmptyState icon={Users} title="Aucun agent trouvé" />}

            {/* Modale création / édition */}
            <EditModal
                open={!! modal}
                mode={modal?.mode}
                onClose={() => setModal(null)}
                onSubmit={submit}
                busy={busy}
                title={modal?.mode === 'edit' ? `Modifier — ${modal.agent.matricule}` : 'Nouvel agent'}
                width="max-w-xl"
            >
                <ErrorText errors={errors} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Matricule" required>
                        <input required value={form.matricule} onChange={(e) => setForm({ ...form, matricule: e.target.value })} className={inputClass} placeholder="AG-2026-001" />
                    </Field>
                    <Field label="Statut" required>
                        <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className={inputClass}>
                            <option value="actif">Actif</option>
                            <option value="inactif">Inactif</option>
                            <option value="conge">Congé</option>
                            <option value="mutation">Mutation</option>
                        </select>
                    </Field>
                    <Field label="Nom de naissance" required>
                        <input required value={form.nom_naiss} onChange={(e) => setForm({ ...form, nom_naiss: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Prénom" required>
                        <input required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Sexe" required>
                        <select value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })} className={inputClass}>
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </select>
                    </Field>
                    <Field label="Fonction">
                        <input value={form.fonction} onChange={(e) => setForm({ ...form, fonction: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Direction" required>
                        <select required value={form.id_direction} onChange={(e) => setForm({ ...form, id_direction: e.target.value, id_service: '' })} className={inputClass}>
                            <option value="">—</option>
                            {referentiel?.directions?.map((d) => (
                                <option key={d.id_direction} value={d.id_direction}>{d.code_direction} — {d.nom_direction}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Service">
                        <select value={form.id_service} onChange={(e) => setForm({ ...form, id_service: e.target.value })} className={inputClass}>
                            <option value="">—</option>
                            {servicesFiltres.map((s) => (
                                <option key={s.id_service} value={s.id_service}>{s.nom_service}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Téléphone">
                        <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Email">
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Date d'embauche">
                        <input type="date" value={form.date_embauche} onChange={(e) => setForm({ ...form, date_embauche: e.target.value })} className={inputClass} />
                    </Field>
                </div>
            </EditModal>
        </div>
    );
}
