import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, FileImage, Download, Trash2, Upload, Loader2, X, Eye } from 'lucide-react';
import { api } from '../api';
import { useToast, useConfirmation } from './notifications';
import DocumentViewer from './DocumentViewer';

const TYPES = [
    ['fiche_technique', 'Fiche technique'],
    ['recu_achat', 'Reçu d\u2019achat'],
    ['facture', 'Facture'],
    ['bon_livraison', 'Bon de livraison'],
    ['photo', 'Photo'],
    ['garantie', 'Attestation de garantie'],
    ['autre', 'Autre'],
];

const LIBELLES_TYPE = Object.fromEntries(TYPES);
const taille = (o) => (o == null ? '—' : o < 1024 ? `${o} o` : o < 1048576 ? `${(o / 1024).toFixed(1)} Ko` : `${(o / 1048576).toFixed(1)} Mo`);

/**
 * Modale de gestion documentaire d'un élément (équipement, achat…) :
 * liste des documents, import de PDF/images, ouverture, téléchargement, suppression.
 * props : { open, onClose, documentableType, documentableId, titre }
 */
export default function DocumentsModal({ open, onClose, documentableType, documentableId, titre }) {
    const [docs, setDocs] = useState(null);
    const [busy, setBusy] = useState(false);
    const [typeDoc, setTypeDoc] = useState('fiche_technique');
    const [description, setDescription] = useState('');
    const [erreur, setErreur] = useState(null);
    const [enConsultation, setEnConsultation] = useState(null);
    const inputRef = useRef(null);
    const toast = useToast();
    const confirmer = useConfirmation();

    const charger = useCallback(() => {
        if (! open || ! documentableId) return;
        api.get('/documents', { params: { documentable_type: documentableType, documentable_id: documentableId } })
            .then(({ data }) => setDocs(data))
            .catch(() => setErreur('Chargement des documents impossible.'));
    }, [open, documentableType, documentableId]);

    useEffect(() => {
        charger();
        if (open) {
            setErreur(null);
            }
    }, [charger, open]);

    if (! open) return null;

    const envoyer = async (fichiers) => {
        if (! fichiers?.length) return;
        setBusy(true);
        setErreur(null);
        try {
            for (const fichier of fichiers) {
                const fd = new FormData();
                fd.append('fichier', fichier);
                fd.append('nom_document', fichier.name);
                fd.append('type_document', typeDoc);
                if (description) fd.append('description', description);
                fd.append('documentable_type', documentableType);
                fd.append('documentable_id', String(documentableId));
                await api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            
            setDescription('');
            charger();
        } catch (err) {
            setErreur(err.response?.data?.message ?? 'Import impossible (fichier trop volumineux ou format refusé ?).');
            } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const supprimer = async (d) => {
        if (! await confirmer({
            titre: 'Supprimer ce document ?',
            message: `« ${d.nom_document} » sera définitivement supprimé.`,
            danger: true,
            texteOK: 'Supprimer',
        })) return;
        try {
            await api.delete(`/documents/${d.id_document}`);
            toast.succes('Document supprimé.');
            charger();
        } catch {
            toast.erreur('Suppression impossible.');
        }
    };

    if (enConsultation) {
        return <DocumentViewer doc={enConsultation} onClose={() => setEnConsultation(null)} />;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 gpi-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <div
                className="gpi-pop relative w-full max-w-2xl bg-card rounded-2xl border border-slate-200/50 shadow-2xl max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <FileText size={16} className="text-sky-400" /> Documents — {titre}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Import */}
                <div className="px-5 py-4 border-b border-slate-200/50 bg-slate-100/60">
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                        <select value={typeDoc} onChange={(e) => setTypeDoc(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200/70 bg-card text-sm text-slate-700">
                            {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (optionnelle)…"
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200/70 bg-card text-sm text-slate-700"
                        />
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => envoyer(e.target.files)}
                    />
                    <button
                        onClick={() => inputRef.current?.click()}
                        disabled={busy}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/60 hover:bg-sky-100 text-sky-400 text-sm font-bold transition-colors disabled:opacity-50"
                    >
                        {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {busy ? 'Import en cours…' : 'Importer un PDF ou une image (facture, fiche technique, reçu…)'}
                    </button>
                    <p className="text-[11px] text-slate-500 mt-1.5">Formats acceptés : PDF, JPG, PNG, WebP, GIF — 10 Mo max par fichier.</p>
                </div>

                {/* Liste */}
                <div className="overflow-y-auto px-5 py-4 flex-1">
                    {erreur && <div className="mb-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-500 text-sm p-3">{erreur}</div>}
                    {! docs && <p className="text-sm text-slate-500 py-4 text-center">Chargement…</p>}
                    {docs?.length === 0 && (
                        <p className="text-sm text-slate-500 py-6 text-center">
                            Aucun document. Importez une fiche technique, un reçu d'achat ou une photo.
                        </p>
                    )}
                    <div className="space-y-2">
                        {docs?.map((d) => {
                            const estImage = d.mime_type?.startsWith('image/');
                            return (
                                <div key={d.id_document} className="flex items-center gap-3 rounded-xl border border-slate-200/50 bg-slate-50 p-2.5 hover:bg-blue-50/40 transition-colors">
                                    {estImage && d.url ? (
                                        <img src={d.url} alt="" className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0" />
                                    ) : (
                                        <div className="w-11 h-11 rounded-lg bg-rose-100 text-rose-400 flex items-center justify-center shrink-0">
                                            <FileText size={18} />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-slate-800 truncate">{d.nom_document}</div>
                                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                                            <span className="px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-400 border border-sky-200 font-semibold">{LIBELLES_TYPE[d.type_document] ?? d.type_document ?? 'Autre'}</span>
                                            <span>{taille(d.taille_fichier)}</span>
                                            {d.created_at && <span>· {new Date(d.created_at).toLocaleDateString('fr-FR')}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {d.url && (
                                            <button
                                                onClick={() => setEnConsultation(d)}
                                                title="Consulter dans l'application"
                                                className="p-2 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-100 transition-colors"
                                            >
                                                <Eye size={15} />
                                            </button>
                                        )}
                                        <a href={d.telecharger_url} title="Télécharger" className="p-2 rounded-lg text-slate-500 hover:text-vert-500 hover:bg-vert-100 transition-colors">
                                            <Download size={15} />
                                        </a>
                                        <button onClick={() => supprimer(d)} title="Supprimer" className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-100 transition-colors">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
