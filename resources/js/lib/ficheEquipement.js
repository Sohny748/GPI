import { STATUTS_EQUIPEMENT, STATUTS_MAINTENANCE, STATUTS_TICKET, formatDate, formatAr } from './constants';
import { genererRapport } from './rapport';

/*
 * Fiche complète d'un équipement : toutes les informations de la base
 * (identification, référentiels, cycle de vie, affectations, maintenances,
 * tickets, logiciels, mouvements, documents) assemblées en un rapport PDF
 * multi-sections, prêt pour l'archive ou l'audit.
 *
 * Deux usages :
 *  - ficheComplete(eq)      → PDF d'un seul équipement
 *  - fichesCompletes(liste) → PDF regroupant TOUS les équipements
 */

const K = (label, valeur) => ({ label, valeur });
const txt = (v, alt = '—') => (v == null || v === '' ? alt : String(v));

function identite(eq) {
    return [
        K('Désignation', txt(eq.designation)),
        K('Code inventaire', txt(eq.code_inventaire)),
        K('N° de série', txt(eq.numero_serie)),
        K('Description', txt(eq.description)),
        K('Catégorie', txt(eq.categorie?.nom_categorie)),
        K('Marque', txt(eq.marque?.nom_marque)),
        K('Modèle', txt(eq.modele?.nom_modele)),
        K('État physique', txt(eq.etat?.nom_etat)),
        K('Statut', txt(STATUTS_EQUIPEMENT[eq.statut]?.label ?? eq.statut)),
    ];
}

function localisation(eq) {
    return [
        K('Site', txt(eq.localisation?.batiment?.site?.nom_site)),
        K('Bâtiment', txt(eq.localisation?.batiment?.nom_batiment)),
        K('Localisation', txt(eq.localisation?.nom_localisation)),
        K('Direction', txt(eq.direction?.code_direction ? `${eq.direction.code_direction} — ${eq.direction.nom_direction}` : eq.direction?.nom_direction)),
        K('Service', txt(eq.service?.nom_service)),
    ];
}

function cycleVie(eq) {
    const garantieActive = eq.garantie_fin && new Date(eq.garantie_fin) > new Date();
    return [
        K("Date d'acquisition", txt(formatDate(eq.date_acquisition))),
        K("Prix d'acquisition", txt(formatAr(eq.prix_acquisition))),
        K('Mise en service', txt(formatDate(eq.date_mise_service))),
        K('Début garantie', txt(formatDate(eq.garantie_debut))),
        K('Fin garantie', eq.garantie_fin ? `${formatDate(eq.garantie_fin)}${garantieActive ? ' (active)' : ' (expirée)'}` : '—'),
        K('Fournisseur', txt(eq.fournisseur?.raison_sociale)),
        K('Enregistré le', txt(formatDate(eq.created_at))),
        K('Dernière modification', txt(formatDate(eq.updated_at))),
    ];
}

