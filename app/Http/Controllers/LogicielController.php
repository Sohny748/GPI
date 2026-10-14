<?php

namespace App\Http\Controllers;

use App\Models\Logiciel;
use App\Models\InstallationLogiciel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LogicielController extends CrudController
{
    protected function model(): string
    {
        return Logiciel::class;
    }

    protected function label(): string
    {
        return 'logiciel';
    }

    protected function withRelations(): array
    {
        return ['licences', 'installations.equipement'];
    }

    protected function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:150'],
            'version' => ['nullable', 'string', 'max:50'],
            'editeur' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $query = Logiciel::with($this->withRelations());

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(fn ($sub) => $sub
                ->where('nom', 'like', "%{$q}%")
                ->orWhere('editeur', 'like', "%{$q}%"));
        }

        return response()->json($query->orderBy('nom')->get());
    }

    /**
     * Installe un logiciel sur un équipement (installation_logiciels).
     */
    public function installer(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id_logiciel' => ['required', 'exists:logiciels,id_logiciel'],
            'id_equipement' => ['required', 'exists:equipements,id_equipement'],
            'version_installee' => ['nullable', 'string', 'max:50'],
            'licence' => ['nullable', 'string', 'max:100'],
            'date_installation' => ['nullable', 'date'],
            'statut' => ['nullable', Rule::in(['installe', 'desinstalle', 'erreur'])],
        ]);

        $data['date_installation'] ??= today();
        $data['statut'] ??= 'installe';

        $installation = InstallationLogiciel::updateOrCreate(
            ['id_logiciel' => $data['id_logiciel'], 'id_equipement' => $data['id_equipement']],
            $data
        );

        return response()->json($installation->load('logiciel', 'equipement'), 201);
    }

    /**
     * Désinstalle un logiciel d'un équipement.
     */
    public function desinstaller(int $id, int $equipement): JsonResponse
    {
        $installation = InstallationLogiciel::where('id_logiciel', $id)
            ->where('id_equipement', $equipement)
            ->firstOrFail();

        $installation->update(['statut' => 'desinstalle']);

        return response()->json($installation);
    }
}
