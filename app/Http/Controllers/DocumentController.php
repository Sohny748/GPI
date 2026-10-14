<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Equipement;
use App\Models\Achat;
use App\Models\Maintenance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/*
 * Gestion documentaire polymorphe : chaque document (PDF, image…) est
 * rattaché à un élément — fiche technique d'équipement, reçu/facture d'achat…
 * Upload via POST multipart, téléchargement via /documents/{id}/telecharger.
 */
class DocumentController extends Controller
{
    private const TYPES_AUTORISES = [
        'fiche_technique' => 'Fiche technique',
        'recu_achat' => 'Reçu d’achat',
        'facture' => 'Facture',
        'bon_livraison' => 'Bon de livraison',
        'photo' => 'Photo',
        'garantie' => 'Attestation de garantie',
        'autre' => 'Autre',
    ];

    public static function types(): array
    {
        return self::TYPES_AUTORISES;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Document::query()->with('utilisateur:id_utilisateur,username');

        if ($request->filled('documentable_type') && $request->filled('documentable_id')) {
            $query->where('documentable_type', $request->string('documentable_type'))
                  ->where('documentable_id', (int) $request->input('documentable_id'));
        }

        return response()->json(
            $query->orderByDesc('id_document')->get()->map(fn ($d) => [
                'id_document' => $d->id_document,
                'nom_document' => $d->nom_document,
                'type_document' => $d->type_document,
                'taille_fichier' => $d->taille_fichier,
                'mime_type' => $d->mime_type,
                'description' => $d->description,
                'documentable_type' => $d->documentable_type,
                'documentable_id' => $d->documentable_id,
                'url' => $d->chemin_fichier ? url('storage/'.$d->chemin_fichier) : null,
                'telecharger_url' => $d->telecharger_url,
                'utilisateur' => $d->utilisateur?->username ?? null,
                'created_at' => $d->created_at?->toISOString(),
            ])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fichier' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,webp,gif,bmp,svg'],
            'nom_document' => ['nullable', 'string', 'max:200'],
            'type_document' => ['nullable', 'string', 'max:50', \Illuminate\Validation\Rule::in(array_keys(self::TYPES_AUTORISES))],
            'description' => ['nullable', 'string', 'max:2000'],
            'documentable_type' => ['nullable', 'string', 'max:100', 'regex:/^[a-z_]+$/'],
            'documentable_id' => ['required_with:documentable_type', 'integer', 'min:1'],
        ]);

        $fichier = $data['fichier'];
        $chemin = $fichier->store('documents', 'public');

        $document = Document::create([
            'nom_document' => $data['nom_document'] ?? $fichier->getClientOriginalName(),
            'type_document' => $data['type_document'] ?? 'autre',
            'chemin_fichier' => $chemin,
            'taille_fichier' => $fichier->getSize(),
            'mime_type' => $fichier->getMimeType(),
            'description' => $data['description'] ?? null,
            'id_equipement' => ($data['documentable_type'] ?? null) === 'equipement' ? $data['documentable_id'] : null,
            'documentable_type' => $data['documentable_type'] ?? null,
            'documentable_id' => $data['documentable_id'] ?? null,
            'id_utilisateur' => auth()->user()?->id_utilisateur,
        ]);

        $this->journaliser('ajout document', $document);

        return response()->json([
            'message' => 'Document ajouté.',
            'document' => [
                'id_document' => $document->id_document,
                'nom_document' => $document->nom_document,
                'type_document' => $document->type_document,
                'taille_fichier' => $document->taille_fichier,
                'mime_type' => $document->mime_type,
                'description' => $document->description,
                'documentable_type' => $document->documentable_type,
                'documentable_id' => $document->documentable_id,
                'url' => url('storage/'.$document->chemin_fichier),
                'telecharger_url' => $document->telecharger_url,
                'created_at' => $document->created_at?->toISOString(),
            ],
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $document = Document::findOrFail($id);

        if ($document->chemin_fichier) {
            Storage::disk('public')->delete($document->chemin_fichier);
        }

        $document->delete();
        $this->journaliser('suppression document', $document);

        return response()->json(['message' => 'Document supprimé.']);
    }

    public function telecharger(int $id): StreamedResponse
    {
        $document = Document::findOrFail($id);
        abort_unless($document->chemin_fichier && Storage::disk('public')->exists($document->chemin_fichier), 404, 'Fichier introuvable.');

        // Barrière auth : Bearer Sanctum valide OU signature HMAC courte (<a href> natif).
        $authentifie = auth('sanctum')->check();
        if (! $authentifie) {
            $u = (int) request()->query('u');
            $h = (string) request()->query('h');
            $t = (string) request()->query('t');
            $fenetreCourante = floor(time() / 600);
            $valide = $u > 0 && in_array($t, [(string) $fenetreCourante, (string) ($fenetreCourante - 1)], true);
            $valide = $valide && hash_equals(
                self::signatureLien($id, $u, $t),
                $h
            );
            abort_unless($valide, 401, 'Signature de téléchargement invalide ou expirée. Rechargez la page et réessayez.');
        }

        $this->journaliser('telechargement document', $document);

        return Storage::disk('public')->download($document->chemin_fichier, $document->nom_document);
    }

    /**
     * Signature de lien court (fenêtre de 10 min) : sert aux <a href> natifs du
     * frontend qui ne peuvent pas porter d'en-tête Bearer. HMAC clé sur APP_KEY :
     * impossible à forger sans la clé applicative.
     */
    public static function signatureLien(int $idDocument, int $idUtilisateur, string $fenetre): string
    {
        return hash_hmac('sha256', $idDocument.'|'.$idUtilisateur.'|'.$fenetre, config('app.key'));
    }

    public function typesListe(): JsonResponse
    {
        return response()->json(self::TYPES_AUTORISES);
    }

    private function journaliser(string $action, Document $document): void
    {
        try {
            \App\Models\JournalActivite::create([
                'action' => $action,
                'table_concernee' => 'documents',
                'id_element' => $document->id_document,
                'adresse_ip' => request()->ip(),
                'id_utilisateur' => auth()->user()?->id_utilisateur,
            ]);
        } catch (\Throwable $e) {
            // Journalisation silencieuse : ne bloque jamais l'action principale.
        }
    }
}
