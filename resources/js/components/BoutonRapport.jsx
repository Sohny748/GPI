import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { api } from '../api';
import { genererRapport } from '../lib/rapport';

/**
 * Bouton « Rapport PDF » — deux modes :
 *  1. endpoint + colonnes : charge l'API puis transforme les lignes
 *  2. lignes (direct) + colonnes en tuples [label, cléOuFn] : aucune requête,
 *     utilise les données déjà chargées par la page (ex. tableau de bord)
 * En complément : `texte` (liste de lignes à puces) et `sections` (tableaux multiples).
 *
 * colonnes : [{ label, valeur: (item) => string, numeric? }] ou [[label, clé|fn], …]
 */
export default function BoutonRapport({ endpoint, params = {}, titre, sousTitre, colonnes, lignes: lignesDirectes, texte, sections, surDonnees, compact = false }) {
    const [busy, setBusy] = useState(false);

    // Normalise les colonnes-tuples [[label, cléOuFn]] vers le format interne
    const normaliser = (cols) =>
        (cols ?? []).map((c) =>
            Array.isArray(c)
                ? { label: c[0], valeur: typeof c[1] === 'function' ? c[1] : (item) => item[c[1]] ?? '' }
                : c,
        );

    const generer = async () => {
        setBusy(true);
        try {
            if (lignesDirectes !== undefined) {
                genererRapport({
                    titre,
                    sousTitre: sousTitre ?? `${lignesDirectes.length} enregistrement(s)`,
                    colonnes: normaliser(colonnes),
                    lignes: lignesDirectes,
                    texte,
                    sections,
                    synthese: `${lignesDirectes.length} enregistrement(s)`,
                });
                return;
            }

            const { data } = await api.get(endpoint, { params });
            const items = Array.isArray(data) ? data : data.data ?? [data];

            if (surDonnees) {
                const rapport = surDonnees(items, data);
                genererRapport({ titre, sousTitre, ...rapport });
                return;
            }

            genererRapport({
                titre,
                sousTitre: sousTitre ?? `${items.length} enregistrement(s)`,
                colonnes: normaliser(colonnes),
                lignes: items,
                synthese: `${items.length} enregistrement(s)`,
            });
        } finally {
            setBusy(false);
        }
    };

    if (compact) {
        return (
            <button
                onClick={generer}
                disabled={busy}
                title="Exporter un rapport PDF"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200/60 bg-sky-100 hover:bg-sky-200 active:scale-[.95] text-sky-400 text-xs font-semibold transition-all disabled:opacity-50"
            >
                {busy ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
                PDF
            </button>
        );
    }

    return (
        <button
            onClick={generer}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-[.97] text-white text-sm font-bold shadow-sm shadow-sky-600/25 transition-all disabled:opacity-50"
        >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
            Rapport PDF
        </button>
    );
}
