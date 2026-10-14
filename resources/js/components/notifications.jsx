import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    CheckCircle2, XCircle, Info, AlertTriangle, X,
} from 'lucide-react';

/*
 * Notifications GPI — deux briques :
 *  1. <ToastProvider>   : toasts empilés en bas à droite, sortie animée,
 *                         barre de progression, clic pour fermer.
 *  2. useConfirmation() : modale de confirmation animée (remplace confirm()).
 *
 * Usage :
 *   const toast = useToast();          toast.succes('Enregistré !');
 *   const confirmer = useConfirmation();
 *   if (await confirmer({ titre, message, danger })) { ... }
 */

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

const ConfigToasts = createContext(null);

const STYLES = {
    succes: { icone: CheckCircle2, bord: 'border-l-emerald-500', iconeCls: 'text-emerald-500', barre: 'bg-emerald-500' },
    erreur: { icone: XCircle, bord: 'border-l-rose-500', iconeCls: 'text-rose-500', barre: 'bg-rose-500' },
    info: { icone: Info, bord: 'border-l-sky-500', iconeCls: 'text-sky-500', barre: 'bg-sky-500' },
    avert: { icone: AlertTriangle, bord: 'border-l-amber-500', iconeCls: 'text-amber-500', barre: 'bg-amber-500' },
};

function Toast({ t, onFermer }) {
    const { icone: Icone, bord, iconeCls, barre } = STYLES[t.type] ?? STYLES.info;
    return (
        <div
            className={`toast-entree pointer-events-auto w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200/70 bg-card/95 shadow-xl shadow-slate-900/10 backdrop-blur border-l-4 ${bord} hover:shadow-2xl transition-shadow`}
            role="status"
        >
            <div className="flex items-start gap-2.5 p-3.5 pr-2">
                <Icone size={19} className={`${iconeCls} shrink-0 mt-0.5 anim-pop`} />
                <div className="min-w-0 flex-1">
                    {t.titre && <div className="text-sm font-bold text-slate-800">{t.titre}</div>}
                    <div className={`text-[13px] leading-snug text-slate-600 ${t.titre ? 'mt-0.5' : ''}`}>{t.message}</div>
                </div>
                <button
                    onClick={onFermer}
                    className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    aria-label="Fermer"
                >
                    <X size={14} />
                </button>
            </div>
            {/* Barre de durée de vie */}
            <div className="h-[3px] w-full bg-slate-100/70">
                <div
                    className={`h-full ${barre} toast-vie`}
                    style={{ animationDuration: `${t.duree ?? 4200}ms` }}
                />
            </div>
            <span className="hidden">{t.type}</span>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [liste, setListe] = useState([]);
    const compteur = useRef(0);

    const retirer = useCallback((id) => {
        setListe((l) => l.map((t) => (t.id === id ? { ...t, sortant: true } : t)));
        setTimeout(() => setListe((l) => l.filter((t) => t.id !== id)), 260);
    }, []);

    const ajouter = useCallback((type, message, titre, duree) => {
        const id = ++compteur.current;
        setListe((l) => [...l.slice(-4), { id, type, message, titre, duree }]);

        setTimeout(() => retirer(id), duree ?? 4200);
    }, [retirer]);

    // Écoute les notifications émises hors React (lib/rapport.js, api.jsx…)
    useEffect(() => {
        const ecoute = (e) => {
            const { type, message, titre } = e.detail ?? {};
            ajouter(type ?? 'info', message ?? '', titre);
        };
        window.addEventListener('gpi:toast', ecoute);
        return () => window.removeEventListener('gpi:toast', ecoute);
    }, [ajouter]);

    const api = {
        succes: (m, titre) => ajouter('succes', m, titre),
        erreur: (m, titre) => ajouter('erreur', m, titre),
        info: (m, titre) => ajouter('info', m, titre),
        avert: (m, titre) => ajouter('avert', m, titre),
    };

    return (
        <ConfigToasts.Provider value={api}>
            {children}
            <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex flex-col gap-2.5 items-end">
                {liste.map((t) => (
                    <Toast key={t.id} t={t} onFermer={() => retirer(t.id)} />
                ))}
            </div>
        </ConfigToasts.Provider>
    );
}

export function useToast() {
    return useContext(ConfigToasts);
}

/* ------------------------------------------------------------------ */
/* Modale de confirmation                                              */
/* ------------------------------------------------------------------ */

const ConfigConfirmation = createContext(null);

export function ConfirmationProvider({ children }) {
    const [etat, setEtat] = useState(null); // { titre, message, danger, texteOK, texteAnnuler, resolve }

    const confirmer = useCallback((options) => new Promise((resolve) => {
        
        setEtat({ ...options, resolve });
    }), []);

    const fermer = (resultat) => {
        
        setEtat((e) => { e?.resolve?.(resultat); return null; });
    };

    return (
        <ConfigConfirmation.Provider value={confirmer}>
            {children}
            {etat && (
                <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
                    {/* Fond flouté qui apparaît */}
                    <div
                        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px] anim-fade-in"
                        onClick={() => fermer(false)}
                    />
                    {/* Carte qui pop */}
                    <div className="modale-pop relative w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl border border-slate-200/50">
                        <div className="flex items-start gap-3.5">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 anim-pop ${
                                etat.danger ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
                            }`}>
                                {etat.danger ? <AlertTriangle size={21} /> : <Info size={21} />}
                                <span className="hidden">{etat.titre}</span>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base font-bold text-slate-800">{etat.titre ?? 'Confirmation'}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-slate-600 whitespace-pre-line">{etat.message}</p>
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={() => fermer(false)}
                                className="btn-moderne px-4 py-2 rounded-lg text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                            >
                                {etat.texteAnnuler ?? 'Annuler'}
                            </button>
                            <button
                                autoFocus
                                onClick={() => fermer(true)}
                                className={`btn-moderne px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm ${
                                    etat.danger
                                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                                }`}
                            >
                                {etat.texteOK ?? 'Confirmer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfigConfirmation.Provider>
    );
}

export function useConfirmation() {
    return useContext(ConfigConfirmation);
}
