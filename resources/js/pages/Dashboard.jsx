import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Monitor, LifeBuoy, ArrowLeftRight, Wrench, Boxes, BadgeAlert,
    TrendingUp, ArrowRight, CircleDollarSign, ShoppingCart, Activity,
} from 'lucide-react';
import { api } from '../api';
import { Spinner, PageHeader } from '../components/ui';
import { STATUTS_EQUIPEMENT, STATUTS_ACHAT, formatDate, formatAr } from '../lib/constants';
import { useCompteur } from '../lib/useCompteur';
import BoutonRapport from '../components/BoutonRapport';

const ICONS = {
    Ordinateur: Monitor,
    Imprimante: Wrench,
    'Équipement réseau': TrendingUp,
};

/* Carte KPI avec compteur animé + pulse sur l'icône */
function CarteKPI({ label, value, icon: Icon, accent, iconText, to, suffix }) {
    const compte = useCompteur(value);
    return (
        <Link
            to={to}
            className="anim-fade-up bg-card rounded-xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-200 group"
        >
            <div className={`absolute top-0 left-0 right-0 h-1 ${accent}`} />
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                    <span className="text-[32px] leading-10 font-bold text-slate-800 tabular-nums">
                        {compte}{suffix && <span className="text-lg text-slate-400 font-semibold ml-1">{suffix}</span>}
                    </span>
                </div>
                <div className={`p-2.5 rounded-lg bg-slate-100 ${iconText} transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6`}>
                    <Icon size={22} />
                </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 font-medium flex items-center gap-1">
                Gérer
                <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
        </Link>
    );
}

