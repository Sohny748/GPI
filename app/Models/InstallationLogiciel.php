<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstallationLogiciel extends Model
{
    protected $primaryKey = 'id_installation';

    protected $fillable = ['date_installation', 'version_installee', 'licence', 'statut', 'id_logiciel', 'id_equipement'];

    protected function casts(): array
    {
        return ['date_installation' => 'date'];
    }

    public function logiciel(): BelongsTo
    {
        return $this->belongsTo(Logiciel::class, 'id_logiciel');
    }

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class, 'id_equipement');
    }
}
