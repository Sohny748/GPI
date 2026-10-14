import { useEffect, useState } from 'react';
import {
    Layout, Building2, Network, Tags, Boxes, Wrench,
    MapPin, Building, Layers, ShieldCheck, Truck, Plus, Pencil, Trash2, RotateCcw, SlidersHorizontal,
    Sun, Moon, Check,
} from 'lucide-react';
import { api } from '../api';
import { Spinner, PageHeader, Badge, Field, inputClass, ErrorText, EditModal } from '../components/ui';
import { useSettings, THEMES } from '../settings';
import { useToast, useConfirmation } from '../components/notifications';

/* Identifiant primaire de chaque type de référentiel */
const ID_KEYS = {
    directions: 'id_direction',
    services: 'id_service',
    categories: 'id_categorie',
    marques: 'id_marque',
    modeles: 'id_modele',
    sites: 'id_site',
    batiments: 'id_batiment',
    localisations: 'id_localisation',
    etats: 'id_etat',
    fournisseurs: 'id_fournisseur',
};

/* Colonnes affichées par type */
const COLONNES = {
    directions: [
        { key: 'code_direction', label: 'Code', width: 'w-20', mono: true },
        { key: 'nom_direction', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'telephone', label: 'Téléphone' },
        { key: 'statut', label: 'Statut', badge: true },
    ],
    services: [
        { key: 'code_service', label: 'Code', width: 'w-20', mono: true },
        { key: 'nom_service', label: 'Nom' },
        { key: 'direction', label: 'Direction', relation: (s) => s.direction?.code_direction ?? '—' },
        { key: 'statut', label: 'Statut', badge: true },
    ],
    categories: [
        { key: 'code_categorie', label: 'Code', width: 'w-20', mono: true },
        { key: 'nom_categorie', label: 'Nom' },
        { key: 'description', label: 'Description' },
    ],
    marques: [
        { key: 'nom_marque', label: 'Nom' },
        { key: 'description', label: 'Description' },
    ],
    modeles: [
        { key: 'nom_modele', label: 'Modèle' },
        { key: 'marque', label: 'Marque', relation: (m) => m.marque?.nom_marque ?? '—' },
        { key: 'categorie', label: 'Catégorie', relation: (m) => m.categorie?.nom_categorie ?? '—' },
    ],
    sites: [
        { key: 'code_site', label: 'Code', width: 'w-20', mono: true },
        { key: 'nom_site', label: 'Site' },
        { key: 'ville', label: 'Ville' },
        { key: 'statut', label: 'Statut', badge: true },
    ],
    batiments: [
        { key: 'nom_batiment', label: 'Bâtiment' },
        { key: 'site', label: 'Site', relation: (b) => b.site?.nom_site ?? '—' },
        { key: 'statut', label: 'Statut', badge: true },
    ],
    localisations: [
        { key: 'code_localisation', label: 'Code', width: 'w-24', mono: true },
        { key: 'nom_localisation', label: 'Localisation' },
        { key: 'etage', label: 'Étage', width: 'w-20' },
        { key: 'batiment', label: 'Bâtiment', relation: (l) => l.batiment ? `${l.batiment.nom_batiment} · ${l.batiment.site?.nom_site ?? ''}` : '—' },
        { key: 'statut', label: 'Statut', badge: true },
    ],
    etats: [
        { key: 'nom_etat', label: 'État' },
        { key: 'description', label: 'Description' },
    ],
    fournisseurs: [
        { key: 'raison_sociale', label: 'Raison sociale' },
        { key: 'contact', label: 'Contact' },
        { key: 'telephone', label: 'Téléphone' },
        { key: 'email', label: 'Email' },
    ],
};

