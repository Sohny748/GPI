<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Affectation;
use App\Models\Equipement;
use App\Models\Inventaire;
use App\Models\InventaireDetail;
use App\Models\Logiciel;
use App\Models\Licence;
use App\Models\InstallationLogiciel;
use App\Models\Localisation;
use App\Models\Mouvement;
use App\Models\MouvementHistorique;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class OperationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Utilisateur::whereHas('roles', fn ($q) => $q->where('nom_role', 'admin'))->first();
        $agents = Agent::all();
        $equipements = Equipement::where('statut', 'en_service')->get();
        $locs = Localisation::all();

        // Affectations actives
        foreach ($equipements->take(12) as $i => $eq) {
            Affectation::create([
                'date_affectation' => now()->subDays(rand(30, 300)),
                'date_fin' => null,
                'motif' => 'Besoin de service',
                'commentaire' => 'Affectation en cours',
                'id_equipement' => $eq->id_equipement,
                'id_agent' => $agents[$i % $agents->count()]->id_agent,
            ]);
        }

        // Mouvements + historique
        foreach ($equipements->take(6) as $i => $eq) {
            $ancienne = $locs[$i % $locs->count()];
            $nouvelle = $locs[($i + 3) % $locs->count()];
            $mouvement = Mouvement::create([
                'type_mouvement' => 'transfert',
                'motif' => 'Réorganisation des services',
                'ancienne_localisation' => $ancienne->id_localisation,
                'nouvelle_localisation' => $nouvelle->id_localisation,
                'date_mouvement' => now()->subDays(rand(5, 60)),
                'commentaire' => 'Transfert inter-service',
                'id_equipement' => $eq->id_equipement,
                'id_utilisateur' => $admin?->id_utilisateur,
            ]);

            $eq->update(['id_localisation' => $nouvelle->id_localisation]);

            MouvementHistorique::create([
                'table_concernee' => 'equipements',
                'id_enregistrement' => $eq->id_equipement,
                'champ' => 'id_localisation',
                'ancienne_valeur' => $ancienne->code_localisation,
                'nouvelle_valeur' => $nouvelle->code_localisation,
                'commentaire' => 'Historique du transfert',
                'id_mouvement' => $mouvement->id_mouvement,
                'id_utilisateur' => $admin?->id_utilisateur,
            ]);
        }

        // Inventaire
        $inventaire = Inventaire::create([
            'reference' => 'INV-2026-ANNUEL',
            'date_debut' => now()->subDays(15),
            'date_fin' => null,
            'description' => 'Inventaire annuel du parc informatique',
            'statut' => 'en_cours',
            'id_utilisateur' => $admin?->id_utilisateur,
        ]);

        foreach ($equipements->take(15) as $i => $eq) {
            InventaireDetail::create([
                'presence' => $i !== 9,
                'date_constat' => now()->subDays(rand(1, 10)),
                'observation' => $i === 9 ? 'Équipement introuvable au poste déclaré' : 'Équipement présent et fonctionnel',
                'date_verification' => now()->subDays(rand(0, 5)),
                'statut' => $i === 9 ? 'ecart' : 'verifie',
                'id_inventaire' => $inventaire->id_inventaire,
                'id_equipement' => $eq->id_equipement,
            ]);
        }

        // Logiciels
        $logiciels = [
            ['Windows 11 Pro', '23H2', 'Microsoft'],
            ['Microsoft Office 365', 'LTSC', 'Microsoft'],
            ['Antivirus ESET', 'v12', 'ESET'],
            ['Adobe Acrobat Reader', '2024', 'Adobe'],
            ['Outil Immatriculation DGSR', 'v3.2', 'SIT DGSR'],
        ];

        $logicielsIds = [];
        foreach ($logiciels as [$nom, $version, $editeur]) {
            $logicielsIds[$nom] = Logiciel::create([
                'nom' => $nom,
                'version' => $version,
                'editeur' => $editeur,
                'description' => 'Logiciel standard du socle DGSR',
            ])->id_logiciel;
        }

        $licences = [
            ['LIC-W11-001', 'OEM', 20, 'Windows 11 Pro'],
            ['LIC-O365-001', 'Abonnement annuel', 50, 'Microsoft Office 365'],
            ['LIC-ESET-001', 'Abonnement annuel', 35, 'Antivirus ESET'],
        ];
        foreach ($licences as [$ref, $type, $nb, $logiciel]) {
            Licence::create([
                'reference_licence' => $ref,
                'type_licence' => $type,
                'nb_licences' => $nb,
                'date_acquisition' => now()->subMonths(rand(3, 18)),
                'date_expiration' => now()->addMonths(rand(1, 12)),
                'numero_serie' => 'XXXX-' . strtoupper(str()->random(4)) . '-' . strtoupper(str()->random(4)),
                'statut' => 'active',
                'id_logiciel' => $logicielsIds[$logiciel],
            ]);
        }

        foreach ($equipements->take(10) as $i => $eq) {
            InstallationLogiciel::create([
                'date_installation' => now()->subDays(rand(10, 200)),
                'version_installee' => $logiciels[$i % count($logiciels)][1],
                'licence' => 'LIC-W11-001',
                'statut' => 'installe',
                'id_logiciel' => $logicielsIds[$logiciels[$i % count($logiciels)][0]],
                'id_equipement' => $eq->id_equipement,
            ]);
        }
    }
}
