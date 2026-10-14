<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MouvementHistorique extends Model
{
    protected $primaryKey = 'id_historique';

    protected $fillable = [
        'table_concernee', 'id_enregistrement', 'champ', 'ancienne_valeur',
        'nouvelle_valeur', 'commentaire', 'id_mouvement', 'id_utilisateur',
    ];

    public function mouvement(): BelongsTo
    {
        return $this->belongsTo(Mouvement::class, 'id_mouvement');
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }
}
