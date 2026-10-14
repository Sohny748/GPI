<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipement extends Model
{
    protected $primaryKey = 'id_equipement';

    protected $fillable = [
        'code_inventaire', 'numero_serie', 'designation', 'description',
        'date_acquisition', 'date_mise_service', 'prix_acquisition',
        'garantie_debut', 'garantie_fin', 'statut',
        'id_modele', 'id_categorie', 'id_marque', 'id_direction', 'id_service',
        'id_fournisseur', 'id_localisation', 'id_etat',
    ];

    protected function casts(): array
    {
        return [
            'date_acquisition' => 'date',
            'date_mise_service' => 'date',
            'garantie_debut' => 'date',
            'garantie_fin' => 'date',
            'prix_acquisition' => 'decimal:2',
        ];
    }

    public function modele(): BelongsTo
    {
        return $this->belongsTo(Modele::class, 'id_modele');
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'id_categorie');
    }

    public function marque(): BelongsTo
    {
        return $this->belongsTo(Marque::class, 'id_marque');
    }

    public function direction(): BelongsTo
    {
        return $this->belongsTo(Direction::class, 'id_direction');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'id_service');
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class, 'id_fournisseur');
    }

    public function localisation(): BelongsTo
    {
        return $this->belongsTo(Localisation::class, 'id_localisation');
    }

    public function etat(): BelongsTo
    {
        return $this->belongsTo(EtatEquipement::class, 'id_etat');
    }

    public function affectations(): HasMany
    {
        return $this->hasMany(Affectation::class, 'id_equipement');
    }

    public function maintenances(): HasMany
    {
        return $this->hasMany(Maintenance::class, 'id_equipement');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'id_equipement');
    }

    public function mouvements(): HasMany
    {
        return $this->hasMany(Mouvement::class, 'id_equipement');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'id_equipement');
    }

    public function installations(): HasMany
    {
        return $this->hasMany(InstallationLogiciel::class, 'id_equipement');
    }

    public function qrCode()
    {
        return $this->hasOne(QrCode::class, 'id_equipement');
    }

    /** Affectation active (sans date de fin) */
    public function affectationActive()
    {
        return $this->hasOne(Affectation::class, 'id_equipement')->whereNull('date_fin')->latest('date_affectation');
    }
}
