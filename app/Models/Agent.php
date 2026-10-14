<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agent extends Model
{
    protected $primaryKey = 'id_agent';

    protected $fillable = [
        'matricule', 'nom_naiss', 'prenom', 'sexe', 'fonction', 'telephone',
        'email', 'date_embauche', 'statut', 'id_direction', 'id_service',
    ];

    protected function casts(): array
    {
        return ['date_embauche' => 'date'];
    }

    public function direction(): BelongsTo
    {
        return $this->belongsTo(Direction::class, 'id_direction');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'id_service');
    }

    public function utilisateur()
    {
        return $this->hasOne(Utilisateur::class, 'id_agent');
    }

    public function affectations(): HasMany
    {
        return $this->hasMany(Affectation::class, 'id_agent');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'id_agent');
    }

    public function getNomCompletAttribute(): string
    {
        return trim("{$this->prenom} {$this->nom_naiss}");
    }
}
