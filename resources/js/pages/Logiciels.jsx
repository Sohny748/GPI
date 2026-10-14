import ResourcePage from '../components/ResourcePage';
import { ficheLogiciel } from '../lib/ficheElement';

export default function Logiciels() {
    return (
        <ResourcePage
            titre="Logiciels"
            endpoint="/logiciels"
            idKey="id_logiciel"
            labelElement="Logiciel"
            documents={{ type: 'logiciel' }}
            ficheComplete={(l) => ficheLogiciel(l)}
            colonnes={[
                { key: 'nom', label: 'Nom' },
                { key: 'version', label: 'Version', mono: true },
                { key: 'editeur', label: 'Éditeur' },
                { key: 'licences', label: 'Licences', render: (l) => (l.licences?.length ? `${l.licences.length} licence(s)` : '—') },
                { key: 'installations', label: 'Installations', render: (l) => {
                    const actives = (l.installations ?? []).filter((i) => i.statut === 'installe').length;
                    return actives ? `${actives} poste(s)` : '—';
                } },
            ]}
            champs={[
                { key: 'nom', label: 'Nom du logiciel', required: true },
                { key: 'version', label: 'Version' },
                { key: 'editeur', label: 'Éditeur' },
                { key: 'description', label: 'Description', type: 'textarea' },
            ]}
        />
    );
}
