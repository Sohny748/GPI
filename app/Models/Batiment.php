<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Batiment extends Model
{
    protected $primaryKey = 'id_batiment';

    protected $fillable = ['code_batiment', 'nom_batiment', 'description', 'statut', 'id_site'];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'id_site');
    }

    public function localisations(): HasMany
    {
        return $this->hasMany(Localisation::class, 'id_batiment');
    }
}
