<?php

namespace App\Http\Controllers;

use App\Models\InventaireDetail;
use Illuminate\Http\JsonResponse;

class InventaireController extends Controller
{
    public function details(): JsonResponse
    {
        return response()->json(
            InventaireDetail::with(['inventaire', 'equipement'])
                ->orderBy('id_inventaire')
                ->orderBy('id_detail')
                ->get()
        );
    }
}
