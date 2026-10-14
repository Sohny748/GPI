import ResourcePage from '../components/ResourcePage';
import { badgeActif } from '../lib/constants';
import { ficheFournisseur } from '../lib/ficheElement';

const badgeStatut = (v) => (v === 'actif'
    ? badgeActif('actif')
    : badgeActif('inactif'));

export default function Fournisseurs() {
    return (
        <ResourcePage
            titre="Fournisseurs"
            endpoint="/referentiel/fournisseurs"
            idKey="id_fournisseur"
            labelElement="Fournisseur"
            documents={{ type: 'fournisseur' }}
            ficheComplete={(f) => ficheFournisseur(f)}
            filtreStatut={[['actif', 'Actif'], ['inactif', 'Inactif']]}
            colonnes={[
                { key: 'raison_sociale', label: 'Raison sociale' },
                { key: 'contact', label: 'Contact' },
                { key: 'telephone', label: 'Téléphone' },
                { key: 'email', label: 'Email' },
                { key: 'rcs', label: 'RCS', mono: true },
                { key: 'statut', label: 'Statut', badge: badgeStatut },
            ]}
            champs={[
                { key: 'raison_sociale', label: 'Raison sociale', required: true },
                { key: 'contact', label: 'Personne de contact' },
                { key: 'telephone', label: 'Téléphone' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'adresse', label: 'Adresse' },
                { key: 'rcs', label: 'RCS' },
                { key: 'statut', label: 'Statut', type: 'select', options: [['actif', 'Actif'], ['inactif', 'Inactif']] },
            ]}
        />
    );
}
