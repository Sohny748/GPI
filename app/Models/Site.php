<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Site extends Model
{
    protected $primaryKey = 'id_site';

    protected $fillable = ['code_site', 'nom_site', 'ville', 'description', 'statut', 'id_direction'];

    public function direction(): BelongsTo
    {
        return $this->belongsTo(Direction::class, 'id_direction');
    }

    public function batiments(): HasMany
    {
        return $this->hasMany(Batiment::class, 'id_site');
    }
}
