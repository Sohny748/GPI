import ResourcePage from '../components/ResourcePage';
import { badgeActif } from '../lib/constants';
import { ficheSite } from '../lib/ficheElement';

const badgeStatut = (v) => (v === 'actif'
    ? badgeActif('actif')
    : badgeActif('inactif'));

export default function Sites() {
    return (
        <ResourcePage
            titre="Sites"
            endpoint="/referentiel/sites"
            idKey="id_site"
            labelElement="Site"
            ficheComplete={(s) => ficheSite(s)}
            filtreStatut={[['actif', 'Actif'], ['inactif', 'Inactif']]}
            colonnes={[
                { key: 'code_site', label: 'Code', width: 'w-24', mono: true },
                { key: 'nom_site', label: 'Site' },
                { key: 'ville', label: 'Ville' },
                { key: 'statut', label: 'Statut', badge: badgeStatut },
            ]}
            champs={[
                { key: 'code_site', label: 'Code' },
                { key: 'nom_site', label: 'Nom du site', required: true },
                { key: 'ville', label: 'Ville', required: true },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'statut', label: 'Statut', type: 'select', options: [['actif', 'Actif'], ['inactif', 'Inactif']] },
            ]}
        />
    );
}
