<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Affectation extends Model
{
    protected $primaryKey = 'id_affectation';

    protected $fillable = ['date_affectation', 'date_fin', 'motif', 'commentaire', 'id_equipement', 'id_agent'];

    protected function casts(): array
    {
        return ['date_affectation' => 'date', 'date_fin' => 'date'];
    }

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class, 'id_equipement');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'id_agent');
    }
}
