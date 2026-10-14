<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $primaryKey = 'id_notification';

    protected $fillable = ['titre', 'message', 'type', 'lu', 'id_utilisateur'];

    protected function casts(): array
    {
        return ['lu' => 'boolean', 'date_creation' => 'datetime'];
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }
}
