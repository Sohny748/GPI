import ResourcePage from '../components/ResourcePage';
import { ficheModele } from '../lib/ficheElement';

export default function Modeles() {
    return (
        <ResourcePage
            titre="Modèles"
            endpoint="/referentiel/modeles"
            idKey="id_modele"
            labelElement="Modèle"
            ficheComplete={(m) => ficheModele(m)}
            colonnes={[
                { key: 'nom_modele', label: 'Modèle' },
                { key: 'reference_modele', label: 'Référence', mono: true },
                { key: 'marque', label: 'Marque', render: (m) => m.marque?.nom_marque ?? '—' },
                { key: 'categorie', label: 'Catégorie', render: (m) => m.categorie?.nom_categorie ?? '—' },
            ]}
            champs={[
                { key: 'nom_modele', label: 'Nom du modèle', required: true },
                { key: 'reference_modele', label: 'Référence' },
                { key: 'id_marque', label: 'Marque', type: 'ref', source: 'marques', idSource: 'id_marque', get: (m) => m.nom_marque },
                { key: 'id_categorie', label: 'Catégorie', type: 'ref', source: 'categories', idSource: 'id_categorie', get: (c) => c.nom_categorie },
                { key: 'description', label: 'Description', type: 'textarea' },
            ]}
        />
    );
}
