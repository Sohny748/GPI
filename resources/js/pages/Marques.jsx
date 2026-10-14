import ResourcePage from '../components/ResourcePage';
import { ficheMarque } from '../lib/ficheElement';

export default function Marques() {
    return (
        <ResourcePage
            titre="Marques"
            endpoint="/referentiel/marques"
            idKey="id_marque"
            labelElement="Marque"
            ficheComplete={(m) => ficheMarque(m)}
            colonnes={[
                { key: 'nom_marque', label: 'Nom' },
                { key: 'description', label: 'Description' },
            ]}
            champs={[
                { key: 'nom_marque', label: 'Nom de la marque', required: true },
                { key: 'description', label: 'Description', type: 'textarea' },
            ]}
        />
    );
}
