<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Agent;
use App\Models\Batiment;
use App\Models\Categorie;
use App\Models\Direction;
use App\Models\EtatEquipement;
use App\Models\Fournisseur;
use App\Models\Localisation;
use App\Models\Marque;
use App\Models\Modele;
use App\Models\Service;
use App\Models\Site;
use Illuminate\Support\Facades\DB;

$map = [
    'directions'    => [Direction::class, 'nom_direction', 'code_direction'],
    'services'      => [Service::class, 'nom_service', 'code_service'],
    'sites'         => [Site::class, 'nom_site', 'code_site'],
    'batiments'     => [Batiment::class, 'nom_batiment', 'code_batiment'],
    'localisations' => [Localisation::class, 'nom_localisation', 'code_localisation'],
    'categories'    => [Categorie::class, 'nom_categorie', 'code_categorie'],
    'marques'       => [Marque::class, 'nom_marque', null],
    'modeles'       => [Modele::class, 'nom_modele', null],
    'etats'         => [EtatEquipement::class, 'nom_etat', null],
    'fournisseurs'  => [Fournisseur::class, 'raison_sociale', null],
    'agents'        => [Agent::class, null, 'matricule'],
];

$problemes = 0;

foreach ($map as $table => [$model, $colNom, $colCode]) {
    echo "== $table ==\n";

    if ($colNom) {
        $doublons = $model::select($colNom, DB::raw('COUNT(*) n'))
            ->groupBy($colNom)->havingRaw('COUNT(*) > 1')->get();
        foreach ($doublons as $d) {
            $problemes++;
            echo "  DOUBLON NOM : \"{$d[$colNom]}\" x{$d->n}\n";
            $model::where($colNom, $d[$colNom])->get()
                ->each(fn ($e) => echo_ligne($e, $colCode));
        }
    }

    if ($colCode) {
        $doublons = $model::select($colCode, DB::raw('COUNT(*) n'))
            ->groupBy($colCode)->havingRaw('COUNT(*) > 1')->get();
        foreach ($doublons as $d) {
            $problemes++;
            echo "  DOUBLON CODE : \"{$d[$colCode]}\" x{$d->n}\n";
        }
    }

    $vides = $model::where(fn ($q) => $q->where($colNom ?? $colCode, '')->orWhereNull($colNom ?? $colCode))->count();
    if ($vides) { $problemes += $vides; echo "  NOM VIDE: $vides\n"; }
}

/* cohérence hiérarchique : service())){
 *   un agent ACTIF ne doit pas pointer vers un service/direction inactif
 */
$agentsIncoherents = Agent::where('statut', 'actif')
    ->whereHas('service', fn ($q) => $q->where('statut', 'inactif'))
    ->count();
if ($agentsIncoherents) { $problemes += $agentsIncoherents; echo "== agents actifs dans un service inactif : $agentsIncoherents\n"; }

$servicesIncoherents = Service::where('statut', 'actif')
    ->whereHas('direction', fn ($q) => $q->where('statut', 'inactif'))
    ->count();
if ($servicesIncoherents) { $problemes += $servicesIncoherents; echo "== services actifs dans une direction inactive : $servicesIncoherents\n"; }

/* chaîne de localisation : un bâtiment ACTIF ne doit pas dépendre d'un site inactif, etc. */
$batimentsOrphelins = Batiment::where('statut', 'actif')->whereHas('site', fn ($q) => $q->where('statut', 'inactif'))->count();
if ($batimentsOrphelins) { $problemes += $batimentsOrphelins; echo "== batiments actifs dans un site inactif : $batimentsOrphelins\n"; }

$localisationsOrphelines = Localisation::where('statut', 'actif')->whereHas('batiment', fn ($q) => $q->where('statut', 'inactif'))->count();
if ($localisationsOrphelines) { $problemes += $localisationsOrphelines; echo "== localisations actives dans un batiment inactif : $localisationsOrphelines\n"; }

/* équipements rattachés à des référentiels inactifs */
$eqSiteInactif = \App\Models\Equipement::whereHas('localisation.batiment.site', fn ($q) => $q->where('statut', 'inactif'))->count();
if ($eqSiteInactif) { $problemes += $eqSiteInactif; echo "== equipements sur un site inactif : $eqSiteInactif\n"; }

$eqBatimentInactif = \App\Models\Equipement::whereHas('localisation.batiment', fn ($q) => $q->where('statut', 'inactif'))->count();
if ($eqBatimentInactif) { $problemes += $eqBatimentInactif; echo "== equipements dans un batiment inactif : $eqBatimentInactif\n"; }

echo "\nTOTAL PROBLEMES: $problemes\n";

function echo_ligne($e, $colCode)
{
    $id = $e->getKey();
    $code = $colCode ? ($e->{$colCode} ?? '-') : '-';
    $statut = $e->statut ?? '-';
    echo "      -> id={$id} code={$code} statut={$statut}\n";
}
