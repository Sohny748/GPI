<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Localisation extends Model
{
    protected $primaryKey = 'id_localisation';

    protected $fillable = ['code_localisation', 'nom_localisation', 'etage', 'bureau', 'description', 'statut', 'id_batiment'];

    public function batiment(): BelongsTo
    {
        return $this->belongsTo(Batiment::class, 'id_batiment');
    }

    public function equipements(): HasMany
    {
        return $this->hasMany(Equipement::class, 'id_localisation');
    }
}
