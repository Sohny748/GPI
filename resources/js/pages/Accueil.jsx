import { useState } from 'react';
import {
    Users,
    Server,
    ShieldCheck,
    IdCard,
    Lock,
    Eye,
    EyeOff,
    Building2,
    ChevronDown,
    Key,
    ArrowRight,
    HelpCircle,
    Monitor,
} from 'lucide-react';

export default function Accueil() {
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('rh'); // 'rh' | 'itam'
    const [twoFA, setTwoFA] = useState(true);
    const [remember, setRemember] = useState(true);
    // const [matricule, setMatricule] = useState('RH-0419-MIL');
    const [password, setPassword] = useState('');
    const [entity, setEntity] = useState('daf');

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: appel API de connexion
        console.log({ matricule, password, entity, twoFA, remember, activeTab });
    };

    return (
        <div
            className="min-h-screen text-slate-800 flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white"
            style={{
                backgroundColor: '#0b1329',
                backgroundImage:
                    'radial-gradient(rgba(29,78,216,0.25) 1px, transparent 0), radial-gradient(rgba(37,99,235,0.15) 1px, #080e1e 0)',
                backgroundSize: '32px 32px',
                backgroundPosition: '0 0, 16px 16px',
            }}
        >
            {/* Bandeau institutionnel */}
            <header className="w-full bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30">
                <div className="h-1.5 w-full flex">
                    <div className="h-full w-1/3 bg-white" />
                    <div className="h-full w-1/3 bg-red-600" />
                    <div className="h-full w-1/3 bg-emerald-600" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
                            Système Sécurisé d'État
                        </span>
                        <span className="font-medium text-slate-400 hidden sm:inline">
                            REPOBLIKAN'I MADAGASIKARA • Fitiavana - Tanindrazana - Fandrosoana
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center text-emerald-400 text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                            Serveur Central Antananarivo : Opérationnel
                        </span>
                        <span className="text-slate-500 hidden md:inline">|</span>
                        <span className="text-slate-400 hidden md:inline text-xs font-mono">
                            TLS 1.3 • AES-256
                        </span>
                    </div>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-xl">

                    {/* Colonne gauche : branding institutionnel */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-slate-900/90 p-1.5 shadow-xl border border-blue-500/30 flex items-center justify-center ring-4 ring-blue-900/30">
                                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-blue-900 font-bold text-xs">
                                        DGSR
                                    </div>
                                </div>
                                <div>
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                        Ministère de tutelle
                                    </span>
                                    <h1 className="text-xl font-bold tracking-tight text-white leading-tight mt-1">
                                        DGSR MADAGASCAR
                                    </h1>
                                    <p className="text-xs text-blue-200/80 font-medium">
                                        Direction Générale de la Sécurité Routière
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 my-8">
                                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                                    Portail Intégré de Gestion Institutionnelle
                                </h2>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Plateforme centralisée réservée aux personnels assermentés,
                                    administratifs, techniques et corps de contrôle de la DGSR.
                                </p>

                                <div className="pt-4 space-y-3">
                                    <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                                        <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30">
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-200">
                                                Ressources Humaines &amp; Effectifs
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                Suivi des statuts civils et militaires (DAF / SRH), mutations,
                                                carrières et organigramme officiel.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                                            <Server size={16} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-200">
                                                Parc Informatique &amp; Infrastructure (ITAM)
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                Direction Technique (DT / SIT), parc machines des centres de
                                                réception technique (CRT) et CENSERO.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                            <div>
                                <span className="block text-slate-300 font-semibold">
                                    Support Sécurité SIT / DAF
                                </span>
                                <span className="text-slate-500">assistance-dsi@dgsr.mg</span>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 font-mono text-[10px]">
                                    <ShieldCheck size={12} className="text-amber-400 mr-1.5" /> V2.4.0 PROD
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Colonne droite : formulaire */}
                    <div className="lg:col-span-7 bg-white p-8 sm:p-12 flex flex-col justify-center relative">
                        <div className="max-w-md w-full mx-auto space-y-6">

                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-3">
                                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                                    Authentification Unique (SSO État)
                                </div>
                                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                    Connexion à votre compte
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Renseignez votre matricule ou identifiant de service pour accéder
                                    aux applications métiers.
                                </p>
                            </div>

                            {/* Sélecteur d'application */}
                            <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 text-xs font-semibold border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('rh')}
                                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                                        activeTab === 'rh'
                                            ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <span>Portail RH &amp; Postes</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('itam')}
                                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                                        activeTab === 'itam'
                                            ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Monitor size={14} className={activeTab === 'itam' ? 'text-blue-600' : 'text-slate-400'} />
                                    <span>Parc Informatique (ITAM)</span>
                                </button>
                            </div>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {/* Matricule */}
                                <div>
                                    <label
                                        htmlFor="matricule"
                                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex justify-between items-center"
                                    >
                                        <span>Téléphone ou E-mail Professionnel</span>
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <IdCard size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            id="matricule"
                                            // value={matricule}
                                            onChange={(e) => setMatricule(e.target.value)}
                                            placeholder="Entrez votre email ou téléphone"
                                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Mot de passe */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Mot de passe
                                        </label>
                                        <a href="#" className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline">
                                            Mot de passe oublié ?
                                        </a>
                                    </div>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            placeholder='............'
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Entité */}
                                <div>
                                    <label htmlFor="entity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Direction / Entité de rattachement
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Building2 size={16} />
                                        </div>
                                        <select
                                            id="entity"
                                            value={entity}
                                            onChange={(e) => setEntity(e.target.value)}
                                            className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-colors appearance-none cursor-pointer"
                                        >
                                            <option value="dg">Direction Générale (DG / DGA / CAB / PRMP / CAC)</option>
                                            <option value="daf">D.A.F - Direction Administrative et Financière (SRH, SFB, SCO)</option>
                                            <option value="dt">D.T - Direction Technique (SIT, SPEG, SS)</option>
                                            <option value="dor">D.O.R - Opérations Routières (SOCR, CENSERO, CRT, SSE, SRP)</option>
                                            <option value="ac">A.C - Agence Comptable (SCCG)</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>
                                </div>

                                {/* 2FA */}
                                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center space-x-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm shadow-sm">
                                            <Key size={14} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-blue-950">
                                                Sécurité 2FA &amp; Certificat Agent
                                            </div>
                                            <div className="text-[11px] text-blue-700">
                                                Clé OTP matériel ou validation mobile requise
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setTwoFA((v) => !v)}
                                        className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors ${
                                            twoFA ? 'bg-blue-600' : 'bg-slate-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                                                twoFA ? 'translate-x-4' : 'translate-x-0.5'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Mémoriser / assistance */}
                                <div className="flex items-center justify-between text-xs pt-1">
                                    <label className="flex items-center cursor-pointer text-slate-600 select-none">
                                        <input
                                            type="checkbox"
                                            checked={remember}
                                            onChange={(e) => setRemember(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 font-medium">Mémoriser ce poste sécurisé</span>
                                    </label>
                                    <a href="#" className="text-slate-500 hover:text-slate-800 flex items-center space-x-1">
                                        <HelpCircle size={12} />
                                        <span>Assistance agent</span>
                                    </a>
                                </div>

                                {/* Bouton de connexion */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-sm shadow-lg shadow-blue-700/25 flex items-center justify-center space-x-2 transition-all group"
                                    >
                                        <span>Accéder au Système DGSR</span>
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </form>

                            {/* Mentions légales */}
                            <div className="pt-4 border-t border-slate-100 text-center">
                                <p className="text-[11px] text-slate-400 leading-normal">
                                    Accès strictement réservé aux personnels habilités de la République
                                    de Madagascar. Tout accès non autorisé ou tentative d'intrusion fait
                                    l'objet de poursuites judiciaires conformément à la législation en
                                    vigueur.
                                </p>
                                <div className="mt-2 flex items-center justify-center space-x-3 text-[11px] text-slate-500 font-medium">
                                    <span>Mention légale</span>
                                    <span>•</span>
                                    <span>Charte informatique DGSR</span>
                                    <span>•</span>
                                    <span>Sécurité DGA/CAC</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Pied de page */}
            <footer className="w-full bg-slate-950/90 border-t border-slate-800/80 py-3 text-center text-xs text-slate-400">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-300">
                            Direction Générale de la Sécurité Routière (DGSR)
                        </span>
                        <span className="text-slate-600 hidden md:inline">—</span>
                        <span className="text-slate-400 hidden md:inline">Antananarivo, Madagascar</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                        © 2025 DGSR Madagascar • Tous droits réservés • Plateforme RH &amp; ITAM Unifiée
                    </div>
                </div>
            </footer>
        </div>
    );
}