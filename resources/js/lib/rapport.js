
/*
 * Génération de rapports PDF via la fenêtre d'impression du navigateur
 * (aucune dépendance) : une feuille A4 propre, en-tête officiel DGSR,
 * tableau des données, pied de page daté — puis window.print().
 * L'utilisateur choisit « Enregistrer au format PDF » dans la boîte d'impression
 * pour EXPORTER un vrai PDF, ou une imprimante pour IMPRIMER.
 */

const echapper = (v) =>
    String(v ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');

function enTete(titre, sousTitre) {
    return `
    <div class="entete">
      <div class="logo">DGSR</div>
      <div class="entete-texte">
        <h1>${echapper(titre)}</h1>
        ${sousTitre ? `<p>${echapper(sousTitre)}</p>` : ''}
        <p class="entete-org">Direction Générale de la Sécurité Routière — Système GPI</p>
      </div>
    </div>`;
}

function pied() {
    const maintenant = new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
    return `
    <div class="pied">
      <span>GPI — Gestion du Parc Informatique</span>
      <span>Généré le ${echapper(maintenant)}</span>
    </div>`;
}

function tableau(colonnes, lignes) {
    if (! lignes.length) return '<p class="vide">Aucune donnée à afficher.</p>';
    return `
    <table>
      <thead>
        <tr>${colonnes.map((c) => `<th>${echapper(c.label)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${lignes
            .map(
                (l) => `<tr>${colonnes
                    .map((c) => `<td${c.numeric ? ' class="num"' : ''}>${echapper(c.valeur(l))}</td>`)
                    .join('')}</tr>`,
            )
            .join('')}
      </tbody>
    </table>`;
}

function sections(blocs) {
    // blocs : [{ titre, colonnes?: [{label, valeur}], lignes }] — un tableau par section
    return (blocs ?? [])
        .map((b) => `
    <div class="section">
      <h2>${echapper(b.titre)}</h2>
      ${tableau(
          b.colonnes ?? (b.lignes[0]
              ? b.lignes[0].map((_, i) => ({ label: b.entetes?.[i] ?? `Colonne ${i + 1}`, valeur: (l) => l[i] ?? '' }))
              : []),
          b.lignes,
      )}
    </div>`)
        .join('');
}

function texte(textes) {
    if (! textes?.length) return '';
    return `
    <ul class="points">
      ${textes.map((t) => `<li>${echapper(t)}</li>`).join('')}
    </ul>`;
}

function fiches(blocs) {
    // blocs : [{ titre, lignes: [{label, valeur}] }]
    return (blocs ?? [])
        .map(
            (b) => `
    <div class="fiche">
      <h2>${echapper(b.titre)}</h2>
      ${b.lignes.map((l) => `<div class="ligne-fiche"><span>${echapper(l.label)}</span><strong>${echapper(l.valeur)}</strong></div>`).join('')}
    </div>`,
        )
        .join('');
}

const STYLES = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #0f172a; font-size: 12px; padding: 32px 40px; }
    .entete { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #1d4ed8; padding-bottom: 14px; margin-bottom: 18px; }
    .logo { width: 54px; height: 54px; border-radius: 14px; background: linear-gradient(135deg, #1d4ed8, #0ea5e9); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; letter-spacing: .5px; }
    .entete h1 { font-size: 20px; font-weight: 800; }
    .entete p { font-size: 11px; color: #64748b; margin-top: 2px; }
    .entete-org { font-weight: 600; color: #334155 !important; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    th { background: #1e3a8a; color: #fff; text-align: left; padding: 7px 9px; font-size: 10.5px; text-transform: uppercase; letter-spacing: .4px; }
    td { padding: 6px 9px; border-bottom: 1px solid #e2e8f0; font-size: 11.5px; }
    tr:nth-child(even) td { background: #f8fafc; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    .fiche { margin-top: 14px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; break-inside: avoid; }
    .section { margin-top: 18px; break-inside: avoid; }
    .section h2 { font-size: 13px; margin-bottom: 6px; color: #1e3a8a; border-left: 4px solid #1d4ed8; padding-left: 8px; }
    .points { margin: 10px 0 0 18px; }
    .points li { padding: 2.5px 0; font-size: 12px; }
    .fiche h2 { font-size: 13px; margin-bottom: 8px; color: #1e3a8a; }
    .ligne-fiche { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #e2e8f0; font-size: 11.5px; }
    .ligne-fiche:last-child { border-bottom: 0; }
    .vide { margin-top: 16px; color: #64748b; font-style: italic; }
    .pied { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; padding: 10px 40px; border-top: 2px solid #1d4ed8; font-size: 10px; color: #64748b; background: #fff; }
    @media print { body { padding-bottom: 50px; } }
`;

/**
 * Ouvre la boîte d'impression avec un rapport formaté.
 * options : { titre, sousTitre, colonnes, lignes, fiches, sections, texte, synthese }
 */
export function genererRapport({ titre, sousTitre, colonnes = [], lignes = [], fiches: blocs = null, sections: blocsSections = null, texte: points = null, synthese = null }) {
    
    const fenetre = window.open('', '_blank', 'width=920,height=1000');
    if (! fenetre) {
        // Notification élégante à la place d'un alert() natif : le toast est
        // affiché dans l'application via l'événement global écouté par ToastProvider.
        window.dispatchEvent(new CustomEvent('gpi:toast', {
            detail: { type: 'erreur', titre: 'Fenêtre bloquée', message: 'Autorisez les pop-ups pour ce site afin d\u2019ouvrir le rapport PDF.' },
        }));
        return;
    }

    fenetre.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${echapper(titre)}</title>
  <style>${STYLES}</style>
</head>
<body>
  ${enTete(titre, sousTitre)}
  ${synthese ? `<p class="entete-org" style="margin-bottom:4px">${echapper(synthese)}</p>` : ''}
  ${points ? texte(points) : ''}
  ${colonnes.length ? tableau(colonnes, lignes) : ''}
  ${blocsSections ? sections(blocsSections) : ''}
  ${blocs ? fiches(blocs) : ''}
  ${pied()}
  <script>window.onload = () => setTimeout(() => window.print(), 350);<\/script>
</body>
</html>`);
    fenetre.document.close();
}
