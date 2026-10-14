<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AgentController extends CrudController
{
    protected function model(): string
    {
        return Agent::class;
    }

    protected function label(): string
    {
        return 'agent';
    }

    protected function withRelations(): array
    {
        return ['direction', 'service'];
    }

    protected function rules(): array
    {
        $id = $this->routeId();
        $unique = fn (string $col) => Rule::unique('agents', $col)->ignore($id, 'id_agent');

        return [
            'matricule' => ['required', 'string', 'max:30', $unique('matricule')],
            'nom_naiss' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'sexe' => ['required', Rule::in(['M', 'F'])],
            'fonction' => ['nullable', 'string', 'max:100'],
            'telephone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150', $unique('email')],
            'date_embauche' => ['nullable', 'date'],
            'statut' => ['required', Rule::in(['actif', 'inactif', 'conge', 'mutation'])],
            'id_direction' => ['required', 'exists:directions,id_direction'],
            'id_service' => ['nullable', 'exists:services,id_service'],
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $query = Agent::with($this->withRelations());

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(fn ($sub) => $sub
                ->where('matricule', 'like', "%{$q}%")
                ->orWhere('nom_naiss', 'like', "%{$q}%")
                ->orWhere('prenom', 'like', "%{$q}%")
                ->orWhere('fonction', 'like', "%{$q}%"));
        }

        if ($request->filled('id_direction')) {
            $query->where('id_direction', $request->input('id_direction'));
        }
        if ($request->filled('id_service')) {
            $query->where('id_service', $request->input('id_service'));
        }

        return response()->json($query->orderBy('nom_naiss')->orderBy('prenom')->get());
    }

    /** ID de l'agent ciblé par la route (paramètre « agent » de l'apiResource, sinon « id »). */
    private function routeId(): ?int
    {
        $valeur = request()->route('agent') ?? request()->route('id');

        return $valeur !== null ? (int) $valeur : null;
    }
}
