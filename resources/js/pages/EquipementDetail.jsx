import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft, Monitor, MapPin, CalendarDays, CircleDollarSign, ShieldCheck,
    Wrench, LifeBuoy, ArrowLeftRight, Disc, FileText, User, FileDown, GraduationCap, AlertTriangle,
} from 'lucide-react';
import { api } from '../api';
import { Spinner, Badge, EmptyState } from '../components/ui';
import { STATUTS_EQUIPEMENT, STATUTS_MAINTENANCE, STATUTS_TICKET, formatDate, formatAr } from '../lib/constants';
import BoutonRapport from '../components/BoutonRapport';
import DocumentsModal from '../components/DocumentsModal';
import DocumentViewer from '../components/DocumentViewer';
import { useToast, useConfirmation } from '../components/notifications';
import { ficheComplete } from '../lib/ficheEquipement';

function Section({ icon: Icon, title, children }) {
    return (
        <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                <Icon size={15} className="text-blue-400" /> {title}
            </h3>
            {children}
        </div>
    );
}

function Row({ label, children }) {
    return (
        <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
            <span className="text-xs text-slate-500 shrink-0">{label}</span>
            <span className="text-sm font-medium text-slate-800 text-right">{children}</span>
        </div>
    );
}

export default function EquipementDetail() {
    const { id } = useParams();
    const [eq, setEq] = useState(null);
    const [error, setError] = useState(null);
    const [showDocs, setShowDocs] = useState(false);
    const [enConsultation, setEnConsultation] = useState(null);
    const toast = useToast();
    const confirmer = useConfirmation();

    useEffect(() => {
        api.get(`/equipements/${id}`)
            .then(({ data }) => setEq(data))
            .catch(() => setError('Équipement introuvable.'));
    }, [id]);

    /** Reclasser en stock un équipement « en service » sans utilisateur. */
    const reparerStatut = async () => {
        const ok = await confirmer({
            titre: 'Corriger le statut ?',
            message: 'Cet équipement est marqué « En service » mais aucun service ni agent ne l\u2019utilise.\nLe reclasser en « En stock » ?',
            texteOK: 'Reclasser en stock',
        });
        if (! ok) return;
        try {
            await api.put(`/equipements/${eq.id_equipement}`, { ...eq, statut: 'en_stock' });
            toast.succes('Statut corrigé : l\u2019équipement est maintenant « En stock ».');
            const { data } = await api.get(`/equipements/${id}`);
            setEq(data);
        } catch {
            toast.erreur('Correction impossible.');
        }
    };

    if (error) return <EmptyState icon={Monitor} title={error} hint={<Link to="/equipements" className="text-blue-400 underline">Retour à la liste</Link>} />;
    if (! eq) return <Spinner label="Chargement de la fiche…" />;

    const actives = eq.affectations?.filter((a) => ! a.date_fin) ?? [];
    const utilisePar = actives[0] ?? null;
    // Cohérence : un équipement « en service » devrait avoir un utilisateur.
    const incoherent = eq.statut === 'en_service' && ! utilisePar;

    return (
        <div>
            <Link to="/equipements" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-300 mb-3">
                <ArrowLeft size={14} /> Retour aux équipements
            </Link>

            {/* En-tête fiche */}
            <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center shrink-0">
                            <Monitor size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg font-extrabold text-slate-800">{eq.designation}</h1>
                                <Badge color={STATUTS_EQUIPEMENT[eq.statut]?.color}>
                                    {STATUTS_EQUIPEMENT[eq.statut]?.label ?? eq.statut}
                                </Badge>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-blue-300">{eq.code_inventaire}</span>
                                <span>·</span>
                                <span>{eq.marque?.nom_marque} {eq.modele?.nom_modele}</span>
                                <span>·</span>
                                <span className="font-mono">{eq.numero_serie ?? 'sans n° série'}</span>
                            </div>
                            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => ficheComplete(eq)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-[.97] text-white text-xs font-bold shadow-sm shadow-sky-600/25 transition-all"
                                    title="Exporter toutes les informations de cet équipement en PDF"
                                >
                                    <FileDown size={13} /> Fiche complète PDF
                                </button>
                                {incoherent && (
                                    <button
                                        onClick={reparerStatut}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-[.97] text-white text-xs font-bold shadow-sm shadow-amber-500/25 transition-all"
                                        title="Aucun service ni affectation active : reclasser en « En stock »"
                                    >
                                        <Wrench size={13} /> Statut incohérent — corriger
                                    </button>
                                )}
                                <BoutonRapport
                                    compact
                                    endpoint={`/equipements/${eq.id_equipement}`}
                                    titre={`Fiche équipement — ${eq.code_inventaire}`}
                                    colonnes={[
                                        { label: 'Caractéristique', valeur: (r) => r.label },
                                        { label: 'Valeur', valeur: (r) => r.valeur },
                                    ]}
                                    surDonnees={() => ({
                                        colonnes: [
                                            { label: 'Caractéristique', valeur: (r) => r.label },
                                            { label: 'Valeur', valeur: (r) => r.valeur },
                                        ],
                                        lignes: [
                                            { label: 'Désignation', valeur: eq.designation },
                                            { label: 'Code inventaire', valeur: eq.code_inventaire },
                                            { label: 'N° de série', valeur: eq.numero_serie ?? '—' },
                                            { label: 'Catégorie', valeur: eq.categorie?.nom_categorie ?? '—' },
                                            { label: 'Marque / Modèle', valeur: [eq.marque?.nom_marque, eq.modele?.nom_modele].filter(Boolean).join(' ') || '—' },
                                            { label: 'Statut', valeur: STATUTS_EQUIPEMENT[eq.statut]?.label ?? eq.statut },
                                            { label: 'Direction', valeur: eq.direction?.nom_direction ?? '—' },
                                            { label: 'Service', valeur: eq.service?.nom_service ?? '—' },
                                            { label: 'Localisation', valeur: eq.localisation?.nom_localisation ?? 'Stock' },
                                            { label: 'Fournisseur', valeur: eq.fournisseur?.raison_sociale ?? '—' },
                                            { label: 'Date d\'acquisition', valeur: formatDate(eq.date_acquisition) },
                                            { label: 'Mise en service', valeur: formatDate(eq.date_mise_service) },
                                            { label: "Prix d'acquisition", valeur: formatAr(eq.prix_acquisition) },
                                            { label: 'Fin de garantie', valeur: eq.garantie_fin ? formatDate(eq.garantie_fin) : '—' },
                                        ],
                                        synthese: `Fiche détaillée de l'équipement ${eq.code_inventaire}`,
                                    })}
                                />
                                <button
                                    onClick={() => setShowDocs(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[.97] text-white text-xs font-bold shadow-sm transition-all"
                                >
                                    <FileText size={13} /> Documents ({eq.documents?.length ?? 0})
                                </button>
                            </div>
                        </div>
                    </div>
                    {eq.etat && <Badge color="bg-slate-100 text-slate-700 border-slate-200">État : {eq.etat.nom_etat}</Badge>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Caractéristiques */}
                <Section icon={Monitor} title="Caractéristiques">
                    <Row label="Catégorie">{eq.categorie?.nom_categorie ?? '—'}</Row>
                    <Row label="Modèle">{eq.modele?.nom_modele ?? '—'}</Row>
                    <Row label="Direction">{eq.direction?.nom_direction ?? '—'}</Row>
                    <Row label="Service">{eq.service?.nom_service ?? '—'}</Row>
                    <Row label="Fournisseur">{eq.fournisseur?.raison_sociale ?? '—'}</Row>
                    <Row label="Localisation">
                        {eq.localisation
                            ? <span className="inline-flex items-center gap-1"><MapPin size={13} className="text-slate-400" />{eq.localisation.nom_localisation}</span>
                            : 'Stock'}
                    </Row>
                </Section>

                {/* Cycle de vie */}
                <Section icon={CalendarDays} title="Cycle de vie">
                    <Row label="Acquisition">{formatDate(eq.date_acquisition)}</Row>
                    <Row label="Mise en service">{formatDate(eq.date_mise_service)}</Row>
                    <Row label="Prix d'acquisition">
                        <span className="inline-flex items-center gap-1"><CircleDollarSign size={13} className="text-blue-400" />{formatAr(eq.prix_acquisition)}</span>
                    </Row>
                    <Row label="Garantie">
                        {eq.garantie_fin
                            ? <span className="inline-flex items-center gap-1">
                                <ShieldCheck size={13} className={new Date(eq.garantie_fin) > new Date() ? 'text-blue-400' : 'text-slate-500'} />
                                jusqu'au {formatDate(eq.garantie_fin)}
                              </span>
                            : '—'}
                    </Row>
                    <Row label="Créée le">{formatDate(eq.created_at)}</Row>
                </Section>

                {/* Utilisateur actuel — qui utilise cet équipement ? */}
                <Section icon={User} title={utilisePar ? 'Utilisé par' : 'Utilisation'}>
                    {utilisePar ? (
                        <div>
                            <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 p-3.5">
                                <div className="w-11 h-11 rounded-full bg-blue-700 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                                    {(utilisePar.agent ? `${utilisePar.agent.prenom?.[0] ?? ''}${utilisePar.agent.nom_naiss?.[0] ?? ''}` : '?').toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-extrabold text-slate-800">
                                        {utilisePar.agent ? `${utilisePar.agent.prenom} ${utilisePar.agent.nom_naiss}` : '—'}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        {utilisePar.agent?.matricule && <span className="font-mono font-bold text-blue-300">{utilisePar.agent.matricule}</span>}
                                        {utilisePar.agent?.fonction && <span> · {utilisePar.agent.fonction}</span>}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                                        {utilisePar.agent?.service?.nom_service && <span className="font-semibold text-slate-600">Service : {utilisePar.agent.service.nom_service}</span>}
                                        {utilisePar.agent?.direction?.nom_direction && <span>· {utilisePar.agent.direction.nom_direction}</span>}
                                    </div>
                                </div>
                                <span className="ml-auto shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-300 border border-blue-200">
                                    depuis le {formatDate(utilisePar.date_affectation)}
                                </span>
                            </div>
                            {utilisePar.motif && <p className="mt-2 text-[11px] text-slate-500 italic">Motif : {utilisePar.motif}</p>}
                            <Link to="/affectations" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 hover:underline">
                                <ArrowLeftRight size={12} /> Gérer les affectations
                            </Link>
                        </div>
                    ) : (
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-sm text-slate-600">
                            {eq.statut === 'en_service' ? (
                                <span className="flex items-start gap-2">
                                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-slate-800">Incohérence détectée :</strong> marqué « En service »
                                        mais aucun agent ni service ne l'utilise. Utilisez le bouton de correction ci-dessus
                                        ou <Link to="/affectations" className="text-blue-300 underline font-semibold">créez une affectation</Link>.
                                    </span>
                                </span>
                            ) : (
                                <span>Aucun utilisateur actuel — équipement {eq.statut === 'en_stock' ? 'en stock' : eq.statut === 'en_maintenance' ? 'en maintenance' : 'non affecté'}.</span>
                            )}
                        </div>
                    )}
                </Section>

                {/* Utilisateur actuel — qui utilise cet équipement ? */}
                <Section icon={User} title={utilisePar ? 'Utilisé par' : 'Utilisation'}>
                    {utilisePar ? (
                        <div>
                            <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 p-3.5">
                                <div className="w-11 h-11 rounded-full bg-blue-700 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                                    {(utilisePar.agent ? `${utilisePar.agent.prenom?.[0] ?? ''}${utilisePar.agent.nom_naiss?.[0] ?? ''}` : '?').toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-extrabold text-slate-800">
                                        {utilisePar.agent ? `${utilisePar.agent.prenom} ${utilisePar.agent.nom_naiss}` : '—'}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        {utilisePar.agent?.matricule && <span className="font-mono font-bold text-blue-300">{utilisePar.agent.matricule}</span>}
                                        {utilisePar.agent?.fonction && <span> · {utilisePar.agent.fonction}</span>}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                                        {utilisePar.agent?.service?.nom_service && <span className="font-semibold text-slate-600">Service : {utilisePar.agent.service.nom_service}</span>}
                                        {utilisePar.agent?.direction?.nom_direction && <span>· {utilisePar.agent.direction.nom_direction}</span>}
                                    </div>
                                </div>
                                <span className="ml-auto shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-300 border border-blue-200">
                                    depuis le {formatDate(utilisePar.date_affectation)}
                                </span>
                            </div>
                            {utilisePar.motif && <p className="mt-2 text-[11px] text-slate-500 italic">Motif : {utilisePar.motif}</p>}
                            <Link to="/affectations" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 hover:underline">
                                <ArrowLeftRight size={12} /> Gérer les affectations
                            </Link>
                        </div>
                    ) : (
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-sm text-slate-600">
                            {eq.statut === 'en_service' ? (
                                <span className="flex items-start gap-2">
                                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-slate-800">Incohérence détectée :</strong> marqué « En service »
                                        mais aucun agent ni service ne l'utilise. Utilisez le bouton de correction ci-dessus
                                        ou <Link to="/affectations" className="text-blue-300 underline font-semibold">créez une affectation</Link>.
                                    </span>
                                </span>
                            ) : (
                                <span>Aucun utilisateur actuel — équipement {eq.statut === 'en_stock' ? 'en stock' : eq.statut === 'en_maintenance' ? 'en maintenance' : 'non affecté'}.</span>
                            )}
                        </div>
                    )}
                </Section>

                {/* Affectations */}
                <Section icon={User} title={`Affectations (${eq.affectations?.length ?? 0})`}>
                    {eq.affectations?.length === 0 && <p className="text-xs text-slate-500">Jamais affecté.</p>}
                    <div className="space-y-2">
                        {actives.map((a) => (
                            <div key={a.id_affectation} className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                                <div className="text-sm font-bold text-blue-300">
                                    {a.agent ? `${a.agent.prenom} ${a.agent.nom_naiss}` : '—'}
                                </div>
                                <div className="text-[11px] text-blue-400">
                                    {a.agent?.fonction} · depuis le {formatDate(a.date_affectation)} · {a.agent?.direction?.code_direction}
                                </div>
                            </div>
                        ))}
                        {eq.affectations?.filter((a) => a.date_fin).slice(0, 4).map((a) => (
                            <div key={a.id_affectation} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                                <span className="text-slate-600">{a.agent ? `${a.agent.prenom} ${a.agent.nom_naiss}` : '—'}</span>
                                <span className="text-slate-400">{formatDate(a.date_affectation)} → {formatDate(a.date_fin)}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Maintenance & tickets */}
                <Section icon={Wrench} title="Maintenance & tickets">
                    {(eq.maintenances?.length ?? 0) === 0 && (eq.tickets?.length ?? 0) === 0 && (
                        <p className="text-xs text-slate-500">Aucune intervention enregistrée.</p>
                    )}
                    <div className="space-y-2">
                        {eq.maintenances?.map((m) => (
                            <div key={`m${m.id_maintenance}`} className="flex items-center justify-between gap-2 text-sm py-2 border-b border-slate-100 last:border-0">
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-800 truncate">{m.type?.nom_type ?? 'Maintenance'}</div>
                                    <div className="text-[11px] text-slate-500 truncate">{m.description_probleme}</div>
                                </div>
                                <Badge color={STATUTS_MAINTENANCE[m.statut]?.color}>{STATUTS_MAINTENANCE[m.statut]?.label ?? m.statut}</Badge>
                            </div>
                        ))}
                        {eq.tickets?.map((t) => (
                            <div key={`t${t.id_ticket}`} className="flex items-center justify-between gap-2 text-sm py-2 border-b border-slate-100 last:border-0">
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                                        <LifeBuoy size={13} className="text-slate-500" /> {t.titre}
                                    </div>
                                    <div className="text-[11px] text-slate-500">{t.reference_ticket} · priorité {t.priorite}</div>
                                </div>
                                <Badge color={STATUTS_TICKET[t.statut]?.color}>{STATUTS_TICKET[t.statut]?.label ?? t.statut}</Badge>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Logiciels installés */}
                <Section icon={Disc} title={`Logiciels installés (${eq.installations?.length ?? 0})`}>
                    {(eq.installations?.length ?? 0) === 0 && <p className="text-xs text-slate-500">Aucun logiciel enregistré.</p>}
                    <div className="space-y-1.5">
                        {eq.installations?.map((inst) => (
                            <div key={inst.id_installation} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                                <span className="text-slate-700 font-medium">{inst.logiciel?.nom}</span>
                                <span className="text-[11px] text-slate-500">{inst.version_installee ?? ''}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Mouvements */}
                <Section icon={ArrowLeftRight} title={`Mouvements (${eq.mouvements?.length ?? 0})`}>
                    {(eq.mouvements?.length ?? 0) === 0 && <p className="text-xs text-slate-500">Aucun mouvement.</p>}
                    <div className="space-y-1.5">
                        {eq.mouvements?.map((m) => (
                            <div key={m.id_mouvement} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                                <div>
                                    <span className="font-semibold text-slate-700 capitalize">{m.type_mouvement}</span>
                                    <span className="text-[11px] text-slate-500 block">{m.motif}</span>
                                </div>
                                <span className="text-[11px] text-slate-400 whitespace-nowrap">{formatDate(m.date_mouvement)}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>

            {/* Formations liées */}
            <div className="mt-4">
                <Section icon={GraduationCap} title={`Formations liées (${eq.formations?.length ?? 0})`}>
                    {(eq.formations?.length ?? 0) === 0 ? (
                        <p className="text-xs text-slate-500">Aucune formation liée à cet équipement.</p>
                    ) : (
                        <div className="space-y-2">
                            {eq.formations.map((f) => (
                                <div key={f.id_formation} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-slate-100 last:border-0">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-slate-800 truncate">{f.titre}</div>
                                        <div className="text-[11px] text-slate-500">
                                            {f.theme ? `${f.theme} · ` : ''}{f.formateur ?? '—'} · {formatDate(f.date_debut)}
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-vert-100 text-vert-400 border border-vert-200">
                                        {f.participants_count} participant(s)
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>
            </div>

            {/* Documents */}
            <div className="mt-4">
                <Section icon={FileText} title={`Documents (${eq.documents?.length ?? 0})`}>
                    {(eq.documents?.length ?? 0) === 0 ? (
                        <p className="text-xs text-slate-500">Aucun document attaché — utilisez le bouton ci-dessus pour importer la fiche technique, le reçu ou des photos.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {eq.documents.map((d) => (
                                <button
                                    key={d.id_document ?? d.chemin_fichier}
                                    type="button"
                                    onClick={() => setEnConsultation(d)}
                                    title="Consulter dans l'application"
                                    className="flex items-center gap-2.5 rounded-xl border border-slate-200/50 bg-slate-50 p-2.5 hover:bg-blue-50/40 transition-colors text-left"
                                >
                                    {String(d.mime_type ?? '').startsWith('image/') && d.url
                                        ? <img src={d.url} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                                        : <FileText size={17} className="text-rose-400 shrink-0" />}
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold text-slate-800 truncate">{d.nom_document ?? d.nom}</div>
                                        <div className="text-[10px] text-slate-500">{d.type_document ?? ''} · cliquez pour consulter</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </Section>
            </div>

            {showDocs && (
                <DocumentsModal
                    open
                    onClose={() => setShowDocs(false)}
                    documentableType="equipement"
                    documentableId={eq.id_equipement}
                    titre={`${eq.code_inventaire} — ${eq.designation}`}
                />
            )}

            {enConsultation && (
                <DocumentViewer doc={enConsultation} onClose={() => setEnConsultation(null)} />
            )}
        </div>
    );
}
