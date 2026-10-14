import { genererRapport } from './rapport';
import { formatDate } from './constants';

/* ------------------------------------------------------------------ */
/* Helper générique : construit une fiche PDF individuelle élégante    */
/* ------------------------------------------------------------------ */

const ouiNon = (v) => (v ? 'Oui' : 'Non');
const ou = (v, alt = '—') => (v === null || v === undefined || v === '' ? alt : v);

/**
 * Ouvre la boîte d'impression avec la fiche PDF d'un élément.
 * structure : [{ titre: 'Section', lignes: [[label, valeur], …] }]
 */
export function ficheElement({
    titre,
    sousTitre,
    structure,
    sections = null,
    synthese = null,
}) {
    genererRapport({
        titre,
        sousTitre,
        synthese,
        fiches: structure.map((b) => ({
            titre: b.titre,
            lignes: b.lignes.map(([label, valeur]) => ({ label, valeur: ou(valeur) })),
        })),
        sections: sections ?? undefined,
    });
}

/* ------------------------------------------------------------------ */
/* Fiches par type                                                     */
/* ------------------------------------------------------------------ */

/** Fiche individuelle d'un agent (identité, poste, contact). */
export function ficheAgent(a) {
    ficheElement({
        titre: `Fiche agent — ${a.prenom ?? ''} ${a.nom_naiss ?? ''}`.trim(),
        sousTitre: `Matricule ${a.matricule ?? '—'}`,
        structure: [
            {
                titre: 'Identité',
                lignes: [
                    ['Matricule', a.matricule],
                    ['Nom de naissance', a.nom_naiss],
                    ['Prénom', a.prenom],
                    ['Sexe', a.sexe === 'F' ? 'Féminin' : a.sexe === 'M' ? 'Masculin' : '—'],
                    ['Fonction', a.fonction],
                ],
            },
            {
                titre: 'Affectation organisationnelle',
                lignes: [
                    ['Direction', a.direction?.nom_direction ?? a.direction?.nom ?? a.direction],
                    ['Service', a.service?.nom_service ?? a.service?.nom ?? a.service],
                    ['Statut', a.statut === 'actif' ? 'Actif' : a.statut === 'inactif' ? 'Inactif' : ou(a.statut)],
                    ["Date d'embauche", formatDate(a.date_embauche)],
                ],
            },
            {
                titre: 'Contact',
                lignes: [
                    ['Téléphone', a.telephone],
                    ['E-mail', a.email],
                ],
            },
            {
                titre: 'Enregistrement',
                lignes: [
                    ['Créé le', formatDate(a.created_at, true)],
                    ['Modifié le', formatDate(a.updated_at, true)],
                ],
            },
        ],
    });
}

/** Fiche individuelle d'un ticket d'assistance. */
export function ficheTicket(t) {
    const suivi = {
        ouvert: 'Ouvert',
        en_cours: 'En cours',
        resolu: 'Résolu',
        ferme: 'Fermé',
    };
    const prio = {
        basse: 'Basse',
        moyenne: 'Moyenne',
        haute: 'Haute',
        critique: 'Critique',
    };
    ficheElement({
        titre: `Fiche ticket — ${t.reference_ticket ?? '#' + t.id_ticket}`,
        sousTitre: `Priorité ${prio[t.priorite] ?? ou(t.priorite)} · Statut ${suivi[t.statut] ?? ou(t.statut)}`,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Référence', t.reference_ticket],
                    ['Titre', t.titre],
                    ['Priorité', prio[t.priorite] ?? ou(t.priorite)],
                    ['Statut', suivi[t.statut] ?? ou(t.statut)],
                ],
            },
            {
                titre: 'Concerne',
                lignes: [
                    ['Équipement', t.equipement ? `${t.equipement.code_inventaire} — ${t.equipement.designation}` : '—'],
                    ['Agent déclarant', t.agent ? `${t.agent.prenom} ${t.agent.nom_naiss}` : '—'],
                    ['Description', t.description],
                ],
            },
            {
                titre: 'Suivi',
                lignes: [
                    ['Déclaré le', formatDate(t.date_creation)],
                    ['Clôturé le', formatDate(t.date_cloture)],
                ],
            },
        ],
        sections: t.commentaires?.length
            ? [{
                titre: 'Commentaires',
                entetes: ['Auteur', 'Message'],
                lignes: t.commentaires.map((c) => [
                    c.utilisateur?.username ?? '',
                    c.message ?? c.contenu ?? '',
                ]),
            }]
            : null,
    });
}

