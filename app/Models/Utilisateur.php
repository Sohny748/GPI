<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens;

    protected $primaryKey = 'id_utilisateur';

    protected $fillable = ['username', 'email', 'password', 'actif', 'id_agent'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'dernier_connexion' => 'datetime',
            'actif' => 'boolean',
        ];
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'id_agent');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_utilisateur', 'id_utilisateur', 'id_role');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'id_utilisateur');
    }

    public function getNomCompletAttribute(): string
    {
        return $this->agent?->nom_complet ?? $this->username;
    }
}
