<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AchatController extends CrudController
{
    protected function model(): string
    {
        return Achat::class;
    }

    protected function label(): string
    {
        return 'achat';
    }

    protected function withRelations(): array
    {
        return ['fournisseur', 'details.equipement'];
    }

    protected function rules(): array
    {
        return [
            'reference_achat' => ['nullable', 'string', 'max:50', Rule::unique('achats', 'reference_achat')->ignore($this->routeId(), 'id_achat')],
            'date_achat' => ['nullable', 'date'],
            'numero_facture' => ['nullable', 'string', 'max:50'],
            'bon_commande' => ['nullable', 'string', 'max:50'],
            'montant_total' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'statut' => ['required', Rule::in(['commande', 'livre_partiel', 'livre', 'annule'])],
            'id_fournisseur' => ['nullable', 'exists:fournisseurs,id_fournisseur'],
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $query = Achat::with($this->withRelations());

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(fn ($sub) => $sub
                ->where('reference_achat', 'like', "%{$q}%")
                ->orWhere('numero_facture', 'like', "%{$q}%")
                ->orWhere('bon_commande', 'like', "%{$q}%"));
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->input('statut'));
        }
        if ($request->filled('id_fournisseur')) {
            $query->where('id_fournisseur', $request->input('id_fournisseur'));
        }

        return response()->json($query->orderByDesc('date_achat')->orderByDesc('id_achat')->get());
    }

    /** ID de l'achat ciblé par la route (paramètre « achat » de l'apiResource, sinon « id »). */
    private function routeId(): ?int
    {
        $valeur = request()->route('achat') ?? request()->route('id');

        return $valeur !== null ? (int) $valeur : null;
    }
}
