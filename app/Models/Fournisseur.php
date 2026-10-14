<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fournisseur extends Model
{
    protected $primaryKey = 'id_fournisseur';

    protected $fillable = ['raison_sociale', 'contact', 'telephone', 'email', 'adresse', 'rcs', 'statut'];

    public function achats(): HasMany
    {
        return $this->hasMany(Achat::class, 'id_fournisseur');
    }

    public function equipements(): HasMany
    {
        return $this->hasMany(Equipement::class, 'id_fournisseur');
    }
}
