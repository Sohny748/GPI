<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    protected $primaryKey = 'id_document';

    protected $fillable = [
        'nom_document', 'type_document', 'chemin_fichier', 'taille_fichier',
        'mime_type', 'description', 'id_equipement', 'id_utilisateur',
        'documentable_type', 'documentable_id',
    ];

    /** URL complètes ajoutées à chaque sérialisation (liste, relation équipement…). */
    protected $appends = ['url', 'telecharger_url'];

    /** URL publique du fichier (servi en inline : utilisable par la visionneuse intégrée). */
    public function getUrlAttribute(): ?string
    {
        return $this->chemin_fichier ? url('storage/'.$this->chemin_fichier) : null;
    }

    /** URL de téléchargement (pièce jointe) — lien signé court pour <a href> natif. */
    public function getTelechargerUrlAttribute(): string
    {
        $base = route('documents.telecharger', ['id' => $this->id_document]);
        $user = request()?->user();
        if ($user) {
            $fenetre = (string) floor(time() / 600); // fenêtre de 10 minutes
            $h = \App\Http\Controllers\DocumentController::signatureLien($this->id_document, $user->id_utilisateur, $fenetre);
            return $base.'?h='.$h.'&u='.$user->id_utilisateur.'&t='.$fenetre;
        }
        return $base;
    }

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class, 'id_equipement');
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }
}
