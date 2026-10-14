<?php

use App\Models\Direction;
use App\Models\Fournisseur;
use App\Models\Marque;
use App\Models\Service;
use App\Http\Controllers\ReferentielController;

/*
 * Vérification de bout en bout des règles d'unicité (noms + codes) :
 * on rejoue le validateur du ReferentielController sur des payloads doublons.
 */

$ctrl = app(ReferentielController::class);

$faireFaute = function (string $type, array $payload, ?int $ignoreId = null) use ($ctrl) {
    // astuce : reglesAvecUnicite + Validator pour tester sans requête HTTP
    $types = (function () use ($ctrl) {
        $m = new ReflectionMethod($ctrl, 'types');
        $m->setAccessible(true);
        return $m->invoke($ctrl);
    })();
    [$model, , $rules] = $types[$type];
    $m = new ReflectionMethod($ctrl, 'reglesAvecUnicite');
    $m->setAccessible(true);
    $regles = $m->invoke($ctrl, $rules, $type, $ignoreId);
    $v = validator($payload, $regles);
    return $v->fails() ? $v->errors()->all() : null;
};

// 1. Dupliquer un nom de direction existant
$existante = Direction::first();
$e = $faireFaute('directions', ['nom_direction' => $existante->nom_direction, 'code_direction' => 'X1', 'statut' => 'actif']);
echo 'direction doublon nom : ' . ($e ? 'REJETE ✓' : 'ACCEPTE ✗') . PHP_EOL;

// 2. Créer une direction avec un NOUVEAU nom (doit passer)
$e = $faireFaute('directions', ['nom_direction' => 'Test Unicite ' . uniqid(), 'code_direction' => 'TX' . random_int(100, 999), 'statut' => 'actif']);
echo 'direction nom neuf    : ' . ($e ? 'REJETE ✗' : 'OK ✓') . PHP_EOL;

// 3. Dupliquer une marque
$marque = Marque::first();
$e = $faireFaute('marques', ['nom_marque' => $marque->nom_marque]);
echo 'marque doublon nom    : ' . ($e ? 'REJETE ✓' : 'ACCEPTE ✗') . PHP_EOL;

// 4. Duplier un fournisseur (raison_sociale)
$f = Fournisseur::first();
$e = $faireFaute('fournisseurs', ['raison_sociale' => $f->raison_sociale]);
echo 'fournisseur doublon   : ' . ($e ? 'REJETE ✓' : 'ACCEPTE ✗') . PHP_EOL;

// 5. Modifier une direction en gardant son propre nom (ignore) — doit passer
$e = $faireFaute('directions', ['nom_direction' => $existante->nom_direction, 'code_direction' => $existante->code_direction, 'statut' => 'actif'], $existante->id_direction);
echo 'edition sans changet  : ' . ($e ? 'REJETE ✗' : 'OK ✓') . PHP_EOL;

// 6. Dupliquer un service (nom)
$s = Service::first();
$e = $faireFaute('services', ['nom_service' => $s->nom_service, 'id_direction' => $s->id_direction, 'statut' => 'actif']);
echo 'service doublon nom   : ' . ($e ? 'REJETE ✓' : 'ACCEPTE ✗') . PHP_EOL;

// 7. Force du garde-fou SQL : insertion brute en base doit lever une exception
try {
    Fournisseur::create(['raison_sociale' => $f->raison_sociale, 'statut' => 'inactif']);
    echo 'insertion SQL brut    : ACCEPTE ✗ (index absent !)' . PHP_EOL;
} catch (Throwable $ex) {
    echo 'insertion SQL brut    : BLOQUEE PAR L-INDEX ✓ (' . str($ex->getMessage())->limit(60) . ')' . PHP_EOL;
}
