<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Direction extends Model
{
    protected $primaryKey = 'id_direction';

    protected $fillable = ['code_direction', 'nom_direction', 'description', 'telephone', 'email', 'statut'];

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'id_direction');
    }

    public function agents(): HasMany
    {
        return $this->hasMany(Agent::class, 'id_direction');
    }
}