/** Fiche individuelle d'une affectation. */
export function ficheAffectation(af) {
    ficheElement({
        titre: `Fiche d'affectation #${af.id_affectation}`,
        sousTitre: af.equipement ? `${af.equipement.code_inventaire} — ${af.equipement.designation}` : undefined,
        structure: [
            {
                titre: 'Équipement affecté',
                lignes: [
                    ['Code inventaire', af.equipement?.code_inventaire],
                    ['Désignation', af.equipement?.designation],
                    ['N° de série', af.equipement?.numero_serie],
                    ['Catégorie', af.equipement?.categorie?.nom ?? af.equipement?.modele?.categorie?.nom],
                ],
            },
            {
                titre: 'Attributaire',
                lignes: [
                    ['Agent', af.agent ? `${af.agent.prenom} ${af.agent.nom_naiss}` : '—'],
                    ['Matricule', af.agent?.matricule],
                    ['Fonction', af.agent?.fonction],
                    ['Service', ou(af.agent?.service?.nom_service)],
                    ['Direction', ou(af.agent?.direction?.nom_direction)],
                ],
            },
            {
                titre: "Détails de l'affectation",
                lignes: [
                    ["Date d'affectation", formatDate(af.date_affectation)],
                    ['Date de restitution', formatDate(af.date_fin, true) === '—' ? 'En cours (non restitué)' : formatDate(af.date_fin)],
                    ['Motif', af.motif],
                    ['Commentaire', af.commentaire],
                ],
            },
        ],
    });
}

/** Fiche individuelle d'un inventaire (campagne de vérification). */
export function ficheInventaire(inv) {
    const statutDetail = (d) =>
        d.statut === 'ecart' ? 'Écart' : d.statut === 'verifie' ? 'Vérifié' : 'À vérifier';
    ficheElement({
        titre: `Fiche inventaire — ${inv.reference ?? inv.id_inventaire}`,
        sousTitre: (inv.date_debut ?? inv.date_inventaire) ? `Campagne du ${formatDate(inv.date_debut ?? inv.date_inventaire)}` : undefined,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Référence', inv.reference],
                    ['Statut', String(inv.statut ?? '').replace('_', ' ') || '—'],
                    ['Début', formatDate(inv.date_debut ?? inv.date_inventaire)],
                    ['Fin', formatDate(inv.date_fin, true) === '—' ? 'En cours' : formatDate(inv.date_fin)],
                ],
            },
            {
                titre: 'Responsable & périmètre',
                lignes: [
                    ['Responsable', inv.responsable ?? inv.user?.username ?? inv.utilisateur],
                    ['Périmètre', inv.perimetre ?? inv.description],
                ],
            },
        ],
        sections: inv.details?.length
            ? [{
                titre: `Éléments contrôlés (${inv.details.length})`,
                entetes: ['Code', 'Désignation', 'Constat', 'Observation'],
                lignes: inv.details.map((d) => [
                    d.equipement?.code_inventaire ?? d.code_inventaire ?? '',
                    d.equipement?.designation ?? d.designation ?? '',
                    d.present === undefined ? statutDetail(d) : ouiNon(d.present),
                    d.observation ?? '',
                ]),
            }]
            : null,
    });
}

