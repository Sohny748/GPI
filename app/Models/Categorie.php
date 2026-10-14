<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categorie extends Model
{
    protected $primaryKey = 'id_categorie';

    protected $fillable = ['code_categorie', 'nom_categorie', 'description', 'statut'];

    public function modeles(): HasMany
    {
        return $this->hasMany(Modele::class, 'id_categorie');
    }

    public function equipements(): HasMany
    {
        return $this->hasMany(Equipement::class, 'id_categorie');
    }
}
