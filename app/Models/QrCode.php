<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QrCode extends Model
{
    protected $table = 'qr_codes';

    protected $primaryKey = 'id_qrcode';

    protected $fillable = ['contenu', 'image', 'statut', 'id_equipement'];

    protected function casts(): array
    {
        return ['date_generation' => 'datetime'];
    }

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class, 'id_equipement');
    }
}
