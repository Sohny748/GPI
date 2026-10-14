import ResourcePage from '../components/ResourcePage';
import { badgeActif } from '../lib/constants';
import { ficheDirection } from '../lib/ficheElement';

const badgeStatut = (v) => (v === 'actif'
    ? badgeActif('actif')
    : badgeActif('inactif'));

export default function Directions() {
    return (
        <ResourcePage
            titre="Directions"
            endpoint="/referentiel/directions"
            idKey="id_direction"
            labelElement="Direction"
            ficheComplete={(d) => ficheDirection(d)}
            filtreStatut={[['actif', 'Actif'], ['inactif', 'Inactif']]}
            colonnes={[
                { key: 'code_direction', label: 'Code', width: 'w-24', mono: true },
                { key: 'nom_direction', label: 'Nom' },
                { key: 'email', label: 'Email' },
                { key: 'telephone', label: 'Téléphone' },
                { key: 'statut', label: 'Statut', badge: badgeStatut },
            ]}
            champs={[
                { key: 'code_direction', label: 'Code' },
                { key: 'nom_direction', label: 'Nom de la direction', required: true },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'telephone', label: 'Téléphone' },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'statut', label: 'Statut', type: 'select', options: [['actif', 'Actif'], ['inactif', 'Inactif']] },
            ]}
        />
    );
}
