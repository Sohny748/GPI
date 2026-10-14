<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeMaintenance extends Model
{
    protected $primaryKey = 'id_type_maintenance';

    protected $fillable = ['nom_type', 'description'];

    public function maintenances(): HasMany
    {
        return $this->hasMany(Maintenance::class, 'id_type_maintenance');
    }
}
