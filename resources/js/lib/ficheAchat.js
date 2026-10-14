import { STATUTS_ACHAT, formatDate, formatAr } from './constants';
import { genererRapport } from './rapport';

/*
 * Fiche complète d'un achat : identification, fournisseur, montants,
 * lignes de détail (articles, quantités, prix), statut et documents.
 * Deux usages :
 *  - ficheCompleteAchat(a)     → PDF d'un seul achat
 *  - fichesCompletesAchats(l)  → PDF regroupant tous les achats
 */

const K = (label, valeur) => ({ label, valeur });
const txt = (v, alt = '—') => (v == null || v === '' ? alt : String(v));
const statutLabel = (s) => STATUTS_ACHAT[s]?.label ?? txt(s);

function identificationAchat(a) {
    return [
        K('Référence', txt(a.reference_achat)),
        K("Date de l'achat", txt(formatDate(a.date_achat))),
        K('Statut', statutLabel(a.statut)),
        K('Description', txt(a.description)),
    ];
}

function fournisseurAchat(a) {
    const f = a.fournisseur;
    return [
        K('Fournisseur', txt(f?.raison_sociale)),
        K('Contact', txt(f?.nom_contact)),
        K('Téléphone', txt(f?.telephone)),
        K('E-mail', txt(f?.email)),
        K('Adresse', txt(f?.adresse)),
    ];
}

function financierAchat(a) {
    return [
        K('Montant total', txt(a.montant_total != null ? formatAr(a.montant_total) : null)),
        K('N° de facture', txt(a.numero_facture)),
        K('Bon de commande', txt(a.bon_commande)),
        K('Nombre de lignes de détail', txt(a.details?.length ?? 0)),
        K('Enregistré le', txt(formatDate(a.created_at))),
        K('Dernière modification', txt(formatDate(a.updated_at))),
    ];
}

export function sectionsAchat(a) {
    const lignes = (a.details ?? []).map((l) => [
        txt(l.equipement ? `${l.equipement.code_inventaire} — ${l.equipement.designation}` : l.description),
        String(l.quantite ?? '—'),
        txt(l.prix_unitaire != null ? formatAr(l.prix_unitaire) : null),
        txt(l.montant != null ? formatAr(l.montant) : null),
        txt(l.date_livraison ? formatDate(l.date_livraison) : null),
        txt(l.description),
    ]);

    // NB : les documents sont rattachés aux équipements / affectations / tickets,
    // jamais aux achats — pas de section « Documents rattachés » ici.
    return [
        {
            titre: `Lignes de détail (${lignes.length})`,
            entetes: ['Article / Équipement', 'Qté', 'Prix unitaire', 'Montant', 'Livré le', 'Description'],
            lignes,
        },
    ];
}

/** PDF complet d'un achat. */
export function ficheCompleteAchat(a) {
    const nbLignes = a.details?.length ?? 0;
    const sommeLignes = (a.details ?? []).reduce((s, l) => s + (Number(l.montant ?? ((l.quantite ?? 0) * (l.prix_unitaire ?? 0))) || 0), 0);

    genererRapport({
        titre: `Fiche complète d'achat — ${a.reference_achat ?? `#${a.id_achat}`}`,
        sousTitre: `${statutLabel(a.statut)} · ${txt(formatDate(a.date_achat))}`,
        synthese: `Montant total : ${a.montant_total != null ? formatAr(a.montant_total) : '—'}${nbLignes ? ` — ${nbLignes} ligne(s) de détail totalisant ${formatAr(sommeLignes)}` : ''}`,
        fiches: [
            { titre: 'Identification', lignes: identificationAchat(a) },
            { titre: 'Fournisseur', lignes: fournisseurAchat(a) },
            { titre: 'Données financières & facturation', lignes: financierAchat(a) },
        ],
        sections: sectionsAchat(a),
    });
}

/** PDF regroupant les fiches complètes de plusieurs achats. */
export function fichesCompletesAchats(achats) {
    const fiches = achats.map((a) => ({
        titre: `${txt(a.reference_achat)} — ${statutLabel(a.statut)}`,
        lignes: [
            ...identificationAchat(a).slice(0, 2),
            K('Fournisseur', txt(a.fournisseur?.raison_sociale)),
            K('Facture', txt(a.numero_facture)),
            K('Bon de commande', txt(a.bon_commande)),
            K('Montant total', txt(a.montant_total != null ? formatAr(a.montant_total) : null)),
            K("Lignes de détail", txt(a.details?.length ?? 0)),
        ],
    }));

    genererRapport({
        titre: "Fiches complètes des achats",
        sousTitre: `${achats.length} achat(s) — toutes informations`,
        synthese: `Montant cumulé : ${formatAr(achats.reduce((s, a) => s + (Number(a.montant_total) || 0), 0))}`,
        fiches,
    });
}
