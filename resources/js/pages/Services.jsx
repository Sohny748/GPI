import ResourcePage from '../components/ResourcePage';
import { badgeActif } from '../lib/constants';
import { ficheService } from '../lib/ficheElement';

const badgeStatut = (v) => (v === 'actif'
    ? badgeActif('actif')
    : badgeActif('inactif'));

export default function Services() {
    return (
        <ResourcePage
            titre="Services"
            endpoint="/referentiel/services"
            idKey="id_service"
            labelElement="Service"
            ficheComplete={(s) => ficheService(s)}
            filtreStatut={[['actif', 'Actif'], ['inactif', 'Inactif']]}
            colonnes={[
                { key: 'code_service', label: 'Code', width: 'w-24', mono: true },
                { key: 'nom_service', label: 'Nom' },
                { key: 'direction', label: 'Direction', render: (s) => s.direction?.code_direction ?? '—' },
                { key: 'statut', label: 'Statut', badge: badgeStatut },
            ]}
            champs={[
                { key: 'code_service', label: 'Code' },
                { key: 'nom_service', label: 'Nom du service', required: true },
                { key: 'id_direction', label: 'Direction', type: 'ref', source: 'directions', idSource: 'id_direction', get: (d) => d.nom_direction, required: true },
                { key: 'statut', label: 'Statut', type: 'select', options: [['actif', 'Actif'], ['inactif', 'Inactif']] },
            ]}
        />
    );
}
