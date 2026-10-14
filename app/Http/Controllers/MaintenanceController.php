<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MaintenanceController extends CrudController
{
    protected function model(): string
    {
        return Maintenance::class;
    }

    protected function label(): string
    {
        return 'maintenance';
    }

    protected function withRelations(): array
    {
        return ['equipement.modele', 'equipement.modele.marque', 'type', 'agent'];
    }

    protected function rules(): array
    {
        return [
            'date_demande' => ['nullable', 'date'],
            'date_debut' => ['nullable', 'date'],
            'date_fin' => ['nullable', 'date', 'after_or_equal:date_debut'],
            'description_probleme' => ['nullable', 'string'],
            'diagnostic' => ['nullable', 'string'],
            'technicien' => ['nullable', 'string', 'max:150'],
            'statut' => ['required', Rule::in(['demandee', 'planifiee', 'en_cours', 'terminee', 'annulee'])],
            'id_equipement' => ['required', 'exists:equipements,id_equipement'],
            'id_type_maintenance' => ['required', 'exists:type_maintenances,id_type_maintenance'],
            'id_agent' => ['nullable', 'exists:agents,id_agent'],
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $query = Maintenance::with($this->withRelations());

        if ($request->filled('statut')) {
            $query->where('statut', $request->input('statut'));
        }
        if ($request->filled('id_equipement')) {
            $query->where('id_equipement', $request->input('id_equipement'));
        }

        return response()->json($query->orderByDesc('id_maintenance')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $data['date_demande'] ??= today();

        $maintenance = Maintenance::create($data);
        $this->logAction('création', $maintenance);

        return response()->json($maintenance->load($this->withRelations()), 201);
    }
}
