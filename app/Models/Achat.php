<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Achat extends Model
{
    protected $primaryKey = 'id_achat';

    protected $fillable = [
        'reference_achat', 'date_achat', 'numero_facture', 'bon_commande',
        'montant_total', 'description', 'statut', 'id_fournisseur',
    ];

    protected function casts(): array
    {
        return ['date_achat' => 'date', 'montant_total' => 'decimal:2'];
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class, 'id_fournisseur');
    }

    public function details(): HasMany
    {
        return $this->hasMany(DetailAchat::class, 'id_achat');
    }
}
