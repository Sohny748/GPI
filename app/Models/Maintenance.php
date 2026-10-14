<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Maintenance extends Model
{
    protected $primaryKey = 'id_maintenance';

    protected $fillable = [
        'date_demande', 'date_debut', 'date_fin', 'description_probleme',
        'diagnostic', 'technicien', 'statut', 'id_equipement', 'id_type_maintenance', 'id_agent',
    ];

    protected function casts(): array
    {
        return ['date_demande' => 'date', 'date_debut' => 'date', 'date_fin' => 'date'];
    }

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class, 'id_equipement');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(TypeMaintenance::class, 'id_type_maintenance');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'id_agent');
    }
}
