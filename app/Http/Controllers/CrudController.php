<?php

namespace App\Http\Controllers;

use App\Models\JournalActivite;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;

abstract class CrudController extends Controller
{
    use AuthorizesRequests;

    abstract protected function model(): string;

    abstract protected function rules(): array;

    abstract protected function label(): string;

    protected function withRelations(): array
    {
        return [];
    }

    protected function beforeSave(array $data, ?Model $existing = null): array
    {
        return $data;
    }

    public function index(Request $request): JsonResponse
    {
        $query = $this->model()::query()->with($this->withRelations());

        if ($request->filled('q') && method_exists($this, 'searchFields')) {
            $q = $request->string('q');
            $query->where(function ($sub) use ($q) {
                foreach ($this->searchFields() as $field) {
                    $sub->orWhere($field, 'like', "%{$q}%");
                }
            });
        }

        if ($request->filled('per_page')) {
            $items = $query->orderByDesc($this->model()::query()->getModel()->getKeyName())
                ->paginate(min((int) $request->input('per_page'), 100));

            return response()->json($items);
        }

        return response()->json($query->orderBy($this->model()::query()->getModel()->getKeyName())->get());
    }

    public function show(int $id): JsonResponse
    {
        $item = $this->model()::query()->with($this->withRelations())->findOrFail($id);

        return response()->json($item);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->beforeSave($request->validate($this->rules()));

        $item = $this->model()::create($data);

        $this->logAction('création', $item);

        return response()->json($item->load($this->withRelations()), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $item = $this->model()::findOrFail($id);

        $data = $this->beforeSave($request->validate($this->rules()), $item);

        $item->update($data);

        $this->logAction('modification', $item);

        return response()->json($item->load($this->withRelations()));
    }

    public function destroy(int $id): JsonResponse
    {
        $item = $this->model()::findOrFail($id);
        $item->delete();

        $this->logAction('suppression', $item);

        return response()->json(['message' => ucfirst($this->label()).' supprimé(e)']);
    }

    protected function logAction(string $action, Model $item): void
    {
        $user = auth()->user();

        JournalActivite::create([
            'action' => $action.' '.$this->label(),
            'table_concernee' => $item->getTable(),
            'id_element' => $item->getKey(),
            'nouvelles_valeurs' => json_encode($item->getAttributes()),
            'adresse_ip' => request()->ip(),
            'id_utilisateur' => $user?->id_utilisateur,
        ]);
    }
}
