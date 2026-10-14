/*
 * Code couleur sémantique :
 *   VERT   = actif / en service / résolu / terminé / livré
 *   ROUGE  = inactif / perdu / critique / annulé / ouvert (alerte)
 *   ORANGE = en maintenance / en cours / haute priorité / partiel
 *   JAUNE  = réserve / congé / planifié / priorité moyenne
 *   GRIS   = réformé / fermé / neutre
 *   BLEU   = information, éléments neufs en stock
 */
export const STATUTS_EQUIPEMENT = {
    en_service: { label: 'En service', color: 'bg-vert-100 text-vert-400 border-vert-200' },
    en_stock: { label: 'En stock', color: 'bg-blue-100 text-blue-300 border-blue-200' },
    en_maintenance: { label: 'En maintenance', color: 'bg-orange-100 text-orange-400 border-orange-200' },
    reforme: { label: 'Réformé', color: 'bg-slate-200 text-slate-500 border-slate-300' },
    perdu: { label: 'Perdu', color: 'bg-rose-100 text-rose-400 border-rose-200' },
    reserve: { label: 'Réservé', color: 'bg-jaune-100 text-jaune-400 border-jaune-200' },
};

export const PRIORITES = {
    basse: { label: 'Basse', color: 'bg-slate-100 text-slate-500 border-slate-200' },
    moyenne: { label: 'Moyenne', color: 'bg-jaune-100 text-jaune-400 border-jaune-200' },
    haute: { label: 'Haute', color: 'bg-orange-100 text-orange-400 border-orange-200' },
    critique: { label: 'Critique', color: 'bg-rose-100 text-rose-400 border-rose-200' },
};

export const STATUTS_TICKET = {
    ouvert: { label: 'Ouvert', color: 'bg-rose-100 text-rose-400 border-rose-200' },
    en_cours: { label: 'En cours', color: 'bg-orange-100 text-orange-400 border-orange-200' },
    resolu: { label: 'Résolu', color: 'bg-vert-100 text-vert-400 border-vert-200' },
    ferme: { label: 'Fermé', color: 'bg-slate-200 text-slate-500 border-slate-300' },
};

export const STATUTS_MAINTENANCE = {
    demandee: { label: 'Demandée', color: 'bg-slate-100 text-slate-500 border-slate-200' },
    planifiee: { label: 'Planifiée', color: 'bg-jaune-100 text-jaune-400 border-jaune-200' },
    en_cours: { label: 'En cours', color: 'bg-orange-100 text-orange-400 border-orange-200' },
    terminee: { label: 'Terminée', color: 'bg-vert-100 text-vert-400 border-vert-200' },
    annulee: { label: 'Annulée', color: 'bg-rose-100 text-rose-400 border-rose-200' },
};

export const STATUTS_ACHAT = {
    commande: { label: 'Commandé', color: 'bg-blue-100 text-blue-300 border-blue-200' },
    livre_partiel: { label: 'Livré partiel', color: 'bg-orange-100 text-orange-400 border-orange-200' },
    livre: { label: 'Livré', color: 'bg-vert-100 text-vert-400 border-vert-200' },
    annule: { label: 'Annulé', color: 'bg-rose-100 text-rose-400 border-rose-200' },
};

/* Actif / Inactif : le duo demandé — vert / rouge */
export const STATUTS_ACTIF = {
    actif: { label: 'Actif', color: 'bg-vert-100 text-vert-400 border-vert-200' },
    inactif: { label: 'Inactif', color: 'bg-rose-100 text-rose-400 border-rose-200' },
};

export const badgeActif = (valeur) => STATUTS_ACTIF[valeur]?.color
    ?? (valeur === 'actif' ? STATUTS_ACTIF.actif.color : STATUTS_ACTIF.inactif.color);

export function formatDate(value) {
    if (! value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatAr(value) {
    if (value == null) return '—';
    return new Intl.NumberFormat('fr-MG', { maximumFractionDigits: 0 }).format(value) + ' Ar';
}
