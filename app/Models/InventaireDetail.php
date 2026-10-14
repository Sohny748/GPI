<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventaireDetail extends Model
{
    protected $table = 'inventaire_details';

    protected $primaryKey = 'id_detail';

    protected $fillable = ['presence', 'date_constat', 'observation', 'date_verification', 'statut', 'id_inventaire', 'id_equipement'];

    protected function casts(): array
    {
        return ['presence' => 'boolean', 'date_constat' => 'date', 'date_verification' => 'date'];
    }

    public function inventaire(): BelongsTo
    {
        return $this->belongsTo(Inventaire::class, 'id_inventaire');
    }

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class, 'id_equipement');
    }
}
