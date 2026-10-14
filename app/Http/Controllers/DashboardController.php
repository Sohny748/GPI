<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\Affectation;
use App\Models\Equipement;
use App\Models\Inventaire;
use App\Models\Maintenance;
use App\Models\Notification;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $parStatut = Equipement::select('statut', DB::raw('count(*) as total'))
            ->groupBy('statut')
            ->pluck('total', 'statut');

        $parCategorie = Equipement::join('categories', 'categories.id_categorie', '=', 'equipements.id_categorie')
            ->select('categories.nom_categorie', DB::raw('count(*) as total'))
            ->groupBy('categories.nom_categorie')
            ->orderByDesc('total')
            ->get();

        $parDirection = Equipement::join('directions', 'directions.id_direction', '=', 'equipements.id_direction')
            ->select('directions.code_direction', DB::raw('count(*) as total'))
            ->groupBy('directions.code_direction')
            ->get();

        $achats = Achat::with('fournisseur')->withCount('details')->orderByDesc('date_achat')->orderByDesc('id_achat')->take(6)->get();

        return response()->json([
            'total_equipements' => Equipement::count(),
            'par_statut' => $parStatut,
            'par_categorie' => $parCategorie,
            'par_direction' => $parDirection,
            'tickets_ouverts' => Ticket::whereIn('statut', ['ouvert', 'en_cours'])->count(),
            'maintenances_cours' => Maintenance::where('statut', 'en_cours')->count(),
            'affectations_actives' => Affectation::whereNull('date_fin')->count(),
            'inventaires_cours' => Inventaire::where('statut', 'en_cours')->count(),
            'valeur_parc' => (float) Equipement::sum('prix_acquisition'),
            'garanties_expirantes' => Equipement::whereBetween('garantie_fin', [today(), today()->addDays(60)])->count(),
            'derniers_tickets' => Ticket::with('equipement', 'agent')->latest('id_ticket')->take(5)->get(),
            'derniers_mouvements' => \App\Models\Mouvement::with('equipement', 'utilisateur')->latest('id_mouvement')->take(5)->get(),
            'achats_recents' => $achats,
            'achats_par_mois' => Achat::select(
                DB::raw("DATE_FORMAT(date_achat, '%Y-%m') as mois"),
                DB::raw('COUNT(*) as nb'),
                DB::raw('COALESCE(SUM(montant_total), 0) as montant')
            )
                ->whereNotNull('date_achat')
                ->groupBy('mois')
                ->orderBy('mois')
                ->get(),
        ]);
    }
}