/* Donut animé : camembert SVG avec segments qui se déploient au chargement */
function DonutStatut({ parStatut, total }) {
    const [montre, setMontre] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMontre(true), 250);
        return () => clearTimeout(t);
    }, []);

    const couleurs = {
        en_service: 'var(--color-vert-500, #10b981)',
        en_stock: 'var(--color-blue-500, #3b82f6)',
        en_maintenance: 'var(--color-orange-400, #fb923c)',
        reforme: '#94a3b8',
        perdu: 'var(--color-rose-500, #f43f5e)',
        reserve: 'var(--color-jaune-400, #facc15)',
    };

    const segments = useMemo(() => {
        const entries = Object.entries(STATUTS_EQUIPEMENT)
            .map(([key, meta]) => ({ key, label: meta.label, valeur: parStatut[key] || 0 }))
            .filter((s) => s.valeur > 0);
        let offset = 0;
        const R = 15.9155; // circonférence = 100 pour pourcentages directs
        return entries.map((s) => {
            const pct = total ? (s.valeur / total) * 100 : 0;
            const seg = { ...s, pct, offset, dash: `${pct} ${100 - pct}`, R };
            offset += pct;
            return seg;
        });
    }, [parStatut, total]);

    return (
        <div className="flex items-center gap-5 flex-wrap">
            <div className="relative w-56 h-56 shrink-0">
                <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
                    <circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--color-slate-100, #f1f5f9)" strokeWidth="5" />
                    {segments.map((s, i) => (
                        <circle
                            key={s.key}
                            cx="21" cy="21" r="15.9155" fill="none"
                            stroke={couleurs[s.key] ?? '#94a3b8'}
                            strokeWidth="5"
                            strokeDasharray={montre ? s.dash : `0 100`}
                            strokeDashoffset={-s.offset}
                            strokeLinecap="butt"
                            style={{
                                transition: `stroke-dasharray 1s cubic-bezier(.22,1,.36,1) ${i * 140}ms, stroke-dashoffset 1s cubic-bezier(.22,1,.36,1) ${i * 140}ms`,
                            }}
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Compteur value={total} className="text-4xl font-extrabold text-slate-800 tabular-nums" />
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">équipements</span>
                </div>
            </div>
            <div className="flex-1 min-w-[150px] space-y-1.5">
                {segments.map((s, i) => (
                    <div
                        key={s.key}
                        className="anim-fade-up flex items-center justify-between text-xs"
                        style={{ animationDelay: `${300 + i * 90}ms` }}
                    >
                        <span className="flex items-center gap-2 font-semibold text-slate-700">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: couleurs[s.key] ?? '#94a3b8' }} />
                            {s.label}
                        </span>
                        <span className="text-slate-500 tabular-nums font-semibold">{s.valeur} · {Math.round(s.pct)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* Diagramme en barres animé : les barres montent depuis 0 avec un délai en cascade */
function BarresCategories({ categories }) {
    const [montre, setMontre] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMontre(true), 250);
        return () => clearTimeout(t);
    }, []);

    const max = Math.max(1, ...categories.map((c) => c.total));

    return (
        <div className="space-y-3">
            {categories.map((c, i) => (
                <div key={c.nom_categorie} className="group">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                            {ICONS[c.nom_categorie] ? (() => { const I = ICONS[c.nom_categorie]; return <I size={13} className="text-blue-300" />; })() : null}
                            {c.nom_categorie}
                        </span>
                        <span className="text-slate-500 tabular-nums font-bold">{c.total}</span>
                    </div>
                    <div className="h-5 bg-slate-100 rounded-md overflow-hidden relative">
                        <div
                            className="h-full rounded-md bg-gradient-to-r from-blue-600 to-sky-400 relative group-hover:brightness-110 transition-[filter] duration-200"
                            style={{
                                width: montre ? `${(c.total / max) * 100}%` : '0%',
                                transition: `width 1s cubic-bezier(.22,1,.36,1) ${i * 120}ms`,
                            }}
                        >
                            {/* reflet lumineux qui traverse la barre */}
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* Compteur animé réutilisable (span) */
function Compteur({ value, className }) {
    const compte = useCompteur(value);
    return <span className={className}>{compte}</span>;
}

/* Graphique d'achats par mois : courbe + barres animées */
function AchatsParMois({ donnees }) {
    const [montre, setMontre] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMontre(true), 350);
        return () => clearTimeout(t);
    }, []);

    if (! donnees?.length) {
        return <p className="text-xs text-slate-500 py-6 text-center">Aucun achat enregistré pour tracer la courbe.</p>;
    }

    const maxMontant = Math.max(1, ...donnees.map((d) => Number(d.montant) || 0));
    const maxNb = Math.max(1, ...donnees.map((d) => Number(d.nb) || 0));

    // Construit le path de la courbe (montants)
    const W = 100, H = 38;
    const points = donnees.map((d, i) => ({
        x: donnees.length === 1 ? W / 2 : (i / (donnees.length - 1)) * W,
        y: H - ((Number(d.montant) || 0) / maxMontant) * (H - 4) - 2,
    }));
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const aire = `${path} L${points[points.length - 1].x.toFixed(2)},${H} L${points[0].x.toFixed(2)},${H} Z`;

    return (
        <div>
            <div className="relative">
                {/* Barres verticales (nombre d'achats) */}
                <div className="flex items-end gap-1.5 h-24 mb-1">
                    {donnees.map((d, i) => (
                        <div key={d.mois} className="flex-1 flex flex-col items-center gap-1 group">
                            <span className="text-[10px] font-bold text-slate-400 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">{d.nb}</span>
                            <div
                                className="w-full max-w-8 rounded-t-md bg-gradient-to-t from-indigo-500/70 to-indigo-400/40 hover:from-indigo-600 hover:to-indigo-400 transition-colors"
                                style={{
                                    height: montre ? `${(Number(d.nb) / maxNb) * 100}%` : '0%',
                                    transition: `height .9s cubic-bezier(.22,1,.36,1) ${i * 90}ms`,
                                }}
                            />
                        </div>
                    ))}
                </div>
                {/* Courbe des montants par-dessus */}
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-24 w-full pointer-events-none">
                    <defs>
                        <linearGradient id="aireAchats" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-vert-500, #10b981)" stopOpacity=".28" />
                            <stop offset="100%" stopColor="var(--color-vert-500, #10b981)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d={aire} fill="url(#aireAchats)"
                        style={{ opacity: montre ? 1 : 0, transition: 'opacity 1.2s ease 500ms' }}
                    />
                    <path
                        d={path} fill="none"
                        stroke="var(--color-vert-500, #10b981)" strokeWidth=".9"
                        strokeLinecap="round" strokeLinejoin="round"
                        style={{
                            strokeDasharray: 300,
                            strokeDashoffset: montre ? 0 : 300,
                            transition: 'stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1) 400ms',
                        }}
                        vectorEffect="non-scaling-stroke"
                    />
                    {points.map((p, i) => (
                        <circle
                            key={i} cx={p.x} cy={p.y} r="1.1"
                            fill="var(--color-vert-500, #10b981)"
                            style={{ opacity: montre ? 1 : 0, transition: `opacity .4s ease ${700 + i * 120}ms` }}
                        />
                    ))}
                </svg>
            </div>
            {/* Étiquettes des mois */}
            <div className="flex gap-1.5 mt-1">
                {donnees.map((d) => (
                    <span key={d.mois} className="flex-1 text-center text-[9px] font-semibold text-slate-400 uppercase truncate">
                        {d.mois.slice(5)}/{d.mois.slice(2, 4)}
                    </span>
                ))}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-indigo-400/60 inline-block" /> Nombre d'achats</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-vert-500 inline-block" /> Montant cumulé (Ar)</span>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/dashboard').then(({ data }) => setStats(data));
    }, []);

    if (! stats) return <Spinner label="Chargement du tableau de bord…" />;

    const cards = [
        { label: 'Matériels répertoriés', value: stats.total_equipements, icon: Monitor, accent: 'bg-blue-600', iconText: 'text-blue-400', to: '/equipements' },
        { label: 'Tickets ouverts', value: stats.tickets_ouverts, icon: LifeBuoy, accent: 'bg-rose-500', iconText: 'text-rose-400', to: '/tickets' },
        { label: 'Maintenances en cours', value: stats.maintenances_cours, icon: Wrench, accent: 'bg-orange-400', iconText: 'text-orange-400', to: '/maintenances' },
        { label: 'Affectations actives', value: stats.affectations_actives, icon: ArrowLeftRight, accent: 'bg-vert-500', iconText: 'text-vert-400', to: '/affectations' },
    ];

    return (
        <div>
            <PageHeader
                title="Tableau de bord"
                subtitle="Vue d'ensemble du parc informatique de la DGSR"
                actions={
                    stats && (
                        <BoutonRapport
                            titre="Tableau de bord — Synthèse"
                            texte={[
                                `Matériels répertoriés : ${stats.total_equipements}`,
                                `Tickets ouverts : ${stats.tickets_ouverts}`,
                                `Maintenances en cours : ${stats.maintenances_cours}`,
                                `Affectations actives : ${stats.affectations_actives}`,
                                `Inventaires en cours : ${stats.inventaires_cours}`,
                                `Garanties expirant sous 60 jours : ${stats.garanties_expirantes}`,
                                `Valeur totale du parc : ${formatAr(stats.valeur_parc)}`,
                            ]}
                            sections={[
                                { titre: 'Répartition par statut', lignes: Object.entries(STATUTS_EQUIPEMENT).map(([k, m]) => [m.label, `${stats.par_statut[k] ?? 0}`]) },
                                { titre: 'Par catégorie', lignes: stats.par_categorie.map((c) => [c.nom_categorie, String(c.total)]) },
                                { titre: 'Derniers tickets', lignes: stats.derniers_tickets.map((t) => [t.reference_ticket, t.titre, t.statut]) },
                                { titre: 'Derniers mouvements', lignes: stats.derniers_mouvements.map((m) => [formatDate(m.date_mouvement), m.type_mouvement, m.equipement?.designation ?? '']) },
                            ]}
                        />
                    )
                }
            />

            {/* Orbes décoratifs flottants en arrière-plan, teintés par l'aura du thème */}
            <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
                <div className="anim-float absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl" style={{ background: 'var(--aura-1, rgba(37,99,235,.10))' }} />
                <div className="anim-float absolute top-1/2 -left-32 w-80 h-80 rounded-full blur-3xl" style={{ background: 'var(--aura-2, rgba(0,166,224,.07))', animationDelay: '-4.5s' }} />
                <div className="anim-float absolute -bottom-32 right-1/4 w-72 h-72 rounded-full blur-3xl" style={{ background: 'var(--aura-1, rgba(37,99,235,.10))', animationDelay: '-8s', opacity: .6 }} />
            </div>

            {/* Cartes principales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {cards.map(({ label, value, icon: Icon, accent, iconText, to }, i) => (
                    <div key={label} className={`anim-fade-up anim-d${i + 1} lift rounded-xl`}>
                        <CarteKPI label={label} value={value} icon={Icon} accent={accent} iconText={iconText} to={to} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Répartition par statut — DONUT animé */}
                <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-5 anim-fade-up">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity size={15} className="text-blue-400" /> Répartition par statut
                    </h3>
                    <DonutStatut parStatut={stats.par_statut} total={stats.total_equipements} />
                </div>

                {/* Par catégorie — BARRES animées avec reflet */}
                <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-5 anim-fade-up anim-d1">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Monitor size={15} className="text-blue-400" /> Par catégorie
                    </h3>
                    <BarresCategories categories={stats.par_categorie} />
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1.5">
                            <CircleDollarSign size={14} /> Valeur totale du parc
                        </span>
                        <span className="font-bold text-slate-800">
                            <Compteur value={stats.valeur_parc} className="tabular-nums" /> <span className="text-slate-400 font-semibold">Ar</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Achats par mois — courbe + barres animées */}
            <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 anim-fade-up anim-d2">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <ShoppingCart size={15} className="text-indigo-400" /> Activité des achats (6 derniers)
                    </h3>
                    <Link to="/achats" className="text-xs font-semibold text-blue-400 hover:underline">Tout voir</Link>
                </div>
                <AchatsParMois donnees={stats.achats_par_mois ?? []} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Derniers tickets */}
                <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-5 anim-fade-up anim-d3">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-800">Derniers tickets</h3>
                        <Link to="/tickets" className="text-xs font-semibold text-blue-400 hover:underline">Tout voir</Link>
                    </div>
                    <div className="space-y-2">
                        {stats.derniers_tickets.map((t, i) => (
                            <div
                                key={t.id_ticket}
                                className="flex items-center justify-between gap-3 text-sm py-2 border-b border-slate-100 last:border-0 anim-fade-up rounded-lg px-1 -mx-1 hover:bg-blue-50/40 transition-colors"
                                style={{ animationDelay: `${Math.min(i * 80, 400)}ms` }}
                            >
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-800 truncate">{t.titre}</div>
                                    <div className="text-[11px] text-slate-500">
                                        {t.reference_ticket} · {t.equipement?.code_inventaire ?? '—'}
                                    </div>
                                </div>
                                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    t.statut === 'ouvert' ? 'bg-rose-100 text-rose-400 border-rose-200'
                                    : t.statut === 'en_cours' ? 'bg-orange-100 text-orange-400 border-orange-200'
                                    : t.statut === 'resolu' ? 'bg-vert-100 text-vert-400 border-vert-200'
                                    : 'bg-slate-200 text-slate-500 border-slate-300'
                                }`}>
                                    {t.statut.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                        {stats.derniers_tickets.length === 0 && (
                            <p className="text-xs text-slate-500 py-3">Aucun ticket pour le moment.</p>
                        )}
                    </div>
                </div>

                {/* Derniers mouvements */}
                <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-5 anim-fade-up anim-d4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-800">Derniers mouvements</h3>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <BadgeAlert size={13} /> {stats.garanties_expirantes} garanties &lt; 60 j
                        </span>
                    </div>
                    <div className="space-y-2">
                        {stats.derniers_mouvements.map((m, i) => (
                            <div
                                key={m.id_mouvement}
                                className="flex items-center justify-between gap-3 text-sm py-2 border-b border-slate-100 last:border-0 anim-fade-up rounded-lg px-1 -mx-1 hover:bg-blue-50/40 transition-colors"
                                style={{ animationDelay: `${Math.min(i * 80, 400)}ms` }}
                            >
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-800 truncate">
                                        {m.equipement?.designation ?? 'Équipement'}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        {m.type_mouvement} · {formatDate(m.date_mouvement)}
                                    </div>
                                </div>
                                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    {m.equipement?.code_inventaire ?? '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {stats.inventaires_cours > 0 && (
                <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-200 p-4 flex items-center gap-3 text-sm text-blue-300 anim-fade-up">
                    <Boxes size={18} className="text-blue-400" />
                    <span>
                        Un inventaire est <strong>en cours</strong> — {stats.inventaires_cours} campagne(s) active(s).
                    </span>
                </div>
            )}
        </div>
    );
}
