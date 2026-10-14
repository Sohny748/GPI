<?php

namespace App\Http\Controllers;

use App\Models\Equipement;
use App\Models\Localisation;
use App\Models\Mouvement;
use App\Models\MouvementHistorique;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EquipementController extends CrudController
{
    protected function model(): string
    {
        return Equipement::class;
    }

    protected function label(): string
    {
        return 'équipement';
    }

    protected function withRelations(): array
    {
        return ['modele.categorie', 'modele.marque', 'categorie', 'marque', 'direction', 'service', 'fournisseur', 'localisation.batiment.site', 'etat'];
    }

    protected function rules(): array
    {
        return [
            'code_inventaire' => ['required', 'string', 'max:50', Rule::unique('equipements', 'code_inventaire')->ignore($this->routeId(), 'id_equipement')],
            'numero_serie' => ['nullable', 'string', 'max:100', Rule::unique('equipements', 'numero_serie')->ignore($this->routeId(), 'id_equipement')],
            'designation' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'date_acquisition' => ['nullable', 'date'],
            'date_mise_service' => ['nullable', 'date'],
            'prix_acquisition' => ['nullable', 'numeric', 'min:0'],
            'garantie_debut' => ['nullable', 'date'],
            'garantie_fin' => ['nullable', 'date', 'after_or_equal:garantie_debut'],
            'statut' => ['required', Rule::in(['en_service', 'en_stock', 'en_maintenance', 'reforme', 'perdu', 'reserve'])],
            'id_modele' => ['nullable', 'exists:modeles,id_modele'],
            'id_categorie' => ['nullable', 'exists:categories,id_categorie'],
            'id_marque' => ['nullable', 'exists:marques,id_marque'],
            'id_direction' => ['nullable', 'exists:directions,id_direction'],
            'id_service' => ['nullable', 'exists:services,id_service'],
            'id_fournisseur' => ['nullable', 'exists:fournisseurs,id_fournisseur'],
            'id_localisation' => ['nullable', 'exists:localisations,id_localisation'],
            'id_etat' => ['nullable', 'exists:etat_equipements,id_etat'],
        ];
    }

    private function routeId(): ?int
    {
        $valeur = request()->route('equipement') ?? request()->route('id');

        return $valeur !== null ? (int) $valeur : null;
    }

    /** Vrai si l'équipement a une affectation en cours (sans date de fin). */
    private function hasAffectationActive(int $idEquipement): bool
    {
        if (! $idEquipement) return false;
        return \App\Models\Affectation::where('id_equipement', $idEquipement)
            ->whereNull('date_fin')
            ->exists();
    }

    /**
     * Répare les incohérences existantes : équipements marqués « en service »
     * alors qu'aucun service ni affectation active ne les concerne.
     */
    public function reparerStatuts(): JsonResponse
    {
        $corriges = Equipement::where('statut', 'en_service')
            ->whereNull('id_service')
            ->whereDoesntHave('affectations', fn ($q) => $q->whereNull('date_fin'))
            ->get();

        foreach ($corriges as $eq) {
            $eq->update(['statut' => 'en_stock']);
            Mouvement::create([
                'type_mouvement' => 'stock',
                'motif' => 'Correction automatique : statut « en service » sans service utilisateur détecté',
                'date_mouvement' => now(),
                'id_equipement' => $eq->id_equipement,
                'id_utilisateur' => auth()->id(),
            ]);
            $this->logAction('correction statut', $eq);
        }

        return response()->json([
            'message' => "{$corriges->count()} équipement(s) reclassé(s) en « en stock ».",
            'corriges' => $corriges->map(fn ($e) => ['id' => $e->id_equipement, 'code' => $e->code_inventaire, 'designation' => $e->designation]),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Equipement::query()->with($this->withRelations());

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(fn ($sub) => $sub
                ->where('code_inventaire', 'like', "%{$q}%")
                ->orWhere('numero_serie', 'like', "%{$q}%")
                ->orWhere('designation', 'like', "%{$q}%"));
        }

        foreach (['statut', 'id_categorie', 'id_marque', 'id_direction', 'id_service', 'id_localisation'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json($query->orderBy('code_inventaire')->paginate($perPage));
    }

    public function show(int $id): JsonResponse
    {
        $equipement = Equipement::with(array_merge($this->withRelations(), [
            'affectations.agent.service',
            'affectations.agent.direction',
            'maintenances.type',
            'tickets',
            'mouvements.utilisateur',
            'documents',
            'installations.logiciel',
        ]))->findOrFail($id);

        // Formations liées à cet équipement (avec le nombre de participants)
        $equipement->setRelation('formations', \App\Models\Formation::withCount('participants')
            ->where('id_equipement', $id)
            ->orderByDesc('date_debut')
            ->get(['id_formation', 'titre', 'theme', 'formateur', 'date_debut', 'statut', 'id_equipement']));

        return response()->json($equipement);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());

        // Cohérence : « en service » exige un service utilisateur ou une affectation.
        // Sinon on déclasse en « en stock » (aucune perte de données, juste le statut).
        if (($data['statut'] ?? null) === 'en_service'
            && empty($data['id_service'])
            && ! $this->hasAffectationActive($request->input('id_equipement'))) {
            $data['statut'] = 'en_stock';
        }

        $equipement = Equipement::create($data);

        Mouvement::create([
            'type_mouvement' => 'stock',
            'motif' => 'Création de la fiche équipement',
            'date_mouvement' => now(),
            'id_equipement' => $equipement->id_equipement,
            'id_utilisateur' => auth()->id(),
        ]);

        $this->logAction('création', $equipement);

        return response()->json($equipement->load($this->withRelations()), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $equipement = Equipement::findOrFail($id);
        $data = $request->validate($this->rules());

        // Cohérence à la mise à jour : même règle que la création.
        if (($data['statut'] ?? null) === 'en_service'
            && empty($data['id_service'])
            && ! $this->hasAffectationActive($equipement->id_equipement)) {
            $data['statut'] = 'en_stock';
        }

        if (! empty($data['id_localisation']) && $data['id_localisation'] != $equipement->id_localisation) {
            $mouvement = Mouvement::create([
                'type_mouvement' => 'transfert',
                'motif' => 'Changement de localisation',
                'ancienne_localisation' => $equipement->id_localisation,
                'nouvelle_localisation' => $data['id_localisation'],
                'date_mouvement' => now(),
                'id_equipement' => $equipement->id_equipement,
                'id_utilisateur' => auth()->id(),
            ]);

            MouvementHistorique::create([
                'table_concernee' => 'equipements',
                'id_enregistrement' => $equipement->id_equipement,
                'champ' => 'id_localisation',
                'ancienne_valeur' => $equipement->localisation?->code_localisation,
                'nouvelle_valeur' => Localisation::find($data['id_localisation'])?->code_localisation,
                'id_mouvement' => $mouvement->id_mouvement,
                'id_utilisateur' => auth()->id(),
            ]);
        }

        $equipement->update($data);
        $this->logAction('modification', $equipement);

        return response()->json($equipement->load($this->withRelations()));
    }
}