/** Fiche individuelle d'une maintenance. */
export function ficheMaintenance(m) {
    ficheElement({
        titre: `Fiche maintenance — ${m.equipement?.code_inventaire ?? '#' + m.id_maintenance}`,
        sousTitre: `${m.type?.nom_type ?? 'Maintenance'} · ${String(m.statut ?? '').replace('_', ' ')}`,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Équipement', m.equipement ? `${m.equipement.code_inventaire} — ${m.equipement.designation ?? ''}` : ou(m.id_equipement)],
                    ['Type de maintenance', m.type?.nom_type ?? m.type?.nom ?? m.id_type_maintenance],
                    ['Statut', String(m.statut ?? '').replace('_', ' ')],
                ],
            },
            {
                titre: 'Intervention',
                lignes: [
                    ['Date de demande', formatDate(m.date_demande)],
                    ['Date de début', formatDate(m.date_debut)],
                    ['Date de fin', formatDate(m.date_fin) === '—' ? 'En cours' : formatDate(m.date_fin)],
                    ['Technicien', m.technicien],
                ],
            },
            {
                titre: 'Diagnostic & travaux',
                lignes: [
                    ['Problème décrit', m.description_probleme],
                    ['Diagnostic', m.diagnostic],
                ],
            },
        ],
    });
}

/** Fiche individuelle d'un logiciel et de ses licences. */
export function ficheLogiciel(l) {
    const licences = l.licences ?? [];
    const totalSieges = licences.reduce((s, lic) => s + (Number(lic.nb_licences) || 0), 0);
    ficheElement({
        titre: `Fiche logiciel — ${l.nom}`,
        sousTitre: [l.editeur, l.version].filter(Boolean).join(' · ') || undefined,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Nom', l.nom],
                    ['Version', l.version],
                    ['Éditeur', l.editeur],
                    ['Description', l.description],
                ],
            },
            {
                titre: 'Licences',
                lignes: [
                    ['Nombre de licences', licences.length],
                    ['Total des sièges achetés', totalSieges || '—'],
                ],
            },
        ],
        sections: [
            ...(licences.length
                ? [{
                    titre: 'Détail des licences',
                    entetes: ['Référence', 'Type', 'Sièges', 'Acquisition', 'Expiration', 'Statut'],
                    lignes: licences.map((lic) => [
                        lic.reference_licence ?? '',
                        lic.type_licence ?? '',
                        lic.nb_licences ?? '',
                        formatDate(lic.date_acquisition),
                        formatDate(lic.date_expiration),
                        String(lic.statut ?? '').replace('_', ' '),
                    ]),
                }]
                : []),
            ...((l.installations ?? []).length
                ? [{
                    titre: `Installations (${(l.installations ?? []).length})`,
                    entetes: ['Code inventaire', 'Désignation'],
                    lignes: l.installations.map((i) => [
                        i.equipement?.code_inventaire ?? '',
                        i.equipement?.designation ?? '',
                    ]),
                }]
                : []),
        ],
    });
}

/** Fiche individuelle d'un fournisseur. */
export function ficheFournisseur(f) {
    ficheElement({
        titre: `Fiche fournisseur — ${f.raison_sociale ?? f.nom}`,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Raison sociale', f.raison_sociale ?? f.nom],
                    ['Contact', f.contact],
                    ['Statut', String(f.statut ?? 'actif').replace('_', ' ')],
                ],
            },
            {
                titre: 'Coordonnées',
                lignes: [
                    ['Téléphone', f.telephone],
                    ['E-mail', f.email],
                    ['Adresse', f.adresse],
                    ['RCS', f.rcs],
                ],
            },
            {
                titre: 'Enregistrement',
                lignes: [
                    ['Créé le', formatDate(f.created_at)],
                    ['Modifié le', formatDate(f.updated_at)],
                ],
            },
        ],
    });
}

/* ------------------------------------------------------------------ */
/* Référentiels organisationnels                                       */
/* ------------------------------------------------------------------ */

/** Fiche individuelle d'une direction. */
export function ficheDirection(d) {
    ficheElement({
        titre: `Fiche direction — ${d.nom_direction}`,
        sousTitre: d.code_direction ?? undefined,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Code', d.code_direction],
                    ['Nom', d.nom_direction],
                    ['Description', d.description],
                    ['Statut', String(d.statut ?? 'actif').replace('_', ' ')],
                ],
            },
            {
                titre: 'Contact',
                lignes: [
                    ['Téléphone', d.telephone],
                    ['E-mail', d.email],
                ],
            },
        ],
    });
}

