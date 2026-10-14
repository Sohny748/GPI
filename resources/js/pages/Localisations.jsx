import ResourcePage from '../components/ResourcePage';
import { badgeActif } from '../lib/constants';
import { ficheLocalisation } from '../lib/ficheElement';

const badgeStatut = (v) => (v === 'actif'
    ? badgeActif('actif')
    : badgeActif('inactif'));

export default function Localisations() {
    return (
        <ResourcePage
            titre="Localisations"
            endpoint="/referentiel/localisations"
            idKey="id_localisation"
            labelElement="Localisation"
            ficheComplete={(l) => ficheLocalisation(l)}
            filtreStatut={[['actif', 'Actif'], ['inactif', 'Inactif']]}
            colonnes={[
                { key: 'code_localisation', label: 'Code', width: 'w-28', mono: true },
                { key: 'nom_localisation', label: 'Localisation' },
                { key: 'etage', label: 'Étage', width: 'w-20' },
                { key: 'bureau', label: 'Bureau', width: 'w-24' },
                { key: 'batiment', label: 'Bâtiment', render: (l) => l.batiment ? `${l.batiment.nom_batiment} · ${l.batiment.site?.nom_site ?? ''}` : '—' },
                { key: 'statut', label: 'Statut', badge: badgeStatut },
            ]}
            champs={[
                { key: 'code_localisation', label: 'Code' },
                { key: 'nom_localisation', label: 'Nom de la localisation', required: true },
                { key: 'etage', label: 'Étage' },
                { key: 'bureau', label: 'Bureau' },
                { key: 'id_batiment', label: 'Bâtiment', type: 'ref', source: 'batiments', idSource: 'id_batiment', get: (b) => b.nom_batiment, required: true },
                { key: 'statut', label: 'Statut', type: 'select', options: [['actif', 'Actif'], ['inactif', 'Inactif']] },
            ]}
        />
    );
}
