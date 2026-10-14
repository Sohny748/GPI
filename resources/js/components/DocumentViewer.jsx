import { useEffect, useState } from 'react';
import { X, Download, Loader2, FileText, AlertTriangle } from 'lucide-react';

/**
 * Visionneuse de documents intégrée à l'application : le fichier s'affiche
 * dans un overlay plein écran (PDF via iframe, image via <img>) sans jamais
 * ouvrir un autre onglet du navigateur. Échap ou clic sur le fond referme.
 * props : { doc: {nom_document, url, telecharger_url, mime_type}, onClose }
 */
export default function DocumentViewer({ doc, onClose }) {
    const [chargement, setChargement] = useState(true);
    const [echec, setEchec] = useState(false);

    useEffect(() => {
        if (! doc) return undefined;
        setChargement(true);
        setEchec(false);
        
        const esc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    }, [doc, onClose]);

    if (! doc) return null;

    const estImage = doc.mime_type?.startsWith('image/');

    return (
        <div className="fixed inset-0 z-[60] flex flex-col gpi-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

            {/* Barre supérieure : nom du fichier + actions */}
            <div
                className="relative flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-700/60"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <FileText size={15} className="text-sky-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-100 truncate">{doc.nom_document}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <a
                        href={doc.telecharger_url ?? doc.url}
                        title="Télécharger"
                        className="p-2 rounded-lg text-slate-300 hover:text-vert-400 hover:bg-slate-800 transition-colors"
                    >
                        <Download size={16} />
                    </a>
                    <button
                        onClick={onClose}
                        title="Fermer (Échap)"
                        className="p-2 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Contenu : aperçu du document */}
            <div className="relative flex-1 min-h-0 p-3" onClick={(e) => e.stopPropagation()}>
                {echec || ! doc.url ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-300 text-sm text-center">
                        <AlertTriangle size={28} className="text-amber-400" />
                        <p>Aperçu impossible pour ce fichier.</p>
                        <a href={doc.telecharger_url ?? doc.url} className="text-sky-400 underline">Télécharger le document</a>
                    </div>
                ) : estImage ? (
                    <div className="h-full flex items-center justify-center">
                        <img
                            src={doc.url}
                            alt={doc.nom_document}
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                            onLoad={() => setChargement(false)}
                            onError={() => { setChargement(false); setEchec(true); }}
                        />
                    </div>
                ) : (
                    <iframe
                        src={doc.url}
                        title={doc.nom_document}
                        className="w-full h-full rounded-xl bg-white shadow-2xl border border-slate-700/60"
                        onLoad={() => setChargement(false)}
                    />
                )}
                {chargement && ! echec && doc.url && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 pointer-events-none">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-sm">Chargement du document…</span>
                    </div>
                )}
            </div>
        </div>
    );
}
