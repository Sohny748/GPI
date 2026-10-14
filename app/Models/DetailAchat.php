<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailAchat extends Model
{
    protected $primaryKey = 'id_detail_achat';

    protected $fillable = ['quantite', 'prix_unitaire', 'montant', 'date_livraison', 'description', 'id_achat', 'id_equipement'];

    protected function casts(): array
    {
        return ['date_livraison' => 'date', 'prix_unitaire' => 'decimal:2', 'montant' => 'decimal:2'];
    }

    public function achat(): BelongsTo
    {
        return $this->belongsTo(Achat::class, 'id_achat');
    }

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class, 'id_equipement');
    }
}
