import ResourcePage from '../components/ResourcePage';
import { ficheMaintenance } from '../lib/ficheElement';

const BADGES = {
    demandee: 'bg-slate-100 text-slate-600 border-slate-200',
    planifiee: 'bg-slate-100 text-sky-400 border-slate-200',
    en_cours: 'bg-sky-100 text-sky-400 border-sky-200',
    terminee: 'bg-blue-600 text-white border-blue-600',
    annulee: 'bg-slate-200 text-slate-700 border-slate-300',
};
const LABELS = { demandee: 'Demandée', planifiee: 'Planifiée', en_cours: 'En cours', terminee: 'Terminée', annulee: 'Annulée' };

export default function Maintenances() {
    return (
        <ResourcePage
            titre="Maintenances"
            endpoint="/maintenances"
            idKey="id_maintenance"
            labelElement="Maintenance"
            documents={{ type: 'maintenance' }}
            ficheComplete={(m) => ficheMaintenance(m)}
            filtreStatut={Object.entries(LABELS).map(([v, l]) => [v, l])}
            colonnes={[
                { key: 'equipement', label: 'Équipement', render: (m) => m.equipement ? `${m.equipement.code_inventaire} — ${m.equipement.designation}` : '—' },
                { key: 'type', label: 'Type', render: (m) => m.type?.nom_type ?? '—' },
                { key: 'date_demande', label: 'Demandée le', date: true },
                { key: 'date_debut', label: 'Début', date: true },
                { key: 'date_fin', label: 'Fin', date: true },
                { key: 'technicien', label: 'Technicien' },
                { key: 'statut', label: 'Statut', badge: (v) => BADGES[v] ?? 'bg-slate-100 text-slate-700 border-slate-200', badgeLabel: (v) => LABELS[v] ?? v },
            ]}
            champs={[
                { key: 'id_equipement', label: 'Équipement', type: 'ref', source: 'equipementsMini', idSource: 'id_equipement', get: (e) => `${e.code_inventaire} — ${e.designation}`, required: true },
                { key: 'id_type_maintenance', label: 'Type de maintenance', type: 'ref', source: 'typeMaintenances', idSource: 'id_type_maintenance', get: (t) => t.nom_type, required: true },
                { key: 'statut', label: 'Statut', type: 'select', options: Object.entries(LABELS) },
                { key: 'technicien', label: 'Technicien' },
                { key: 'date_demande', label: 'Date de demande', type: 'date' },
                { key: 'date_debut', label: 'Date de début', type: 'date' },
                { key: 'date_fin', label: 'Date de fin', type: 'date' },
                { key: 'description_probleme', label: 'Problème décrit', type: 'textarea' },
                { key: 'diagnostic', label: 'Diagnostic', type: 'textarea' },
            ]}
        />
    );
}
