import { useEffect, useState } from 'react';
import { Boxes, CheckCircle2, AlertTriangle, FileDown } from 'lucide-react';
import { api } from '../api';
import { SkeletonPage, PageHeader, Badge } from '../components/ui';
import { formatDate } from '../lib/constants';
import BoutonRapport from '../components/BoutonRapport';
import { ficheInventaire } from '../lib/ficheElement';

export default function Inventaires() {
    const [rows, setRows] = useState(null);

    useEffect(() => {
        api.get('/inventaire-details').then(({ data }) => setRows(data));
    }, []);

    if (! rows) return <SkeletonPage lignes={6} />;

    const grouped = rows.reduce((acc, d) => {
        (acc[d.inventaire?.reference ?? '—'] ??= { inventaire: d.inventaire, details: [] }).details.push(d);
        return acc;
    }, {});

    return (
        <div className="anim-fade-up">
            <PageHeader
                title="Inventaires"
                subtitle="Campagnes de vérification du parc"
                actions={
                    rows?.length ? (
                        <BoutonRapport
                            titre="Inventaires"
                            sousTitre="État des campagnes de vérification"
                            colonnes={[
                                ['Référence', (d) => d.inventaire?.reference ?? '—'],
                                ['Équipement', (d) => d.equipement?.code_inventaire ?? ''],
                                ['Désignation', (d) => d.equipement?.designation ?? ''],
                                ['Statut', (d) => (d.statut === 'ecart' ? 'Écart' : d.statut === 'verifie' ? 'Vérifié' : 'À vérifier')],
                                ['Observation', 'observation'],
                            ]}
                            lignes={rows}
                        />
                    ) : null
                }
            />

            {Object.entries(grouped).map(([ref, { inventaire, details }]) => {
                const ecarts = details.filter((d) => d.statut === 'ecart').length;
                const verifies = details.filter((d) => d.statut === 'verifie').length;
                return (
                    <div key={ref} className="anim-fade-up lift bg-card rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Boxes size={16} className="text-blue-400" />
                                <span className="font-bold text-slate-800 text-sm">{ref}</span>
                                <Badge color={
                                    inventaire?.statut === 'en_cours' ? 'bg-sky-100 text-sky-400 border-sky-200'
                                    : 'bg-jaune-100 text-jaune-400 border-jaune-200'
                                }>
                                    {inventaire?.statut?.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-[11px] text-slate-500">
                                    {formatDate(inventaire?.date_debut)} · {verifies} vérifié(s) ·{' '}
                                    <span className={ecarts ? 'text-slate-600 font-bold' : ''}>{ecarts} écart(s)</span>
                                </div>
                                <button
                                    onClick={() => ficheInventaire({ ...inventaire, reference: inventaire?.reference ?? ref, details })}
                                    title="Fiche PDF de cette campagne d'inventaire"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200/50 bg-sky-50 hover:bg-sky-100 text-sky-600 hover:text-sky-700 text-xs font-semibold transition-colors"
                                >
                                    <FileDown size={13} /> Fiche
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {details.map((d) => (
                                <div key={d.id_detail} className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
                                    <div className="min-w-0">
                                        <span className="font-mono text-xs font-bold text-blue-300">{d.equipement?.code_inventaire}</span>
                                        <span className="text-slate-600"> · {d.equipement?.designation}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[11px] text-slate-400 hidden sm:inline">{d.observation}</span>
                                        {d.statut === 'ecart'
                                            ? <Badge color="bg-slate-100 text-slate-800 border-slate-200"><AlertTriangle size={11} className="mr-1" />Écart</Badge>
                                            : <Badge color="bg-vert-100 text-vert-400 border-vert-200"><CheckCircle2 size={11} className="mr-1" />{d.statut === 'verifie' ? 'Vérifié' : 'À vérifier'}</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
