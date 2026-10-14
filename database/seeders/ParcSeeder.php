<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Equipement;
use App\Models\EtatEquipement;
use App\Models\Localisation;
use App\Models\Marque;
use App\Models\Modele;
use App\Models\Direction;
use App\Models\Service;
use App\Models\Fournisseur;
use Illuminate\Database\Seeder;

class ParcSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['ORDI', 'Ordinateur', 'Ordinateurs de bureau et portables'],
            ['IMPR', 'Imprimante', 'Imprimantes et multifonctions'],
            ['RESE', 'Équipement réseau', 'Switchs, routeurs, points d\'accès'],
            ['SERV', 'Serveur', 'Serveurs physiques'],
            ['SCAN', 'Scanner', 'Scanners et périphériques d\'acquisition'],
            ['TEL', 'Téléphonie', 'Téléphones fixes et IP'],
        ];

        $catsById = [];
        foreach ($categories as [$code, $nom, $desc]) {
            $catsById[$code] = Categorie::create([
                'code_categorie' => $code,
                'nom_categorie' => $nom,
                'description' => $desc,
                'statut' => 'actif',
            ]);
        }

        $marques = ['HP', 'Dell', 'Lenovo', 'Canon', 'Cisco', 'TP-Link', 'Epson', 'Hikvision'];
        $marquesById = [];
        foreach ($marques as $m) {
            $marquesById[$m] = Marque::create([
                'nom_marque' => $m,
                'description' => 'Constructeur ' . $m,
            ]);
        }

        $modeles = [
            ['HP-450G9', 'HP EliteBook 450 G9', 'ORDI', 'HP'],
            ['HP-PROD4', 'HP ProDesk 400 G7', 'ORDI', 'HP'],
            ['DEL-LAT3520', 'Dell Latitude 3520', 'ORDI', 'Dell'],
            ['DEL-OPT7010', 'Dell OptiPlex 7010', 'ORDI', 'Dell'],
            ['LEN-THINKE14', 'Lenovo ThinkPad E14', 'ORDI', 'Lenovo'],
            ['LEN-M720', 'Lenovo ThinkCentre M720q', 'ORDI', 'Lenovo'],
            ['HP-LJPRO', 'HP LaserJet Pro M404dn', 'IMPR', 'HP'],
            ['CAN-IR2625', 'Canon imageRUNNER 2625', 'IMPR', 'Canon'],
            ['EPS-WF3820', 'Epson WorkForce WF-3820', 'IMPR', 'Epson'],
            ['CISCO-2960', 'Cisco Catalyst 2960-X', 'RESE', 'Cisco'],
            ['TPL-EAP225', 'TP-Link EAP225', 'RESE', 'TP-Link'],
            ['HP-PROL30', 'HP ProLiant DL380 Gen10', 'SERV', 'HP'],
            ['CAN-DR2580', 'Canon DR-C2580U', 'SCAN', 'Canon'],
            ['HIK-DS2CD', 'Hikvision DS-2CD2143', 'TEL', 'Hikvision'],
        ];

        $modelesById = [];
        foreach ($modeles as [$ref, $nom, $cat, $marque]) {
            $modelesById[$ref] = Modele::create([
                'reference_modele' => $ref,
                'nom_modele' => $nom,
                'id_categorie' => $catsById[$cat]->id_categorie,
                'id_marque' => $marquesById[$marque]->id_marque,
            ]);
        }

        $etats = [
            ['Neuf', 'Équipement neuf, jamais utilisé'],
            ['Bon état', 'Équipement en bon état de fonctionnement'],
            ['Passable', 'Équipement fonctionnel avec traces d\'usure'],
            ['Dégradé', 'Équipement nécessitant une intervention'],
            ['Hors service', 'Équipement inutilisable'],
        ];
        $etatsById = [];
        foreach ($etats as [$nom, $desc]) {
            $etatsById[$nom] = EtatEquipement::create(['nom_etat' => $nom, 'description' => $desc]);
        }

        $locs = Localisation::all();
        $dgId = Direction::where('code_direction', 'DG')->value('id_direction');
        $dtId = Direction::where('code_direction', 'DT')->value('id_direction');
        $dorId = Direction::where('code_direction', 'DOR')->value('id_direction');
        $fournisseurs = Fournisseur::all();

        $statuts = ['en_service', 'en_service', 'en_service', 'en_stock', 'en_maintenance', 'en_service', 'reforme', 'en_service', 'reserve', 'en_stock'];
        $etatNoms = ['Neuf', 'Bon état', 'Bon état', 'Passable', 'Passable', 'Dégradé', 'Hors service'];

        for ($i = 1; $i <= 34; $i++) {
            $modele = $modelesById[array_rand($modelesById)];
            $statut = $statuts[$i % count($statuts)];
            $loc = $locs[$i % $locs->count()];

            $directionId = $i % 3 === 0 ? $dtId : ($i % 3 === 1 ? $dgId : $dorId);

            Equipement::create([
                'code_inventaire' => sprintf('GPI-%05d', $i),
                'numero_serie' => 'SN' . str_pad((string) (random_int(100000, 999999)), 9, '0', STR_PAD_LEFT) . chr(65 + $i % 26),
                'designation' => $modele->nom_modele,
                'description' => 'Équipement de parc informatique DGSR',
                'date_acquisition' => now()->subMonths(rand(6, 48))->subDays(rand(0, 30)),
                'date_mise_service' => now()->subMonths(rand(1, 44))->subDays(rand(0, 30)),
                'prix_acquisition' => rand(400, 4500) * 1000,
                'garantie_debut' => now()->subMonths(rand(6, 48)),
                'garantie_fin' => rand(0, 1) ? now()->addMonths(rand(1, 24)) : now()->subMonths(rand(1, 12)),
                'statut' => $statut,
                'id_modele' => $modele->id_modele,
                'id_categorie' => $modele->id_categorie,
                'id_marque' => $modele->id_marque,
                'id_direction' => $directionId,
                'id_fournisseur' => $fournisseurs->isNotEmpty() ? $fournisseurs[$i % $fournisseurs->count()]->id_fournisseur : null,
                'id_localisation' => $statut === 'en_stock' ? null : $loc->id_localisation,
                'id_etat' => $etatsById[$etatNoms[$i % count($etatNoms)]]->id_etat,
            ]);
        }
    }
}
