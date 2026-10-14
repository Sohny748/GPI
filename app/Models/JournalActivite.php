<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalActivite extends Model
{
    protected $table = 'journal_activites';

    protected $primaryKey = 'id_log';

    protected $fillable = [
        'action', 'table_concernee', 'id_element', 'anciennes_valeurs',
        'nouvelles_valeurs', 'adresse_ip', 'id_utilisateur',
    ];

    protected function casts(): array
    {
        return ['date_action' => 'datetime'];
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }
}
