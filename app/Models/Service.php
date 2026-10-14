<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $primaryKey = 'id_service';

    protected $fillable = ['code_service', 'nom_service', 'description', 'statut', 'id_direction'];

    public function direction(): BelongsTo
    {
        return $this->belongsTo(Direction::class, 'id_direction');
    }

    public function agents(): HasMany
    {
        return $this->hasMany(Agent::class, 'id_service');
    }
}
