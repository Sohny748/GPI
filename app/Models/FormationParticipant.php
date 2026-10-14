<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormationParticipant extends Model
{
    protected $primaryKey = 'id_participant';

    protected $fillable = ['id_formation', 'id_agent', 'statut', 'note', 'commentaire', 'date_validation'];

    protected function casts(): array
    {
        return ['date_validation' => 'datetime', 'note' => 'decimal:2'];
    }

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'id_formation');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'id_agent');
    }
}