/* Champs du formulaire d'édition par type */
const FORMULAIRES = {
    directions: [
        { key: 'code_direction', label: 'Code' },
        { key: 'nom_direction', label: 'Nom de la direction', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'telephone', label: 'Téléphone' },
        { key: 'statut', label: 'Statut', type: 'select', options: [['actif', 'Actif'], ['inactif', 'Inactif']] },
    ],
    services: [
        { key: 'code_service', label: 'Code' },
        { key: 'nom_service', label: 'Nom du service', required: true },
        { key: 'id_direction', label: 'Direction', type: 'ref', source: 'directions', get: (d) => d.nom_direction, required: true },
        { key: 'statut', label: 'Statut', type: 'select', options: [['actif', 'Actif'], ['inactif', 'Inactif']] },
    ],
    categories: [
        { key: 'code_categorie', label: 'Code' },
        { key: 'nom_categorie', label: 'Nom de la catégorie', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
    ],
    marques: [
        { key: 'nom_marque', label: 'Nom de la marque', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
    ],
    modeles: [
        { key: 'nom_modele', label: 'Nom du modèle', required: true },
        { key: 'reference_modele', label: 'Référence' },
        { key: 'id_marque', label: 'Marque', type: 'ref', source: 'marques', get: (m) => m.nom_marque },
        { key: 'id_categorie', label: 'Catégorie', type: 'ref', source: 'categories', get: (c) => c.nom_categorie },
    ],
    sites: [
        { key: 'code_site', label: 'Code' },
        { key: 'nom_site', label: 'Nom du site', required: true },
        { key: 'ville', label: 'Ville', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'statut', label: 'Statut', type: 'select', options: [['actif', 'Actif'], ['inactif', 'Inactif']] },
    ],
    batiments: [
        { key: 'code_batiment', label: 'Code' },
        { key: 'nom_batiment', label: 'Nom du bâtiment', required: true },
        { key: 'id_site', label: 'Site', type: 'ref', source: 'sites', get: (s) => s.nom_site, required: true },
        { key: 'statut', label: 'Statut', type: 'select', options: [['actif', 'Actif'], ['inactif', 'Inactif']] },
    ],
    localisations: [
        { key: 'code_localisation', label: 'Code' },
        { key: 'nom_localisation', label: 'Nom de la localisation', required: true },
        { key: 'etage', label: 'Étage' },
        { key: 'bureau', label: 'Bureau' },
        { key: 'id_batiment', label: 'Bâtiment', type: 'ref', source: 'batiments', get: (b) => b.nom_batiment, required: true },
        { key: 'statut', label: 'Statut', type: 'select', options: [['actif', 'Actif'], ['inactif', 'Inactif']] },
    ],
    etats: [
        { key: 'nom_etat', label: 'Nom de l\u2019état', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
    ],
    fournisseurs: [
        { key: 'raison_sociale', label: 'Raison sociale', required: true },
        { key: 'contact', label: 'Personne de contact' },
        { key: 'telephone', label: 'Téléphone' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'adresse', label: 'Adresse' },
        { key: 'rcs', label: 'RCS' },
    ],
};

const ONGLETS = [
    { key: 'directions', label: 'Directions', icon: Building2 },
    { key: 'services', label: 'Services', icon: Network },
    { key: 'sites', label: 'Sites', icon: MapPin },
    { key: 'batiments', label: 'Bâtiments', icon: Building },
    { key: 'localisations', label: 'Localisations', icon: Layers },
    { key: 'categories', label: 'Catégories', icon: Tags },
    { key: 'marques', label: 'Marques', icon: Boxes },
    { key: 'modeles', label: 'Modèles', icon: Wrench },
    { key: 'etats', label: 'États', icon: ShieldCheck },
    { key: 'fournisseurs', label: 'Fournisseurs', icon: Truck },
];

export default function Parametres() {
    const { settings, update, reset } = useSettings();
    const toast = useToast();
    const confirmer = useConfirmation();
    const [ref, setRef] = useState(null);
    const [onglet, setOnglet] = useState('directions');
    const [modal, setModal] = useState(null); // null | { mode, item? }
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);

    const chargeRef = () => api.get('/referentiel').then(({ data }) => setRef(data));
    useEffect(() => { chargeRef(); }, []);

    const type = onglet;
    const items = ref?.[type] ?? [];
    const colonnes = COLONNES[type] ?? [];
    const champs = FORMULAIRES[type] ?? [];
    const idKey = ID_KEYS[type];

    const notifier = (text, typeMsg = 'info') => {
        setMessage({ text, type: typeMsg });
        setTimeout(() => setMessage(null), 4000);
    };

    const ouvrirCreation = () => {
        const vide = {};
        champs.forEach((c) => {
            vide[c.key] = c.type === 'select' ? (c.options?.[0]?.[0] ?? '') : '';
        });
        setForm(vide);
        setErrors(null);
        setModal({ mode: 'create' });
    };

    const ouvrirEdition = (item) => {
        const data = {};
        champs.forEach((c) => { data[c.key] = item[c.key] ?? ''; });
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
                await api.put(`/referentiel/${type}/${modal.item[idKey]}`, payload);
                notifier('Modifications enregistrées.');
            } else {
                await api.post(`/referentiel/${type}`, payload);
                notifier('Élément créé.');
            }
            setModal(null);
            await chargeRef();
        } catch (err) {
            setErrors(err.response?.data?.errors ?? { erreur: [err.response?.data?.message ?? 'Enregistrement impossible.'] });
        } finally {
            setBusy(false);
        }
    };

    const supprimer = async (item) => {
        const nom = item[colonnes.find((c) => !c.relation)?.key ?? idKey] ?? '';
        if (! await confirmer({
            titre: 'Supprimer cet élément ?',
            message: `« ${nom} » sera définitivement supprimé des référentiels.`,
            danger: true,
            texteOK: 'Supprimer',
        })) return;
        try {
            await api.delete(`/referentiel/${type}/${item[idKey]}`);
            toast.succes('Élément supprimé.');
            await chargeRef();
        } catch (err) {
            toast.erreur(err.response?.data?.message ?? 'Suppression impossible (élément utilisé ailleurs).');
        }
    };

    if (! ref) return <Spinner label="Chargement des paramètres…" />;

    return (
        <div>
            <PageHeader title="Paramètres" subtitle="Préférences d'interface et configuration des référentiels" />

            {message && (
                <div className={`mb-4 rounded-lg border p-3 text-sm ${
                    message.type === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-500'
                        : 'bg-blue-100 border-blue-200 text-blue-300'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Thème : mode clair / sombre + 15 thèmes */}
            <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm p-5 mb-6">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                    <Sun size={16} className="text-sky-400" /> Thème de l'interface
                </h3>
                {(() => {
                    const modeActuel = THEMES.find((t) => t.id === settings.theme)?.mode ?? 'sombre';
                    const modes = [
                        { id: 'sombre', cible: 'navy', label: 'Mode sombre' },
                        { id: 'clair', cible: 'clair-bleu', label: 'Mode clair' },
                    ];
                    return (
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {modes.map(({ id, cible, label }) => (
                                <button
                                    key={id}
                                    onClick={() => {
                                        update({ theme: cible });
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                                        modeActuel === id
                                            ? 'bg-blue-600 text-white shadow-sm anim-glow'
                                            : 'bg-slate-100 text-slate-500 hover:bg-card-high hover:text-slate-800 border border-slate-200/50'
                                    }`}
                                >
                                    {id === 'sombre' ? <Moon size={13} /> : <Sun size={13} />}
                                    {label}
                                </button>
                            ))}
                        </div>
                    );
                })()}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {THEMES.map((t, i) => {
                        const actif = settings.theme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => { update({ theme: t.id }); }}
                                className={`anim-fade-up flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${
                                    actif
                                        ? 'border-blue-400 ring-2 ring-blue-600/40 bg-card-high'
                                        : 'border-slate-200/50 bg-slate-100 hover:bg-card-high'
                                }`}
                                style={{ animationDelay: `${Math.min(i * 40, 500)}ms` }}
                            >
                                <span
                                    className="w-10 h-10 rounded-lg shrink-0 border border-slate-300 flex items-center justify-center"
                                    style={{ background: `linear-gradient(135deg, ${t.apercu[0]} 0%, ${t.apercu[0]} 55%, ${t.apercu[2]} 100%)` }}
                                >
                                    {actif && <Check size={16} className="text-white drop-shadow" />}
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-xs font-bold text-slate-800 truncate">{t.nom}</span>
                                    <span className="block text-[10px] uppercase tracking-wider text-slate-400">{t.mode}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Préférences d'interface */}
            <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm p-5 mb-6">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                    <Layout size={16} className="text-sky-400" /> Interface
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/50 bg-slate-100 p-3.5 cursor-pointer hover:bg-card-high transition">
                        <div>
                            <div className="text-sm font-semibold text-slate-800">Sidebar élargie</div>
                            <div className="text-[11px] text-slate-500">320px au lieu de 288px</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.sidebarElargie}
                            onChange={(e) => update({ sidebarElargie: e.target.checked, sidebarRepliee: e.target.checked ? false : settings.sidebarRepliee })}
                            className="w-4 h-4 accent-blue-600"
                        />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/50 bg-slate-100 p-3.5 cursor-pointer hover:bg-card-high transition">
                        <div>
                            <div className="text-sm font-semibold text-slate-800">Sidebar repliée</div>
                            <div className="text-[11px] text-slate-500">Icônes seules (76px)</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.sidebarRepliee}
                            onChange={(e) => update({ sidebarRepliee: e.target.checked })}
                            className="w-4 h-4 accent-blue-600"
                        />
                    </label>
                    <div className="rounded-xl border border-slate-200/50 bg-slate-100 p-3.5">
                        <div className="text-sm font-semibold text-slate-800 mb-1">Densité</div>
                        <select
                            value={settings.densite}
                            onChange={(e) => update({ densite: e.target.value })}
                            className={`${inputClass} py-1.5 text-xs`}
                        >
                            <option value="compacte">Compacte</option>
                            <option value="confortable">Confortable</option>
                            <option value="spacieuse">Spacieuse</option>
                        </select>
                    </div>
                </div>

                <div className="mt-3 flex justify-end">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/50 bg-slate-100 hover:bg-card-high text-slate-600 hover:text-slate-800 text-xs font-semibold"
                    >
                        <RotateCcw size={13} /> Réinitialiser les préférences
                    </button>
                </div>
            </div>

            {/* Configuration des référentiels */}
            <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50 flex-wrap gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <SlidersHorizontal size={16} className="text-sky-400" /> Configuration des interfaces (référentiels)
                    </h3>
                    <button
                        onClick={ouvrirCreation}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm shadow-blue-600/25"
                    >
                        <Plus size={15} /> Ajouter
                    </button>
                </div>

                {/* Onglets */}
                <div className="px-4 pt-3 flex gap-1 flex-wrap border-b border-slate-200/50">
                    {ONGLETS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setOnglet(key)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                                onglet === key
                                    ? 'bg-card-high text-sky-400 border border-b-0 border-slate-200/50'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                        >
                            <Icon size={13} /> {label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200/50">
                                {colonnes.map((c) => (
                                    <th key={c.key} className={`px-4 py-2.5 font-bold ${c.width ?? ''}`}>{c.label}</th>
                                ))}
                                <th className="px-4 py-2.5 text-right font-bold w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item) => (
                                <tr key={item[idKey]} className="hover:bg-blue-50/30 transition">
                                    {colonnes.map((c) => (
                                        <td key={c.key} className="px-4 py-2.5 text-slate-700">
                                            {c.relation
                                                ? c.relation(item)
                                                : c.badge
                                                    ? <Badge color={item[c.key] === 'inactif' ? 'bg-rose-100 text-rose-400 border-rose-200' : 'bg-vert-100 text-vert-400 border-vert-200'}>{item[c.key] ?? '—'}</Badge>
                                                    : c.mono
                                                        ? <span className="font-mono text-xs font-semibold text-blue-300">{item[c.key] ?? '—'}</span>
                                                        : (item[c.key] ?? '—')}
                                        </td>
                                    ))}
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => ouvrirEdition(item)}
                                                title="Modifier"
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200/50 bg-slate-100 hover:bg-card-high text-slate-600 hover:text-sky-400 text-xs font-semibold transition-colors"
                                            >
                                                <Pencil size={13} /> Modifier
                                            </button>
                                            <button
                                                onClick={() => supprimer(item)}
                                                title="Supprimer"
                                                className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-slate-200/50 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-600 text-xs font-semibold transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={colonnes.length + 1} className="px-4 py-8 text-center text-sm text-slate-500">
                                        Aucun élément — cliquez sur « Ajouter » pour créer le premier.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modale création / édition référentiel */}
            <EditModal
                open={!! modal}
                mode={modal?.mode}
                onClose={() => setModal(null)}
                onSubmit={submit}
                busy={busy}
                title={modal?.mode === 'edit' ? `Modifier — ${ONGLETS.find((o) => o.key === type)?.label}` : `Nouvel élément — ${ONGLETS.find((o) => o.key === type)?.label}`}
                width="max-w-lg"
            >
                <ErrorText errors={errors} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {champs.map((c) => (
                        <Field key={c.key} label={c.label} required={c.required}>
                            {c.type === 'select' ? (
                                <select value={form[c.key] ?? ''} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} className={inputClass}>
                                    {c.options.map(([v, l]) => (
                                        <option key={v} value={v}>{l}</option>
                                    ))}
                                </select>
                            ) : c.type === 'ref' ? (
                                <select value={form[c.key] ?? ''} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} className={inputClass}>
                                    <option value="">—</option>
                                    {(ref?.[c.source] ?? []).map((o) => (
                                        <option key={o[ID_KEYS[c.source]]} value={o[ID_KEYS[c.source]]}>{c.get(o)}</option>
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
        </div>
    );
}
