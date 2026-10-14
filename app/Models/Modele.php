<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Modele extends Model
{
    protected $primaryKey = 'id_modele';

    protected $fillable = ['reference_modele', 'nom_modele', 'description', 'id_categorie', 'id_marque'];

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'id_categorie');
    }

    public function marque(): BelongsTo
    {
        return $this->belongsTo(Marque::class, 'id_marque');
    }

    public function equipements(): HasMany
    {
        return $this->hasMany(Equipement::class, 'id_modele');
    }
}
