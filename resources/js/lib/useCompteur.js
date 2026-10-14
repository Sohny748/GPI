import { useEffect, useRef, useState } from 'react';

/**
 * Compteur animé : compte de 0 vers la valeur avec un easing doux.
 * Reduction du mouvement respectée via la media query CSS (les valeurs s'affichent alors directement).
 */
export function useCompteur(valeur, duree = 900) {
    const [affiche, setAffiche] = useState(0);
    const refAnim = useRef(null);

    useEffect(() => {
        const cible = Number(valeur) || 0;
        if (
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            document.hidden
        ) {
            setAffiche(cible);
            return;
        }

        const depart = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
        let demarre = false;

        // Filet de sécurité : si requestAnimationFrame ne démarre jamais
        // (webview masquée, onglet en arrière-plan), afficher la cible directement.
        const filet = setTimeout(() => {
            if (! demarre) setAffiche(cible);
        }, 120);

        const tick = (maintenant) => {
            demarre = true;
            const progres = Math.min((maintenant - depart) / duree, 1);
            setAffiche(Math.round(cible * ease(progres)));
            if (progres < 1) refAnim.current = requestAnimationFrame(tick);
        };

        refAnim.current = requestAnimationFrame(tick);
        return () => { clearTimeout(filet); cancelAnimationFrame(refAnim.current); };
    }, [valeur, duree]);

    return affiche;
}
