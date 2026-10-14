<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $field = filter_var($credentials['email'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = Utilisateur::with('agent.service', 'roles')
            ->where($field, $credentials['email'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Identifiants incorrects.',
            ]);
        }

        if (! $user->actif) {
            throw ValidationException::withMessages([
                'email' => 'Ce compte est désactivé. Contactez le SIT.',
            ]);
        }

        $user->forceFill(['dernier_connexion' => now()])->save();

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json(
            $request->user()->load('agent.service.direction', 'roles')
        );
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté']);
    }

    /**
     * Modification de son propre profil : identifiants (username / e-mail)
     * et/ou mot de passe (qui exige le mot de passe actuel en garantie).
     */
    public function updateProfil(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'username' => ['nullable', 'string', 'max:60', Rule::unique('utilisateurs', 'username')->ignore($user->id_utilisateur, 'id_utilisateur')],
            'email' => ['nullable', 'email', 'max:150', Rule::unique('utilisateurs', 'email')->ignore($user->id_utilisateur, 'id_utilisateur')],
            'mot_de_passe_actuel' => ['nullable', 'required_with:mot_de_passe', 'string'],
            'mot_de_passe' => ['nullable', 'min:8', 'confirmed'],
        ]);

        // Changement de mot de passe : l'actuel doit être correct.
        if (! empty($data['mot_de_passe'])) {
            if (! Hash::check($data['mot_de_passe_actuel'] ?? '', $user->password)) {
                throw ValidationException::withMessages([
                    'mot_de_passe_actuel' => ['Le mot de passe actuel est incorrect.'],
                ]);
            }
            $user->password = $data['mot_de_passe'];
        }

        if (isset($data['username'])) {
            $user->username = $data['username'];
        }
        if (isset($data['email'])) {
            $user->email = $data['email'];
        }
        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour.',
            'user' => $user->fresh()->load('agent.service.direction', 'roles'),
        ]);
    }
}
