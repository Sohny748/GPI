<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    protected $primaryKey = 'id_role';

    protected $fillable = ['nom_role', 'description'];

    public function utilisateurs(): BelongsToMany
    {
        return $this->belongsToMany(Utilisateur::class, 'role_utilisateur', 'id_role', 'id_utilisateur');
    }
}
