import { useEffect, useState } from 'react';
import {
    UserCircle, ShieldCheck, Save, Eye, KeyRound, Building2, Mail,
    AtSign, ClipboardClock, IdCard, Loader2, CheckCircle2,
} from 'lucide-react';
import { api } from '../api';
import { PageHeader, Field, inputClass, ErrorText, Badge } from '../components/ui';
import { useAuth } from '../auth';
import { useToast } from '../components/notifications';
import { formatDate } from '../lib/constants';

/*
 * Mon profil — accessible depuis le bloc identité de la barre supérieure.
 * Deux volets :
 *  - Identité (lecture seule) : enregistrement agent + rôles système
 *  - Mon compte (modifiable) : identifiants de connexion et mot de passe
 *    (le changement de mot de passe exige le mot de passe actuel)
 */

const Ligne = ({ icon: Icon, label, valeur }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
        <Icon size={15} className="text-slate-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
            <div className="text-sm font-semibold text-slate-800 break-words">{valeur ?? '—'}</div>
        </div>
    </div>
);

export default function Profil() {
    const { user, refresh } = useAuth();
    const toast = useToast();

    // Compte : identifiants
    const [compte, setCompte] = useState({ username: '', email: '' });
    const [errsCompte, setErrsCompte] = useState(null);
    const [busyCompte, setBusyCompte] = useState(false);

    // Sécurité : changement de mot de passe
    const [mdp, setMdp] = useState({ mot_de_passe_actuel: '', mot_de_passe: '', mot_de_passe_confirmation: '' });
    const [errsMdp, setErrsMdp] = useState(null);
    const [busyMdp, setBusyMdp] = useState(false);

    const agent = user?.agent;
    const nom = agent ? `${agent.prenom ?? ''} ${agent.nom_naiss ?? ''}`.trim() : user?.username;
    const initiales = (nom ?? 'U').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
    const roles = user?.roles ?? [];
    const roleLabel = roles.map((r) => r.nom_role).join(', ') || '—';

    useEffect(() => {
        if (user) setCompte({ username: user.username ?? '', email: user.email ?? '' });
    }, [user?.id_utilisateur]);

    if (! user) return null;

    const soumettreCompte = async (e) => {
        e.preventDefault();
        setBusyCompte(true);
        setErrsCompte(null);
        try {
            const { data } = await api.put('/profil', {
                username: compte.username,
                email: compte.email,
            });
            await refresh();
            toast.succes(data.message ?? 'Profil mis à jour.');
        } catch (err) {
            setErrsCompte(err.response?.data?.errors ?? { erreur: [err.response?.data?.message ?? 'Modification impossible.'] });
        } finally {
            setBusyCompte(false);
        }
    };

    const soumettreMdp = async (e) => {
        e.preventDefault();
        setBusyMdp(true);
        setErrsMdp(null);
        try {
            const { data } = await api.put('/profil', mdp);
            setMdp({ mot_de_passe_actuel: '', mot_de_passe: '', mot_de_passe_confirmation: '' });
            await refresh();
            toast.succes(data.message ?? 'Mot de passe modifié.');
        } catch (err) {
            setErrsMdp(err.response?.data?.errors ?? { erreur: [err.response?.data?.message ?? 'Changement impossible.'] });
        } finally {
            setBusyMdp(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Mon profil"
                subtitle="Vos informations personnelles, vos identifiants de connexion et la sécurité du compte"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* Volet 1 : identité (lecture seule, issues du fichier agent) */}

                <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm p-5">

                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200/50">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-base font-bold shrink-0 shadow-lg shadow-blue-600/30">
                            {initiales}
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-bold text-slate-800 truncate">{nom ?? '—'}</h2>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {roles.map((r) => (
                                    <Badge key={r.id_role} color="bg-blue-100 text-blue-400 border-blue-200">
                                        {r.nom_role}
                                    </Badge>
                                ))}
                                <Badge color={user.actif
                                    ? 'bg-vert-100 text-vert-400 border-vert-200'
                                    : 'bg-rose-100 text-rose-400 border-rose-200'}
                                >
                                    {user.actif ? 'Compte actif' : 'Compte désactivé'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                        <IdCard size={15} className="text-sky-400" /> Identité
                    </h3>
                    <Ligne icon={IdCard} label="Matricule" valeur={agent?.matricule} />
                    <Ligne icon={UserCircle} label="Fonction" valeur={agent?.fonction} />
                    <Ligne icon={Building2} label="Service" valeur={agent?.service?.nom_service} />
                    <Ligne icon={Building2} label="Direction" valeur={agent?.service?.direction?.nom_direction} />
                    <Ligne icon={Mail} label="E-mail professionnel" valeur={agent?.email} />
                    <Ligne icon={ClipboardClock} label="Date d'embauche" valeur={formatDate(agent?.date_embauche)} />

                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mt-5 mb-2">
                        <ShieldCheck size={15} className="text-sky-400" /> Session
                    </h3>
                    <Ligne icon={AtSign} label="Identifiant de connexion" valeur={user.username} />
                    <Ligne icon={Mail} label="E-mail du compte" valeur={user.email} />
                    <Ligne icon={ClipboardClock} label="Dernière connexion" valeur={formatDate(user.dernier_connexion, true) !== '—' ? formatDate(user.dernier_connexion, true) : '—'} />
                </div>

                {/* Volet 2 : modifications (identifiants + mot de passe) */}
                <div className="space-y-6">
                    <form onSubmit={soumettreCompte} className="bg-card rounded-2xl border border-slate-200/50 shadow-sm p-5">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                            <AtSign size={15} className="text-sky-400" /> Mes identifiants de connexion
                        </h3>
                        <ErrorText errors={errsCompte} />
                        <div className="space-y-3">
                            <Field label="Identifiant (username)" required>
                                <input
                                    value={compte.username}
                                    onChange={(e) => setCompte({ ...compte, username: e.target.value })}
                                    className={inputClass}
                                    autoComplete="username"
                                />
                            </Field>
                            <Field label="E-mail de connexion" required>
                                <input
                                    type="email"
                                    value={compte.email}
                                    onChange={(e) => setCompte({ ...compte, email: e.target.value })}
                                    className={inputClass}
                                    autoComplete="email"
                                />
                            </Field>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={busyCompte}
                                className="btn-moderne inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-vert-600 hover:bg-vert-700 disabled:opacity-60 text-white text-sm font-bold shadow-sm shadow-vert-600/30"
                            >
                                {busyCompte ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                Enregistrer
                            </button>
                        </div>
                    </form>

                    <form onSubmit={soumettreMdp} className="bg-card rounded-2xl border border-slate-200/50 shadow-sm p-5">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-1">
                            <KeyRound size={15} className="text-sky-400" /> Changer mon mot de passe
                        </h3>
                        <p className="text-[11px] text-slate-500 mb-4">8 caractères minimum — le mot de passe actuel vous est demandé en garantie.</p>
                        <ErrorText errors={errsMdp} />
                        <div className="space-y-3">
                            <Field label="Mot de passe actuel">
                                <input
                                    type="password"
                                    value={mdp.mot_de_passe_actuel}
                                    onChange={(e) => setMdp({ ...mdp, mot_de_passe_actuel: e.target.value })}
                                    className={inputClass}
                                    autoComplete="current-password"
                                />
                            </Field>
                            <Field label="Nouveau mot de passe">
                                <input
                                    type="password"
                                    value={mdp.mot_de_passe}
                                    onChange={(e) => setMdp({ ...mdp, mot_de_passe: e.target.value })}
                                    className={inputClass}
                                    autoComplete="new-password"
                                    minLength={8}
                                />
                            </Field>
                            <Field label="Confirmer le nouveau mot de passe">
                                <input
                                    type="password"
                                    value={mdp.mot_de_passe_confirmation}
                                    onChange={(e) => setMdp({ ...mdp, mot_de_passe_confirmation: e.target.value })}
                                    className={inputClass}
                                    autoComplete="new-password"
                                />
                            </Field>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Eye size={11} /> Utilisé uniquement par le SIT — visible par personne.
                            </span>
                            <button
                                type="submit"
                                disabled={busyMdp}
                                className="btn-moderne inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold shadow-sm shadow-blue-600/30"
                            >
                                {busyMdp ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                                Changer le mot de passe
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
