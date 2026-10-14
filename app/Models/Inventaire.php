<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventaire extends Model
{
    protected $primaryKey = 'id_inventaire';

    protected $fillable = ['reference', 'date_debut', 'date_fin', 'description', 'statut', 'id_utilisateur'];

    protected function casts(): array
    {
        return ['date_debut' => 'date', 'date_fin' => 'date'];
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }

    public function details(): HasMany
    {
        return $this->hasMany(InventaireDetail::class, 'id_inventaire');
    }
}
