<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketCommentaire extends Model
{
    protected $primaryKey = 'id_commentaire';

    protected $fillable = ['contenu', 'date_commentaire', 'id_ticket', 'id_utilisateur'];

    protected function casts(): array
    {
        return ['date_commentaire' => 'datetime'];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'id_ticket');
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }
}
