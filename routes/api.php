<?php

use App\Http\Controllers\AchatController;
use App\Http\Controllers\AffectationController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DetailAchatController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EquipementController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\InventaireController;
use App\Http\Controllers\LogicielController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ReferentielController;
use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

/*
 * Téléchargement de documents : accessible soit avec un en-tête Bearer Sanctum
 * valide, soit avec une signature HMAC courte (générée par le backend pour les
 * liens <a href> natifs, valable 10 min). La vérification back-end fait foi —
 * aucun accès anonyme au fichier.
 */
Route::get('/documents/{id}/telecharger', [DocumentController::class, 'telecharger'])
    ->name('documents.telecharger');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profil', [AuthController::class, 'updateProfil']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'stats']);
    Route::get('/referentiel', [ReferentielController::class, 'index']);
    Route::get('/referentiel/{type}', [ReferentielController::class, 'liste']);
    Route::post('/referentiel/{type}', [ReferentielController::class, 'store']);
    Route::put('/referentiel/{type}/{id}', [ReferentielController::class, 'update']);
    Route::delete('/referentiel/{type}/{id}', [ReferentielController::class, 'destroy']);
    Route::get('/inventaire-details', [InventaireController::class, 'details']);

    // Formations (sessions liées aux équipements + agents participants)
    Route::get('/formations', [FormationController::class, 'index']);
    Route::post('/formations', [FormationController::class, 'store']);
    Route::get('/formations/{id}', [FormationController::class, 'show']);
    Route::put('/formations/{id}', [FormationController::class, 'update']);
    Route::delete('/formations/{id}', [FormationController::class, 'destroy']);
    Route::post('/formations/{id}/participants', [FormationController::class, 'ajouterParticipant']);
    Route::delete('/formations/{id}/participants/{participant}', [FormationController::class, 'retirerParticipant']);
    Route::put('/formations/{id}/participants/{participant}', [FormationController::class, 'changerStatutParticipant']);
    Route::get('/formations-ref/agents', [FormationController::class, 'agentsLeger']);
    Route::get('/formations-ref/equipements', [FormationController::class, 'equipementsLeger']);

    // Documents (fiches techniques, reçus d'achat, photos…)
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
    Route::get('/documents/types', [DocumentController::class, 'typesListe']);

    Route::get('equipements-reparer-statuts', [EquipementController::class, 'reparerStatuts']);
    Route::apiResource('equipements', EquipementController::class);
    Route::apiResource('agents', AgentController::class);
    Route::apiResource('tickets', TicketController::class);
    Route::post('tickets/{id}/commentaires', [TicketController::class, 'comment']);
    Route::apiResource('affectations', AffectationController::class);
    Route::post('affectations/{id}/restitution', [AffectationController::class, 'restitution']);

    Route::apiResource('achats', AchatController::class);
    Route::get('achats/{achat}/details', [DetailAchatController::class, 'index']);
    Route::post('achats/{achat}/details', [DetailAchatController::class, 'store']);
    Route::put('details-achats/{id}', [DetailAchatController::class, 'update']);
    Route::delete('details-achats/{id}', [DetailAchatController::class, 'destroy']);
    Route::apiResource('maintenances', MaintenanceController::class);
    Route::apiResource('logiciels', LogicielController::class);
    Route::post('installations', [LogicielController::class, 'installer']);
    Route::post('logiciels/{id}/desinstaller/{equipement}', [LogicielController::class, 'desinstaller']);
});
