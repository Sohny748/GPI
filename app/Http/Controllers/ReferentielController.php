<?php

namespace App\Http\Controllers;

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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReferentielController extends Controller
{
    /**
     * Configuration des entités de référence modifiables depuis la page Paramètres.
     * type => [modèle, libellé, règles de validation, champs listés, relations]
     */
    private function types(): array
    {
        return [
        'directions' => [
            Direction::class, 'direction',
            [
                'nom_direction' => ['required', 'string', 'max:150'],
                'code_direction' => ['nullable', 'string', 'max:20'],
                'description' => ['nullable', 'string'],
                'telephone' => ['nullable', 'string', 'max:30'],
                'email' => ['nullable', 'email', 'max:150'],
                'statut' => ['nullable', Rule::in(['actif', 'inactif'])],
            ],
            ['id_direction', 'code_direction', 'nom_direction', 'email', 'telephone', 'statut'],
            [],
        ],
        'services' => [
            Service::class, 'service',
            [
                'nom_service' => ['required', 'string', 'max:150'],
                'code_service' => ['nullable', 'string', 'max:20'],
                'description' => ['nullable', 'string'],
                'statut' => ['nullable', Rule::in(['actif', 'inactif'])],
                'id_direction' => ['required', 'exists:directions,id_direction'],
            ],
            ['id_service', 'code_service', 'nom_service', 'statut', 'id_direction'],
            ['direction'],
        ],
        'categories' => [
            Categorie::class, 'catégorie',
            [
                'nom_categorie' => ['required', 'string', 'max:100'],
                'code_categorie' => ['nullable', 'string', 'max:20'],
                'description' => ['nullable', 'string'],
            ],
            ['id_categorie', 'code_categorie', 'nom_categorie', 'description'],
            [],
        ],
        'marques' => [
            Marque::class, 'marque',
            [
                'nom_marque' => ['required', 'string', 'max:100'],
                'description' => ['nullable', 'string'],
            ],
            ['id_marque', 'nom_marque', 'description'],
            [],
        ],
        'modeles' => [
            Modele::class, 'modèle',
            [
                'nom_modele' => ['required', 'string', 'max:150'],
                'reference_modele' => ['nullable', 'string', 'max:100'],
                'description' => ['nullable', 'string'],
                'id_categorie' => ['nullable', 'exists:categories,id_categorie'],
                'id_marque' => ['nullable', 'exists:marques,id_marque'],
            ],
            ['id_modele', 'nom_modele', 'reference_modele', 'id_categorie', 'id_marque'],
            ['categorie', 'marque'],
        ],
        'sites' => [
            Site::class, 'site',
            [
                'nom_site' => ['required', 'string', 'max:150'],
                'code_site' => ['nullable', 'string', 'max:20'],
                'ville' => ['required', 'string', 'max:100'],
                'description' => ['nullable', 'string'],
                'statut' => ['nullable', Rule::in(['actif', 'inactif'])],
                'id_direction' => ['nullable', 'exists:directions,id_direction'],
            ],
            ['id_site', 'code_site', 'nom_site', 'ville', 'statut'],
            [],
        ],
        'batiments' => [
            Batiment::class, 'bâtiment',
            [
                'nom_batiment' => ['required', 'string', 'max:150'],
                'code_batiment' => ['nullable', 'string', 'max:20'],
                'description' => ['nullable', 'string'],
                'statut' => ['nullable', Rule::in(['actif', 'inactif'])],
                'id_site' => ['required', 'exists:sites,id_site'],
            ],
            ['id_batiment', 'code_batiment', 'nom_batiment', 'statut', 'id_site'],
            ['site'],
        ],
        'localisations' => [
            Localisation::class, 'localisation',
            [
                'nom_localisation' => ['required', 'string', 'max:150'],
                'code_localisation' => ['nullable', 'string', 'max:30'],
                'etage' => ['nullable', 'string', 'max:50'],
                'bureau' => ['nullable', 'string', 'max:50'],
                'description' => ['nullable', 'string'],
                'statut' => ['nullable', Rule::in(['actif', 'inactif'])],
                'id_batiment' => ['required', 'exists:batiments,id_batiment'],
                'id_direction' => ['nullable', 'exists:directions,id_direction'],
            ],
            ['id_localisation', 'code_localisation', 'nom_localisation', 'etage', 'bureau', 'statut', 'id_batiment'],
            ['batiment.site'],
        ],
        'etats' => [
            EtatEquipement::class, 'état',
            [
                'nom_etat' => ['required', 'string', 'max:100'],
                'description' => ['nullable', 'string'],
            ],
            ['id_etat', 'nom_etat', 'description'],
            [],
        ],
        'fournisseurs' => [
            Fournisseur::class, 'fournisseur',
            [
                'raison_sociale' => ['required', 'string', 'max:200'],
                'contact' => ['nullable', 'string', 'max:100'],
                'telephone' => ['nullable', 'string', 'max:30'],
                'email' => ['nullable', 'email', 'max:150'],
                'adresse' => ['nullable', 'string', 'max:255'],
                'rcs' => ['nullable', 'string', 'max:50'],
            ],
            ['id_fournisseur', 'raison_sociale', 'contact', 'telephone', 'email', 'adresse', 'rcs'],
            [],
        ],
        ];
    }

    /** Unicité des champs par type : code et nom uniques. Format => [[code, pk], [nom]]. */
    private function uniques(): array
    {
        return [
            'directions' => [['code_direction', 'id_direction'], 'nom_direction'],
            'services' => [['code_service', 'id_service'], 'nom_service'],
            'sites' => [['code_site', 'id_site'], 'nom_site'],
            'batiments' => [['code_batiment', 'id_batiment'], 'nom_batiment'],
            'localisations' => [['code_localisation', 'id_localisation'], 'nom_localisation'],
            'categories' => [['code_categorie', 'id_categorie'], 'nom_categorie'],
            'marques' => [[null, null], 'nom_marque'],
            'modeles' => [['reference_modele', 'id_modele'], 'nom_modele'],
            'etats' => [[null, null], 'nom_etat'],
            'fournisseurs' => [[null, null], 'raison_sociale'],
        ];
    }

    /**
     * Ajoute les règles d'unicité présentes en base (indices uniques) en ignorant
     * l'élément modifié : code de référence + nom pour éviter les doublons de libellés.
     */
    private function reglesAvecUnicite(array $rules, string $type, ?int $ignoreId): array
    {
        [$code, $nom] = $this->uniques()[$type] ?? [null, null];
        $table = (new ($this->types()[$type][0]))->getTable();

        if ($code && $code[0] && isset($rules[$code[0]])) {
            [$colonneCode, $colonnePk] = $code;
            $rules[$colonneCode] = [
                ...$rules[$colonneCode],
                Rule::unique($table, $colonneCode)->ignore($ignoreId, $colonnePk),
            ];
        }

        if ($nom && isset($rules[$nom])) {
            $regle = Rule::unique($table, $nom);
            if ($ignoreId !== null) {
                $regle->ignore($ignoreId, $this->types()[$type][3][0] ?? 'id');
            }
            $rules[$nom] = [
                ...$rules[$nom],
                $regle,
            ];
        }

        return $rules;
    }

    /** Champs de recherche texte par type — la requête ne porte que sur les vraies colonnes. */
    private function champsRecherche(): array
    {
        return [
            'directions' => ['nom_direction', 'code_direction', 'description', 'email'],
            'services' => ['nom_service', 'code_service', 'description'],
            'categories' => ['nom_categorie', 'code_categorie', 'description'],
            'marques' => ['nom_marque', 'description'],
            'modeles' => ['nom_modele', 'reference_modele', 'description'],
            'sites' => ['nom_site', 'code_site', 'ville', 'description'],
            'batiments' => ['nom_batiment', 'code_batiment', 'description'],
            'localisations' => ['nom_localisation', 'code_localisation', 'etage', 'bureau', 'description'],
            'etats' => ['nom_etat', 'description'],
            'fournisseurs' => ['raison_sociale', 'contact', 'telephone', 'email', 'adresse', 'rcs'],
        ];
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'directions' => Direction::orderBy('nom_direction')->get(),
            'services' => Service::with('direction')->orderBy('nom_service')->get(),
            'sites' => Site::with('batiments.localisations')->orderBy('nom_site')->get(),
            'batiments' => Batiment::with('site')->orderBy('nom_batiment')->get(),
            'localisations' => Localisation::with('batiment.site')->orderBy('nom_localisation')->get(),
            'categories' => Categorie::orderBy('nom_categorie')->get(),
            'marques' => Marque::orderBy('nom_marque')->get(),
            'modeles' => Modele::with('categorie', 'marque')->orderBy('nom_modele')->get(),
            'etats' => EtatEquipement::orderBy('nom_etat')->get(),
            'fournisseurs' => Fournisseur::orderBy('raison_sociale')->get(),
            'equipementsMini' => \App\Models\Equipement::orderBy('code_inventaire')->get(['id_equipement', 'code_inventaire', 'designation']),
            'typeMaintenances' => \App\Models\TypeMaintenance::orderBy('nom_type')->get(['id_type_maintenance', 'nom_type']),
        ]);
    }

    private function config(string $type): array
    {
        $types = $this->types();
        if (! isset($types[$type])) {
            abort(404, "Type de référentiel inconnu : {$type}");
        }

        return $types[$type];
    }

    /** Liste d'un référentiel (GET /referentiel/{type}). */
    public function liste(string $type): JsonResponse
    {
        [$model, , , , $with] = $this->config($type);

        $query = $model::query();

        if (! empty($with)) {
            $query->with($with);
        }

        if (request()->filled('q')) {
            $s = request()->string('q');
            $query->where(fn ($sub) => collect($this->champsRecherche()[$type] ?? [])
                ->each(fn ($champ) => $sub->orWhere($champ, 'like', "%{$s}%")));
        }

        if (request()->filled('statut') && \Schema::hasColumn((new $model)->getTable(), 'statut')) {
            $query->where('statut', request()->input('statut'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request, string $type): JsonResponse
    {
        [$model, $label, $rules, , $with] = $this->config($type);

        $data = $request->validate($this->reglesAvecUnicite($rules, $type, null));
        $item = $model::create($data);

        return response()->json($item->load($with), 201);
    }

    public function update(Request $request, string $type, int $id): JsonResponse
    {
        [$model, $label, $rules, , $with] = $this->config($type);

        $item = $model::findOrFail($id);
        $data = $request->validate($this->reglesAvecUnicite($rules, $type, $id));
        $item->update($data);

        return response()->json($item->load($with));
    }

    public function destroy(string $type, int $id): JsonResponse
    {
        [$model, $label] = $this->config($type);

        $item = $model::findOrFail($id);

        try {
            $item->delete();
        } catch (\Illuminate\Database\QueryException $e) {
            if ((int) $e->getCode() === 23000 || str_contains($e->getMessage(), 'Integrity constraint')) {
                return response()->json([
                    'message' => "Impossible de supprimer ce(tte) {$label} : des éléments y sont encore rattachés.",
                ], 409);
            }
            throw $e;
        }

        return response()->json(['message' => ucfirst($label).' supprimé(e)']);
    }
}
