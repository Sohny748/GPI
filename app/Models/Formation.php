<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Formation extends Model
{
    protected $primaryKey = 'id_formation';

    protected $fillable = [
        'titre', 'theme', 'description', 'formateur', 'organisme', 'lieu',
        'modalite', 'date_debut', 'date_fin', 'duree_heures', 'statut',
        'id_equipement', 'id_utilisateur',
    ];

    protected function casts(): array
    {
        return ['date_debut' => 'date', 'date_fin' => 'date'];
    }

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class, 'id_equipement');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(FormationParticipant::class, 'id_formation');
    }
}
