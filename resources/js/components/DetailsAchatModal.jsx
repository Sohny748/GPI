import { useCallback, useEffect, useState } from 'react';
import {
    X, Plus, Trash2, Pencil, Package, Loader2, Check,
} from 'lucide-react';
import { api } from '../api';
import { formatDate, formatAr } from '../lib/constants';
import { ErrorText, Field, inputClass } from './ui';
import { useToast, useConfirmation } from './notifications';

const VIDE_LIGNE = { id_equipement: '', quantite: '1', prix_unitaire: '', date_livraison: '', description: '' };

/*
 * Modale « Détails d'achat » : lignes d'articles d'un achat (équipement,
 * quantité, prix unitaire, montant calculé). Le total est recalculé à
 * chaque opération et mis à jour automatiquement côté serveur.
 */
export default function DetailsAchatModal({ open, onClose, achat, onTotalChange }) {
    const [lignes, setLignes] = useState(null);
    const [equipements, setEquipements] = useState([]);
    const [form, setForm] = useState(VIDE_LIGNE);
    const [editId, setEditId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState(null);
    const toast = useToast();
    const confirmer = useConfirmation();

    const charger = useCallback(() => {
        if (! open || ! achat) return;
        api.get(`/achats/${achat.id_achat}/details`)
            .then(({ data }) => setLignes(data))
            .catch(() => setLignes([]));
    }, [open, achat]);

    useEffect(() => {
        charger();
        if (open) {
            setForm(VIDE_LIGNE);
            setEditId(null);
            setErrors(null);
            }
    }, [charger, open]);

    useEffect(() => {
        if (! open) return;
        api.get('/equipements', { params: { per_page: 100 } })
            .then(({ data }) => setEquipements(data.data ?? []));
    }, [open]);

    if (! open) return null;

    const montantLigne = (l) => Number(l.montant ?? ((l.quantite ?? 0) * (l.prix_unitaire ?? 0)));
    const total = (lignes ?? []).reduce((s, l) => s + montantLigne(l), 0);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors(null);
        try {
            const payload = {
                ...form,
                id_equipement: form.id_equipement || null,
                quantite: Number(form.quantite) || 1,
                prix_unitaire: form.prix_unitaire === '' ? null : Number(form.prix_unitaire),
                date_livraison: form.date_livraison || null,
            };
            if (editId) {
                await api.put(`/details-achats/${editId}`, payload);
            } else {
                await api.post(`/achats/${achat.id_achat}/details`, payload);
            }
            
            setForm(VIDE_LIGNE);
            setEditId(null);
            charger();
            onTotalChange?.(achat.id_achat, total);
        } catch (err) {
            setErrors(err.response?.data?.errors ?? { erreur: ['Enregistrement impossible.'] });
            } finally {
            setBusy(false);
        }
    };

    const ouvrirEdition = (l) => {
        setEditId(l.id_detail_achat);
        setForm({
            id_equipement: l.id_equipement ?? '',
            quantite: String(l.quantite ?? 1),
            prix_unitaire: l.prix_unitaire ?? '',
            date_livraison: l.date_livraison ? String(l.date_livraison).slice(0, 10) : '',
            description: l.description ?? '',
        });
        };

    const supprimer = async (l) => {
        if (! await confirmer({
            titre: 'Supprimer cette ligne ?',
            message: `L'article « ${l.equipement?.designation ?? l.description ?? 'ligne de détail'} » sera retiré de cet achat.`,
            danger: true,
            texteOK: 'Supprimer',
        })) return;
        try {
            await api.delete(`/details-achats/${l.id_detail_achat}`);
            toast.succes('Ligne supprimée — montant total recalculé.');
            charger();
        } catch {
            toast.erreur('Suppression impossible.');
        }
    };

    const prixEstime = form.quantite && form.prix_unitaire
        ? Number(form.quantite) * Number(form.prix_unitaire)
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 gpi-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <div
                className="gpi-pop relative w-full max-w-2xl bg-card rounded-2xl border border-slate-200/50 shadow-2xl max-h-[88vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Package size={16} className="text-vert-400" />
                        Détails d'achat — {achat?.reference_achat ?? `#${achat?.id_achat}`}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Liste des lignes */}
                <div className="overflow-y-auto px-5 py-4 flex-1">
                    {! lignes && <p className="text-sm text-slate-500 py-4 text-center">Chargement…</p>}
                    {lignes?.length === 0 && (
                        <p className="text-sm text-slate-500 py-4 text-center">
                            Aucune ligne. Ajoutez les articles achetés ci-dessous.
                        </p>
                    )}
                    <div className="space-y-2">
                        {lignes?.map((l, i) => (
                            <div
                                key={l.id_detail_achat}
                                className="anim-fade-up flex items-center gap-3 rounded-xl border border-slate-200/50 bg-slate-50 p-3 hover:bg-blue-50/40 hover:shadow-sm transition-all group"
                                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
                            >
                                <div className="w-9 h-9 rounded-lg bg-vert-100 text-vert-400 flex items-center justify-center font-bold text-xs shrink-0">
                                    ×{l.quantite}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-slate-800 truncate">
                                        {l.equipement ? `${l.equipement.code_inventaire} — ${l.equipement.designation}` : (l.description ?? 'Article')}
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                                        {l.prix_unitaire != null && <span>{formatAr(l.prix_unitaire)} / unité</span>}
                                        {l.date_livraison && <span>· livré le {formatDate(l.date_livraison)}</span>}
                                    </div>
                                </div>
                                <div className="font-bold text-sm text-slate-800 tabular-nums shrink-0">
                                    {formatAr(montantLigne(l))}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => ouvrirEdition(l)} title="Modifier la ligne" className="p-1.5 rounded-lg text-slate-500 hover:text-orange-400 hover:bg-orange-100 transition-colors">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => supprimer(l)} title="Supprimer la ligne" className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-100 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className="px-5 py-3 border-t border-slate-200/50 bg-slate-100/60 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Total de l'achat</span>
                    <span className="text-lg font-extrabold text-vert-400 tabular-nums">{formatAr(total)}</span>
                </div>

                {/* Formulaire d'ajout / édition */}
                <form onSubmit={submit} className="px-5 py-4 border-t border-slate-200/50">
                    <ErrorText errors={errors} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <Field label="Équipement">
                            <select value={form.id_equipement} onChange={(e) => setForm({ ...form, id_equipement: e.target.value })} className={inputClass}>
                                <option value="">— Article libre —</option>
                                {equipements.map((eq) => (
                                    <option key={eq.id_equipement} value={eq.id_equipement}>{eq.code_inventaire}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Quantité" required>
                            <input type="number" min="1" required value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} className={inputClass} />
                        </Field>
                        <Field label="Prix unitaire (Ar)">
                            <input type="number" min="0" value={form.prix_unitaire} onChange={(e) => setForm({ ...form, prix_unitaire: e.target.value })} className={inputClass} />
                        </Field>
                        <Field label={editId ? 'Modifier la ligne' : 'Nouvelle ligne'}>
                            <button
                                type="submit"
                                disabled={busy}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-vert-600 hover:bg-vert-700 active:scale-[.97] text-white text-sm font-bold shadow-sm shadow-vert-600/30 transition-all disabled:opacity-50"
                            >
                                {busy ? <Loader2 size={15} className="animate-spin" />
                                    : editId ? <><Check size={15} /> Enregistrer</>
                                        : <><Plus size={15} /> Ajouter</>}
                            </button>
                        </Field>
                    </div>
                    {prixEstime != null && (
                        <p className="text-[11px] text-vert-400 font-semibold mt-1 text-right">
                            Ligne : {formatAr(prixEstime)}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
