import ResourcePage from '../components/ResourcePage';
import { badgeActif } from '../lib/constants';
import { ficheBatiment } from '../lib/ficheElement';

const badgeStatut = (v) => (v === 'actif'
    ? badgeActif('actif')
    : badgeActif('inactif'));

export default function Batiments() {
    return (
        <ResourcePage
            titre="Bâtiments"
            endpoint="/referentiel/batiments"
            idKey="id_batiment"
            labelElement="Bâtiment"
            ficheComplete={(b) => ficheBatiment(b)}
            filtreStatut={[['actif', 'Actif'], ['inactif', 'Inactif']]}
            colonnes={[
                { key: 'code_batiment', label: 'Code', width: 'w-24', mono: true },
                { key: 'nom_batiment', label: 'Bâtiment' },
                { key: 'site', label: 'Site', render: (b) => b.site?.nom_site ?? '—' },
                { key: 'statut', label: 'Statut', badge: badgeStatut },
            ]}
            champs={[
                { key: 'code_batiment', label: 'Code' },
                { key: 'nom_batiment', label: 'Nom du bâtiment', required: true },
                { key: 'id_site', label: 'Site', type: 'ref', source: 'sites', idSource: 'id_site', get: (s) => s.nom_site, required: true },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'statut', label: 'Statut', type: 'select', options: [['actif', 'Actif'], ['inactif', 'Inactif']] },
            ]}
        />
    );
}
