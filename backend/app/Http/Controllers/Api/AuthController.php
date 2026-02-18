<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Google\Client as GoogleClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function googleLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_token' => ['required', 'string'],
        ]);

        $clientId = (string) config('services.google.client_id');

        if ($clientId === '') {
            return response()->json([
                'message' => 'Google OAuth is not configured on the server.',
            ], 500);
        }

        $googleClient = new GoogleClient(['client_id' => $clientId]);
        $payload = $googleClient->verifyIdToken($validated['id_token']);

        if (! $payload || empty($payload['email']) || ! ($payload['email_verified'] ?? false)) {
            return response()->json([
                'message' => 'Invalid Google token.',
            ], 422);
        }

        Role::ensureDefaults();

        $email = Str::lower((string) $payload['email']);
        $name = (string) ($payload['name'] ?? Str::before($email, '@'));
        $googleSub = (string) ($payload['sub'] ?? '');
        $isAdmin = in_array($email, $this->adminEmails(), true);

        /** @var User $user */
        $user = DB::transaction(function () use ($email, $name, $googleSub, $isAdmin) {
            $user = User::query()->firstOrNew(['email' => $email]);
            $user->name = $name;
            $user->auth_provider = 'google';
            $user->google_sub = $googleSub;
            $user->is_active = true;

            if (! $user->exists) {
                // A random local password is kept to satisfy non-null DB constraints.
                $user->password = Str::random(40);
            }

            if (! $user->email_verified_at) {
                $user->email_verified_at = now();
            }

            $user->save();
            $user->syncRoles([$isAdmin ? 'admin' : 'adult']);

            return $user;
        });

        return $this->issueTokenResponse($user);
    }

    public function localLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = Str::lower($validated['email']);
        $user = User::query()->where('email', $email)->first();

        if (! $user || ! $user->is_active || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 422);
        }

        return $this->issueTokenResponse($user);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        return response()->json([
            'user' => $user?->load('roles', 'guardian'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    private function issueTokenResponse(User $user): JsonResponse
    {
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('roles'),
        ]);
    }

    /**
     * @return list<string>
     */
    private function adminEmails(): array
    {
        return collect(explode(',', (string) env('ADMIN_GOOGLE_EMAILS', '')))
            ->map(fn (string $email) => Str::lower(trim($email)))
            ->filter()
            ->values()
            ->all();
    }
}
