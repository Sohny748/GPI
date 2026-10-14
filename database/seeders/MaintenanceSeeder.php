<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Equipement;
use App\Models\Maintenance;
use App\Models\Ticket;
use App\Models\TicketCommentaire;
use App\Models\TypeMaintenance;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['Préventive', 'Maintenance planifiée régulière'],
            ['Curative', 'Intervention suite à une panne'],
            ['Mise à jour', 'Mises à jour logicielles et firmware'],
            ['Nettoyage', 'Nettoyage physique des équipements'],
        ];
        foreach ($types as [$nom, $desc]) {
            TypeMaintenance::create(['nom_type' => $nom, 'description' => $desc]);
        }

        $typeIds = TypeMaintenance::pluck('id_type_maintenance');
        $agents = Agent::all();
        $equipements = Equipement::inRandomOrder()->take(8)->get();
        $techs = Utilisateur::whereHas('roles', fn ($q) => $q->where('nom_role', 'technicien'))->get();
        $statuts = ['demandee', 'planifiee', 'en_cours', 'terminee', 'terminee'];

        foreach ($equipements as $i => $eq) {
            $statut = $statuts[$i % count($statuts)];
            Maintenance::create([
                'date_demande' => now()->subDays(rand(10, 40)),
                'date_debut' => in_array($statut, ['en_cours', 'terminee']) ? now()->subDays(rand(3, 9)) : null,
                'date_fin' => $statut === 'terminee' ? now()->subDays(rand(0, 2)) : null,
                'description_probleme' => ['Panne d\'alimentation', 'Lenteur excessive', 'Écran HS', 'Périphérique non détecté', 'Surchauffe'][$i % 5],
                'diagnostic' => $statut === 'terminee' ? 'Composant remplacé, tests OK' : null,
                'technicien' => $techs->isNotEmpty() ? $techs[$i % $techs->count()]->nom_complet : 'SIT',
                'statut' => $statut,
                'id_equipement' => $eq->id_equipement,
                'id_type_maintenance' => $typeIds[$i % $typeIds->count()],
                'id_agent' => $agents->isNotEmpty() ? $agents[$i % $agents->count()]->id_agent : null,
            ]);
        }

        $refs = ['TCK-2026-001', 'TCK-2026-002', 'TCK-2026-003', 'TCK-2026-004', 'TCK-2026-005'];
        $titres = [
            'Ordinateur ne démarre plus',
            'Imprimante en panne de papier',
            'Connexion réseau instable au CRT',
            'Mot de passe oublié session Windows',
            'Demande d\'installation logiciel',
        ];
        $priorites = ['haute', 'moyenne', 'haute', 'basse', 'moyenne'];
        $statutsTicket = ['ouvert', 'en_cours', 'resolu', 'ferme', 'ouvert'];

        foreach ($refs as $i => $ref) {
            $statut = $statutsTicket[$i];
            $ticket = Ticket::create([
                'reference_ticket' => $ref,
                'titre' => $titres[$i],
                'description' => 'Signalé par un agent du service. Merci d\'intervenir rapidement.',
                'priorite' => $priorites[$i],
                'date_creation' => now()->subDays(rand(2, 20)),
                'date_cloture' => in_array($statut, ['resolu', 'ferme']) ? now()->subDays(rand(0, 2)) : null,
                'statut' => $statut,
                'id_equipement' => $equipements[$i]->id_equipement,
                'id_agent' => $agents->isNotEmpty() ? $agents[($i + 3) % $agents->count()]->id_agent : null,
            ]);

            TicketCommentaire::create([
                'contenu' => 'Demande prise en compte par le SIT.',
                'date_commentaire' => now()->subDays(rand(1, 5)),
                'id_ticket' => $ticket->id_ticket,
                'id_utilisateur' => $techs->isNotEmpty() ? $techs[0]->id_utilisateur : null,
            ]);
        }
    }
}
