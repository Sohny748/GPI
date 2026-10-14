<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Licence extends Model
{
    protected $primaryKey = 'id_licence';

    protected $fillable = [
        'reference_licence', 'type_licence', 'nb_licences', 'date_acquisition',
        'date_expiration', 'numero_serie', 'statut', 'id_logiciel',
    ];

    protected function casts(): array
    {
        return ['date_acquisition' => 'date', 'date_expiration' => 'date'];
    }

    public function logiciel(): BelongsTo
    {
        return $this->belongsTo(Logiciel::class, 'id_logiciel');
    }
}
