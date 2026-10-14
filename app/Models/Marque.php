<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Marque extends Model
{
    protected $primaryKey = 'id_marque';

    protected $fillable = ['nom_marque', 'description'];

    public function modeles(): HasMany
    {
        return $this->hasMany(Modele::class, 'id_marque');
    }

    public function equipements(): HasMany
    {
        return $this->hasMany(Equipement::class, 'id_marque');
    }
}
