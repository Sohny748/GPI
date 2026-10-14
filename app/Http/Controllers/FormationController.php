<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Equipement;
use App\Models\Formation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/*
 * Module Formations : CRUD des sessions de formation liées aux équipements
 * du parc, avec gestion des agents participants (inscription, présence,
 * validation, note).
 */
class FormationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Formation::with(['equipement:id_equipement,code_inventaire,designation', 'participants.agent:id_agent,prenom,nom_naiss,matricule']);

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(fn ($sub) => $sub
                ->where('titre', 'like', "%{$q}%")
                ->orWhere('theme', 'like', "%{$q}%")
                ->orWhere('formateur', 'like', "%{$q}%")
                ->orWhere('organisme', 'like', "%{$q}%"));
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->input('statut'));
        }
        if ($request->filled('id_equipement')) {
            $query->where('id_equipement', $request->input('id_equipement'));
        }

        return response()->json($query->orderByDesc('date_debut')->orderByDesc('id_formation')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->valide($request);
        $data['id_utilisateur'] = auth()->user()?->id_utilisateur;

        $formation = Formation::create($data)->load('equipement:id_equipement,code_inventaire,designation');

        $this->logAction('création formation', $formation);

        return response()->json($formation, 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(
            Formation::with(['equipement:id_equipement,code_inventaire,designation', 'participants.agent:id_agent,prenom,nom_naiss,matricule,fonction'])
                ->findOrFail($id),
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $formation = Formation::findOrFail($id);
        $formation->update($this->valide($request));
        $this->logAction('modification formation', $formation);

        return response()->json($formation->fresh(['equipement:id_equipement,code_inventaire,designation', 'participants.agent:id_agent,prenom,nom_naiss,matricule']));
    }

    public function destroy(int $id): JsonResponse
    {
        $formation = Formation::findOrFail($id);
        $formation->delete();
        $this->logAction('suppression formation', $formation);

        return response()->json(['message' => 'Formation supprimée.']);
    }

    /* ---------- Participants ---------- */

    public function ajouterParticipant(Request $request, int $id): JsonResponse
    {
        $formation = Formation::findOrFail($id);
        $data = $request->validate([
            'id_agent' => ['required', 'exists:agents,id_agent'],
            'statut' => ['nullable', Rule::in(['inscrit', 'present', 'absent', 'valide'])],
        ]);

        $participant = $formation->participants()->updateOrCreate(
            ['id_agent' => $data['id_agent']],
            ['statut' => $data['statut'] ?? 'inscrit'],
        );

        return response()->json($participant->load('agent:id_agent,prenom,nom_naiss,matricule'), 201);
    }

    public function retirerParticipant(int $id, int $participant): JsonResponse
    {
        \App\Models\FormationParticipant::where('id_formation', $id)->whereKey($participant)->firstOrFail()->delete();

        return response()->json(['message' => 'Participant retiré.']);
    }

    public function changerStatutParticipant(Request $request, int $id, int $participant): JsonResponse
    {
        $data = $request->validate([
            'statut' => ['required', Rule::in(['inscrit', 'present', 'absent', 'valide'])],
            'note' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'commentaire' => ['nullable', 'string', 'max:1000'],
        ]);

        $p = \App\Models\FormationParticipant::where('id_formation', $id)->whereKey($participant)->firstOrFail();
        $p->update([
            ...$data,
            'date_validation' => $data['statut'] === 'valide' ? now() : null,
        ]);

        return response()->json($p->load('agent:id_agent,prenom,nom_naiss,matricule'));
    }

    /* ---------- Listes de référence pour les modales ---------- */

    public function agentsLeger(): JsonResponse
    {
        return response()->json(Agent::orderBy('prenom')->get(['id_agent', 'prenom', 'nom_naiss', 'matricule']));
    }

    public function equipementsLeger(): JsonResponse
    {
        return response()->json(Equipement::orderBy('code_inventaire')->get(['id_equipement', 'code_inventaire', 'designation']));
    }

    private function valide(Request $request): array
    {
        return $request->validate([
            'titre' => ['required', 'string', 'max:200'],
            'theme' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'formateur' => ['nullable', 'string', 'max:150'],
            'organisme' => ['nullable', 'string', 'max:150'],
            'lieu' => ['nullable', 'string', 'max:150'],
            'modalite' => ['required', Rule::in(['presentiel', 'distanciel', 'hybride'])],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['nullable', 'date', 'after_or_equal:date_debut'],
            'duree_heures' => ['nullable', 'integer', 'min:1', 'max:999'],
            'statut' => ['required', Rule::in(['planifiee', 'en_cours', 'terminee', 'annulee'])],
            'id_equipement' => ['nullable', 'exists:equipements,id_equipement'],
        ]);
    }

    private function logAction(string $action, Formation $formation): void
    {
        try {
            \App\Models\JournalActivite::create([
                'action' => $action,
                'table_concernee' => 'formations',
                'id_element' => $formation->id_formation,
                'adresse_ip' => request()->ip(),
                'id_utilisateur' => auth()->user()?->id_utilisateur,
            ]);
        } catch (\Throwable $e) {
            // journalisation silencieuse
        }
    }
}
