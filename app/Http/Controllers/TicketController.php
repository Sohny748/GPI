<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketCommentaire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TicketController extends CrudController
{
    protected function model(): string
    {
        return Ticket::class;
    }

    protected function label(): string
    {
        return 'ticket';
    }

    protected function withRelations(): array
    {
        return ['equipement.modele', 'agent', 'commentaires.utilisateur'];
    }

    protected function rules(): array
    {
        return [
            'titre' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'priorite' => ['required', Rule::in(['basse', 'moyenne', 'haute', 'critique'])],
            'statut' => ['sometimes', Rule::in(['ouvert', 'en_cours', 'resolu', 'ferme'])],
            'id_equipement' => ['nullable', 'exists:equipements,id_equipement'],
            'id_agent' => ['nullable', 'exists:agents,id_agent'],
        ];
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $data['reference_ticket'] = 'TCK-'.date('Y').'-'.str_pad(Ticket::count() + 1, 3, '0', STR_PAD_LEFT);
        $data['date_creation'] = today();

        $ticket = Ticket::create($data);
        $this->logAction('création', $ticket);

        return response()->json($ticket->load($this->withRelations()), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $data = $request->validate($this->rules());

        if (($data['statut'] ?? null) && in_array($data['statut'], ['resolu', 'ferme']) && ! $ticket->date_cloture) {
            $data['date_cloture'] = today();
        }

        $ticket->update($data);
        $this->logAction('modification', $ticket);

        return response()->json($ticket->load($this->withRelations()));
    }

    public function comment(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['contenu' => ['required', 'string', 'max:2000']]);

        $commentaire = TicketCommentaire::create([
            'contenu' => $data['contenu'],
            'date_commentaire' => now(),
            'id_ticket' => $id,
            'id_utilisateur' => auth()->id(),
        ]);

        return response()->json($commentaire->load('utilisateur'), 201);
    }
}
