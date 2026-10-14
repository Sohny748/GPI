<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\DetailAchat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/*
 * Lignes de détail d'un achat : chaque ligne = un équipement (ou un article
 * libre) avec sa quantité, son prix unitaire et son montant. La création,
 * la modification ou la suppression d'une ligne recalcule automatiquement
 * le montant_total de l'achat parent (somme des lignes).
 */
class DetailAchatController extends Controller
{
    public function index(int $achat): JsonResponse
    {
        $lignes = DetailAchat::with('equipement:id_equipement,code_inventaire,designation')
            ->where('id_achat', $achat)
            ->orderBy('id_detail_achat')
            ->get();

        return response()->json($lignes);
    }

    public function store(Request $request, int $achat): JsonResponse
    {
        $data = $this->valide($request);
        $data['id_achat'] = $achat;

        $ligne = DetailAchat::create($data);
        $this->recalcule($achat);

        return response()->json($ligne->load('equipement:id_equipement,code_inventaire,designation'), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $ligne = DetailAchat::findOrFail($id);
        $data = $this->valide($request);
        $ligne->update($data);
        $this->recalcule($ligne->id_achat);

        return response()->json($ligne->fresh()->load('equipement:id_equipement,code_inventaire,designation'));
    }

    public function destroy(int $id): JsonResponse
    {
        $ligne = DetailAchat::findOrFail($id);
        $achat = $ligne->id_achat;
        $ligne->delete();
        $this->recalcule($achat);

        return response()->json(['message' => 'Ligne supprimée.']);
    }

    private function valide(Request $request): array
    {
        return $request->validate([
            'id_equipement' => ['nullable', 'exists:equipements,id_equipement'],
            'quantite' => ['required', 'integer', 'min:1', 'max:10000'],
            'prix_unitaire' => ['nullable', 'numeric', 'min:0'],
            'date_livraison' => ['nullable', 'date'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);
    }

    /** Recalcule le montant_total de l'achat comme la somme de ses lignes. */
    private function recalcule(int $achat): void
    {
        $total = (float) DetailAchat::where('id_achat', $achat)
            ->selectRaw('COALESCE(SUM(COALESCE(montant, quantite * COALESCE(prix_unitaire, 0))), 0) as t')
            ->value('t');

        Achat::whereKey($achat)->update(['montant_total' => $total]);
    }
}
