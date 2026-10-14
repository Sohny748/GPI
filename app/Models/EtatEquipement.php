<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EtatEquipement extends Model
{
    protected $table = 'etat_equipements';

    protected $primaryKey = 'id_etat';

    protected $fillable = ['nom_etat', 'description'];

    public function equipements(): HasMany
    {
        return $this->hasMany(Equipement::class, 'id_etat');
    }
}
