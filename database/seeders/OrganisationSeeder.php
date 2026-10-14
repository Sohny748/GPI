<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Direction;
use App\Models\Role;
use App\Models\Service;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrganisationSeeder extends Seeder
{
    public function run(): void
    {
        $dirs = [
            ['DG', 'Direction Générale', 'Pilotage et coordination de la DGSR'],
            ['DT', 'Direction Technique', 'Systèmes d\'information, réception technique et immatriculation'],
            ['DOR', 'Direction des Opérations Routières', 'Centres de réception technique et CENSERO'],
            ['DAF', 'Direction Administrative et Financière', 'Ressources humaines, finances et logistique'],
        ];

        $directions = [];
        foreach ($dirs as [$code, $nom, $desc]) {
            $directions[$code] = Direction::create([
                'code_direction' => $code,
                'nom_direction' => $nom,
                'description' => $desc,
                'telephone' => '+261 20 22 ' . rand(300, 399) . ' ' . rand(10, 99),
                'email' => strtolower($code) . '@dgsr.mg',
                'statut' => 'actif',
            ]);
        }

        $services = [
            ['SIT', 'Service Informatique', 'DG'],
            ['SEC', 'Secrétariat Central', 'DG'],
            ['SPEG', 'Service Planification et Études', 'DT'],
            ['SS', 'Service Sécurité', 'DT'],
            ['CRT-ANA', 'CRT Antananarivo', 'DOR'],
            ['CRT-MAH', 'CRT Mahajanga', 'DOR'],
            ['CEN', 'CENSERO Antananarivo', 'DOR'],
            ['SRH', 'Service Ressources Humaines', 'DAF'],
            ['SFB', 'Service Finances et Budget', 'DAF'],
        ];

        $servicesById = [];
        foreach ($services as [$code, $nom, $dir]) {
            $servicesById[$code] = Service::create([
                'code_service' => $code,
                'nom_service' => $nom,
                'statut' => 'actif',
                'id_direction' => $directions[$dir]->id_direction,
            ]);
        }

        $noms = ['RAKOTO', 'RASOA', 'RANDRIA', 'RAVELO', 'RAKOTOARISOA', 'RAZAFI', 'ANDRIA', 'RAKOTONDRA', 'RANAIVO', 'RASOLO'];
        $prenoms = ['Jean', 'Marie', 'Hery', 'Noro', 'Tojo', 'Lalao', 'Rivo', 'Fanja', 'Mamy', 'Hasina'];
        $fonctions = ['Chef de service', 'Technicien informatique', 'Agent de bureau', 'Contrôleur technique', 'Gestionnaire de parc', 'Assistant administratif', 'Ingénieur systèmes'];

        $agentsData = [
            ['AG-2024-001', 'SIT', 'Chef de service'],
            ['AG-2024-002', 'SIT', 'Gestionnaire de parc'],
            ['AG-2024-003', 'SIT', 'Technicien informatique'],
            ['AG-2024-004', 'SIT', 'Ingénieur systèmes'],
            ['AG-2024-005', 'SEC', 'Agent de bureau'],
            ['AG-2024-006', 'SPEG', 'Chef de service'],
            ['AG-2024-007', 'CRT-ANA', 'Contrôleur technique'],
            ['AG-2024-008', 'CRT-ANA', 'Agent de bureau'],
            ['AG-2024-009', 'CRT-MAH', 'Contrôleur technique'],
            ['AG-2024-010', 'CEN', 'Agent de bureau'],
            ['AG-2024-011', 'SRH', 'Chef de service'],
            ['AG-2024-012', 'SFB', 'Gestionnaire de parc'],
            ['AG-2024-013', 'SS', 'Technicien informatique'],
            ['AG-2024-014', 'SEC', 'Assistant administratif'],
            ['AG-2024-015', 'CEN', 'Contrôleur technique'],
        ];

        foreach ($agentsData as $i => [$matricule, $service, $fonction]) {
            $nom = $noms[$i % count($noms)];
            $prenom = $prenoms[$i % count($prenoms)];
            $agent = Agent::create([
                'matricule' => $matricule,
                'nom_naiss' => $nom,
                'prenom' => $prenom,
                'sexe' => $i % 3 === 1 ? 'F' : 'M',
                'fonction' => $fonction,
                'telephone' => '+261 34 ' . rand(10, 99) . ' ' . rand(100, 999) . ' ' . rand(10, 99),
                'email' => strtolower($prenom . '.' . $nom) . '@dgsr.mg',
                'date_embauche' => now()->subYears(rand(2, 20))->subDays(rand(0, 300)),
                'statut' => $i === 7 ? 'conge' : 'actif',
                'id_direction' => $servicesById[$service]->id_direction,
                'id_service' => $servicesById[$service]->id_service,
            ]);
        }

        $roles = [
            ['admin', 'Accès complet au système'],
            ['gestionnaire_parc', 'Gestion du parc informatique'],
            ['technicien', 'Interventions de maintenance et tickets'],
            ['utilisateur', 'Consultation et demandes'],
        ];
        foreach ($roles as [$nom, $desc]) {
            Role::create(['nom_role' => $nom, 'description' => $desc]);
        }

        $usersData = [
            ['admin', 'admin@dgsr.mg', ['admin'], 1],
            ['r.rakoto', 'jean.rakoto@dgsr.mg', ['gestionnaire_parc'], 2],
            ['t.raso', 'marie.rasoa@dgsr.mg', ['technicien'], 3],
            ['h.ran', 'hery.randria@dgsr.mg', ['technicien'], 4],
            ['n.rav', 'noro.ravelo@dgsr.mg', ['utilisateur'], 7],
        ];

        foreach ($usersData as [$username, $email, $rolesForUser, $agentIdx]) {
            $user = Utilisateur::create([
                'username' => $username,
                'email' => $email,
                'password' => Hash::make('password'),
                'actif' => true,
                'dernier_connexion' => now()->subDays(rand(0, 5)),
                'id_agent' => $agentsData[$agentIdx - 1][1] !== null ? Agent::where('matricule', $agentsData[$agentIdx - 1][0])->value('id_agent') : null,
            ]);
            $user->roles()->sync(Role::whereIn('nom_role', $rolesForUser)->pluck('id_role'));
        }
    }
}
