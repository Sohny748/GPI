<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $primaryKey = 'id_ticket';

    protected $fillable = [
        'reference_ticket', 'titre', 'description', 'priorite',
        'date_creation', 'date_cloture', 'statut', 'id_equipement', 'id_agent',
    ];

    protected function casts(): array
    {
        return ['date_creation' => 'date', 'date_cloture' => 'date'];
    }

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class, 'id_equipement');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'id_agent');
    }

    public function commentaires(): HasMany
    {
        return $this->hasMany(TicketCommentaire::class, 'id_ticket');
    }
}
