<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Logiciel extends Model
{
    protected $table = 'logiciels';

    protected $primaryKey = 'id_logiciel';

    protected $fillable = ['nom', 'version', 'editeur', 'description'];

    public function licences(): HasMany
    {
        return $this->hasMany(Licence::class, 'id_logiciel');
    }

    public function installations(): HasMany
    {
        return $this->hasMany(InstallationLogiciel::class, 'id_logiciel');
    }
}