export function sectionsEquipement(eq) {
    const affectations = (eq.affectations ?? []).map((a) => [
        txt(a.agent ? `${a.agent.prenom} ${a.agent.nom_naiss}` : null),
        txt(a.agent?.matricule),
        txt(formatDate(a.date_affectation)),
        a.date_fin ? txt(formatDate(a.date_fin)) : 'En cours',
        txt(a.motif),
    ]);

    const maintenances = (eq.maintenances ?? []).map((m) => [
        txt(m.type?.nom_type ?? 'Maintenance'),
        txt(STATUTS_MAINTENANCE[m.statut]?.label ?? m.statut),
        txt(formatDate(m.date_debut)),
        txt(formatDate(m.date_fin)),
        txt(m.description_probleme),
        txt(m.cout != null ? formatAr(m.cout) : null),
    ]);

    const tickets = (eq.tickets ?? []).map((t) => [
        txt(t.reference_ticket),
        txt(t.titre),
        txt(STATUTS_TICKET[t.statut]?.label ?? t.statut),
        txt(t.priorite),
        txt(formatDate(t.date_creation)),
    ]);

    const logiciels = (eq.installations ?? []).map((i) => [
        txt(i.logiciel?.nom),
        txt(i.version_installee ?? i.logiciel?.version),
        txt(formatDate(i.date_installation)),
        txt(i.statut === 'installe' ? 'Installé' : i.statut),
    ]);

    const mouvements = (eq.mouvements ?? []).map((m) => [
        txt(formatDate(m.date_mouvement)),
        txt(m.type_mouvement),
        txt(m.motif),
        txt(m.utilisateur ? (m.utilisateur.username ?? '') : null),
    ]);

    const documents = (eq.documents ?? []).map((d) => [
        txt(d.nom_document ?? d.nom),
        txt(d.type_document),
        txt(d.taille_fichier != null ? `${Math.max(1, Math.round(d.taille_fichier / 1024))} Ko` : null),
        txt(formatDate(d.created_at)),
    ]);

    const formations = (eq.formations ?? []).map((f) => [
        txt(f.titre),
        txt(f.theme),
        txt(f.formateur),
        txt(formatDate(f.date_debut)),
        txt(f.statut),
        String(f.participants_count ?? 0),
    ]);

    return [
        { titre: `Affectations (${affectations.length})`, entetes: ['Agent', 'Matricule', 'Début', 'Fin', 'Motif'], lignes: affectations },
        { titre: `Maintenances (${maintenances.length})`, entetes: ['Type', 'Statut', 'Début', 'Fin', 'Problème', 'Coût'], lignes: maintenances },
        { titre: `Tickets d'assistance (${tickets.length})`, entetes: ['Référence', 'Titre', 'Statut', 'Priorité', 'Créé le'], lignes: tickets },
        { titre: `Logiciels installés (${logiciels.length})`, entetes: ['Logiciel', 'Version', 'Installé le', 'Statut'], lignes: logiciels },
        { titre: `Mouvements (${mouvements.length})`, entetes: ['Date', 'Type', 'Motif', 'Agent'], lignes: mouvements },
        { titre: `Documents rattachés (${documents.length})`, entetes: ['Nom', 'Type', 'Taille', 'Ajouté le'], lignes: documents },
        { titre: `Formations liées (${formations.length})`, entetes: ['Titre', 'Thème', 'Formateur', 'Début', 'Statut', 'Participants'], lignes: formations },
    ];
}

/** PDF complet d'un équipement (toutes les infos + historiques). */
export function ficheComplete(eq) {
    const statut = STATUTS_EQUIPEMENT[eq.statut]?.label ?? eq.statut;
    const nbHist = (eq.affectations?.length ?? 0) + (eq.maintenances?.length ?? 0) + (eq.tickets?.length ?? 0);

    genererRapport({
        titre: `Fiche complète — ${eq.code_inventaire}`,
        sousTitre: `${eq.designation} · ${statut}`,
        synthese: `Équipement du parc informatique DGSR — ${nbHist} événement(s) d'historique`,
        fiches: [
            { titre: 'Identité', lignes: identite(eq) },
            { titre: 'Localisation & organisation', lignes: localisation(eq) },
            { titre: 'Cycle de vie & financiers', lignes: cycleVie(eq) },
        ],
        sections: sectionsEquipement(eq),
    });
}

/** PDF regroupant les fiches complètes de plusieurs équipements. */
export function fichesCompletes(equipements) {
    const fiches = equipements.map((eq) => ({
        titre: `${eq.code_inventaire} — ${eq.designation}`,
        lignes: [...identite(eq).slice(0, 6), ...localisation(eq), ...cycleVie(eq).slice(0, 4)],
    }));

    genererRapport({
        titre: 'Fiches complètes des équipements',
        sousTitre: `${equipements.length} équipement(s) — toutes informations`,
        synthese: `Valeur totale du lot : ${formatAr(equipements.reduce((s, e) => s + (Number(e.prix_acquisition) || 0), 0))}`,
        fiches,
    });
}
