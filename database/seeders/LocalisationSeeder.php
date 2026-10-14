<?php

namespace Database\Seeders;

use App\Models\Batiment;
use App\Models\Localisation;
use App\Models\Site;
use App\Models\Direction;
use Illuminate\Database\Seeder;

class LocalisationSeeder extends Seeder
{
    public function run(): void
    {
        $dgId = Direction::where('code_direction', 'DG')->value('id_direction');
        $dtId = Direction::where('code_direction', 'DT')->value('id_direction');
        $dorId = Direction::where('code_direction', 'DOR')->value('id_direction');

        $sites = [
            ['SIEGE', 'Siège DGSR', 'Antananarivo', $dgId],
            ['CRT-ANA-S', 'CRT Antananarivo', 'Antananarivo', $dorId],
            ['CRT-MAH-S', 'CRT Mahajanga', 'Mahajanga', $dorId],
        ];

        $sitesById = [];
        foreach ($sites as [$code, $nom, $ville, $dir]) {
            $sitesById[$code] = Site::create([
                'code_site' => $code,
                'nom_site' => $nom,
                'ville' => $ville,
                'statut' => 'actif',
                'id_direction' => $dir,
            ]);
        }

        $batiments = [
            ['BAT-A', 'Bâtiment A - Administration', 'SIEGE'],
            ['BAT-B', 'Bâtiment B - Technique', 'SIEGE'],
            ['BAT-CRT1', 'Hall de réception 1', 'CRT-ANA-S'],
            ['BAT-CRT2', 'Bâtiment bureaux CRT', 'CRT-ANA-S'],
            ['BAT-MAH1', 'Bâtiment principal', 'CRT-MAH-S'],
        ];

        $batimentsById = [];
        foreach ($batiments as [$code, $nom, $site]) {
            $batimentsById[$code] = Batiment::create([
                'code_batiment' => $code,
                'nom_batiment' => $nom,
                'statut' => 'actif',
                'id_site' => $sitesById[$site]->id_site,
            ]);
        }

        $localisations = [
            ['LOC-RDC-01', 'RDC - Bureau direction générale', 'RDC', 'B01', 'BAT-A'],
            ['LOC-RDC-02', 'RDC - Service informatique', 'RDC', 'B04', 'BAT-A'],
            ['LOC-ET1-01', '1er étage - Service RH', '1er étage', 'B11', 'BAT-A'],
            ['LOC-ET1-02', '1er étage - Service finances', '1er étage', 'B12', 'BAT-A'],
            ['LOC-ET2-01', '2e étage - Salle serveurs', '2e étage', 'B21', 'BAT-B'],
            ['LOC-ET2-02', '2e étage - Atelier technique', '2e étage', 'B23', 'BAT-B'],
            ['LOC-CRT-01', 'CRT - Hall réception poste 1', 'RDC', 'P01', 'BAT-CRT1'],
            ['LOC-CRT-02', 'CRT - Hall réception poste 2', 'RDC', 'P02', 'BAT-CRT1'],
            ['LOC-CRT-03', 'CRT - Bureau chef de centre', '1er étage', 'B01', 'BAT-CRT2'],
            ['LOC-MAH-01', 'Mahajanga - Salle informatique', 'RDC', 'B01', 'BAT-MAH1'],
        ];

        foreach ($localisations as [$code, $nom, $etage, $bureau, $bat]) {
            Localisation::create([
                'code_localisation' => $code,
                'nom_localisation' => $nom,
                'etage' => $etage,
                'bureau' => $bureau,
                'statut' => 'actif',
                'id_batiment' => $batimentsById[$bat]->id_batiment,
            ]);
        }
    }
}
