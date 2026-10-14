import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Monitor, Users, LifeBuoy, ArrowLeftRight, Boxes,
    LogOut, Menu, X, ShieldCheck, Wifi, Lock, Settings,
    Building2, Network, MapPin, Building, Layers, Tags, Circle, Wrench,
    Truck, ShoppingCart, SlidersHorizontal, Ticket, ClipboardList, Package,
    GraduationCap,
} from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { useSettings } from '../settings';
import { useConfirmation } from './notifications';

const sections = [
    {
        label: null,
        items: [
            { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
        ],
    },
    {
        label: 'Organisation',
        items: [
            { to: '/directions', label: 'Directions', icon: Building2 },
            { to: '/services', label: 'Services', icon: Network },
            { to: '/agents', label: 'Agents', icon: Users },
        ],
    },
    {
        label: 'Localisation',
        items: [
            { to: '/sites', label: 'Sites', icon: MapPin },
            { to: '/batiments', label: 'Bâtiments', icon: Building },
            { to: '/localisations', label: 'Localisations', icon: Layers },
        ],
    },
    {
        label: 'Parc informatique',
        items: [
            { to: '/equipements', label: 'Équipements', icon: Monitor },
            { to: '/categories', label: 'Catégories', icon: Tags },
            { to: '/marques', label: 'Marques', icon: Circle },
            { to: '/modeles', label: 'Modèles', icon: Layers },
        ],
    },
    {
        label: 'Gestion',
        items: [
            { to: '/fournisseurs', label: 'Fournisseurs', icon: Truck },
            { to: '/achats', label: 'Achats', icon: ShoppingCart },
            { to: '/affectations', label: 'Affectations', icon: ArrowLeftRight },
        ],
    },
    {
        label: 'Maintenance',
        items: [
            { to: '/maintenances', label: 'Maintenances', icon: Wrench },
            { to: '/tickets', label: 'Tickets', icon: LifeBuoy },
        ],
    },
    {
        label: 'Autres',
        items: [
            { to: '/inventaires', label: 'Inventaires', icon: ClipboardList },
            { to: '/logiciels', label: 'Logiciels', icon: Package },
            { to: '/formations', label: 'Formations', icon: GraduationCap },
        ],
    },
    {
        label: 'Système',
        items: [
            { to: '/parametres', label: 'Paramètres', icon: Settings },
        ],
    },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const confirmer = useConfirmation();
    const nom = user?.agent ? `${user.agent.prenom} ${user.agent.nom_naiss}` : user?.username;

    /** Pop-up d'avertissement avant de vraiment se déconnecter. */
    const handleLogout = async () => {
        const ok = await confirmer({
            titre: 'Se déconnecter ?',
            message: `Vous allez fermer la session de ${nom ?? 'votre compte'}.\nVous devrez vous reconnecter pour accéder au système.`,
            texteOK: 'Se déconnecter',
            danger: true,
        });
        if (! ok) return;
        await logout();
        navigate('/connexion', { replace: true });
    };

    const roleLabel = user?.roles?.map((r) => r.nom_role).join(', ') || 'utilisateur';
    const replie = settings.sidebarRepliee && !open;
    const largeur = `var(--sidebar-w, ${settings.sidebarRepliee ? '76px' : settings.sidebarElargie ? '320px' : '288px'})`;

    const navLinkClass = ({ isActive }) =>
        `block rounded-lg text-[13px] transition-all active:scale-[.98] ${
            replie ? 'mx-auto w-9 text-center py-2.5' : 'px-3 py-1.5'
        } ${
            isActive
                ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30 anim-glow'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:pl-4'
        }`;

    return (
        <div className="min-h-screen text-slate-800 antialiased">
            {/* Sidebar (largeur configurable : 320px par défaut, 76px repliée) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-slate-900 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.35)] transition-all duration-200 lg:translate-x-0 ${
                    replie ? 'w-[76px]' : settings.sidebarElargie ? 'w-80' : 'w-72'
                } ${open ? 'translate-x-0 w-80' : '-translate-x-full'}`}
            >
                <div className="flex flex-col flex-1 min-h-0">
                    {/* Logo */}
                    <div className={`h-16 flex items-center bg-slate-950 border-b border-slate-200/60 shrink-0 ${replie ? 'px-3 justify-center' : 'px-5 gap-3'}`}>
                        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-[11px] shrink-0 shadow-lg shadow-blue-600/40">
                            DGSR
                        </div>
                        {! replie && (
                            <>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[15px] font-bold tracking-tight text-slate-800 truncate">
                                        DGSR
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-500 truncate">
                                        Parc Informatique
                                    </span>
                                </div>
                                <button className="lg:hidden ml-auto p-1 text-slate-400 hover:text-slate-800" onClick={() => setOpen(false)}>
                                    <X size={18} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Navigation par domaines */}
                    <nav className={`flex-1 overflow-y-auto py-3 space-y-3 ${replie ? 'px-2' : 'px-3'}`}>
                        {sections.map((section, i) => (
                            <div key={section.label ?? `s${i}`}>
                                {section.label && ! replie && (
                                    <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {section.label}
                                    </div>
                                )}
                                <div className="flex flex-col gap-0.5">
                                    {section.items.map(({ to, label, end }) => (
                                        <NavLink
                                            key={to}
                                            to={to}
                                            end={end}
                                            onClick={() => { setOpen(false); }}
                                            title={replie ? label : undefined}
                                            className={navLinkClass}
                                        >
                                            {! replie ? <span className="truncate">{label}</span> : label.slice(0, 2).toUpperCase()}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Statut réseau (signature Stitch) */}
                <div className={`p-4 bg-slate-950 border-t border-slate-200/60 flex items-center ${replie ? 'justify-center' : 'justify-between'}`}>
                    {replie ? (
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" title="Réseau DGSR Interne" />
                    ) : (
                        <>
                            <div className="flex items-center gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                                        Réseau DGSR Interne
                                    </span>
                                    <span className="text-[12px] font-mono text-slate-400">VLAN-04 // 10.14.0.0</span>
                                </div>
                            </div>
                            <Wifi size={16} className="text-slate-400" />
                        </>
                    )}
                </div>
            </aside>

            {/* Overlay mobile */}
            {open && <div className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden" onClick={() => setOpen(false)} />}

            {/* Topbar : recherche + session */}
            <header
                className="transition-all duration-200"
                style={{ paddingLeft: largeur }}
            >
                <div
                    className="fixed top-0 right-0 z-30 h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 px-4 lg:px-6 flex items-center justify-between gap-3 transition-all duration-200"
                    style={{ left: largeur }}
                >
                    <div className="flex items-center">
                        <button className="btn-moderne lg:hidden p-1.5 -ml-1.5 text-slate-400 hover:text-slate-800" onClick={() => setOpen(true)}>
                            <Menu size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 anim-fade-in">
                            <Lock size={14} className="text-sky-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                                Confidentiel Défense
                            </span>
                        </div>
                        {/* Profil cliquable : ouverture de la page « Mon profil » (voir + modifier) */}
                        <Link
                            to="/profil"
                            title="Voir et modifier mon profil"
                            className="hidden sm:flex items-center gap-2.5 rounded-xl p-1.5 pr-2.5 -my-1 hover:bg-slate-100 active:scale-[.98] transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col text-right leading-tight">
                                <span className="text-[11px] font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{nom}</span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{roleLabel}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0 ring-2 ring-transparent group-hover:ring-blue-400/60 transition-all group-hover:scale-105">
                                {(nom ?? 'U').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            title="Se déconnecter"
                            className="btn-moderne p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-100/60"
                        >
                            <LogOut size={17} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenu — au-dessus du fond d'écran (z-10 > z-0) */}
            <div style={{ paddingLeft: largeur }} className="relative z-10 pt-16 transition-all duration-200">
                <main key={location.pathname} className={`anim-fade-up max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 ${settings.densite === 'spacieuse' ? 'py-8 text-[14px]' : settings.densite === 'compacte' ? 'py-4 text-[13px]' : 'py-6'}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