/** Fiche individuelle d'un service. */
export function ficheService(s) {
    ficheElement({
        titre: `Fiche service — ${s.nom_service}`,
        sousTitre: s.code_service ?? undefined,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Code', s.code_service],
                    ['Nom', s.nom_service],
                    ['Description', s.description],
                    ['Statut', String(s.statut ?? 'actif').replace('_', ' ')],
                    ['Direction de rattachement', s.direction?.nom_direction ?? s.direction?.nom_direction ?? '—'],
                ],
            },
        ],
    });
}

/** Fiche individuelle d'un site. */
export function ficheSite(s) {
    ficheElement({
        titre: `Fiche site — ${s.nom_site}`,
        sousTitre: s.code_site ?? undefined,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Code', s.code_site],
                    ['Nom', s.nom_site],
                    ['Ville', s.ville],
                    ['Description', s.description],
                    ['Statut', String(s.statut ?? 'actif').replace('_', ' ')],
                ],
            },
        ],
    });
}

/** Fiche individuelle d'un bâtiment. */
export function ficheBatiment(b) {
    ficheElement({
        titre: `Fiche bâtiment — ${b.nom_batiment}`,
        sousTitre: b.code_batiment ?? undefined,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Code', b.code_batiment],
                    ['Nom', b.nom_batiment],
                    ['Site', b.site?.nom_site ?? b.site?.nom ?? '—'],
                    ['Description', b.description],
                    ['Statut', String(b.statut ?? 'actif').replace('_', ' ')],
                ],
            },
        ],
    });
}

/** Fiche individuelle d'une localisation (bureau / salle). */
export function ficheLocalisation(l) {
    ficheElement({
        titre: `Fiche localisation — ${l.nom_localisation}`,
        sousTitre: l.code_localisation ?? undefined,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Code', l.code_localisation],
                    ['Nom', l.nom_localisation],
                    ['Étage', l.etage],
                    ['Bureau', l.bureau],
                    ['Bâtiment', l.batiment?.nom_batiment ?? l.batiment?.nom ?? '—'],
                    ['Description', l.description],
                    ['Statut', String(l.statut ?? 'actif').replace('_', ' ')],
                ],
            },
        ],
    });
}

/* ------------------------------------------------------------------ */
/* Référentiels techniques du parc                                     */
/* ------------------------------------------------------------------ */

/** Fiche individuelle d'une catégorie d'équipement. */
export function ficheCategorie(c) {
    ficheElement({
        titre: `Fiche catégorie — ${c.nom_categorie}`,
        sousTitre: c.code_categorie ?? undefined,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Code', c.code_categorie],
                    ['Nom', c.nom_categorie],
                    ['Description', c.description],
                    ['Statut', String(c.statut ?? 'actif').replace('_', ' ')],
                ],
            },
        ],
    });
}

/** Fiche individuelle d'une marque. */
export function ficheMarque(m) {
    ficheElement({
        titre: `Fiche marque — ${m.nom_marque}`,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Nom', m.nom_marque],
                    ['Description', m.description],
                ],
            },
        ],
    });
}

/** Fiche individuelle d'un modèle d'équipement. */
export function ficheModele(m) {
    ficheElement({
        titre: `Fiche modèle — ${m.nom_modele}`,
        sousTitre: m.reference_modele ?? undefined,
        structure: [
            {
                titre: 'Identification',
                lignes: [
                    ['Référence', m.reference_modele],
                    ['Nom', m.nom_modele],
                    ['Description', m.description],
                ],
            },
            {
                titre: 'Classification',
                lignes: [
                    ['Catégorie', m.categorie?.nom_categorie ?? m.categorie?.nom ?? '—'],
                    ['Marque', m.marque?.nom_marque ?? m.marque?.nom ?? '—'],
                ],
            },
        ],
    });
}
