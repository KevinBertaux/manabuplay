<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => User::query()
                ->with(['roles', 'guardian'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:10'],
            'role' => ['required', 'string', Rule::in(['admin', 'adult', 'child'])],
            'is_active' => ['sometimes', 'boolean'],
            'guardian_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        if ($data['role'] === 'child' && empty($data['guardian_user_id'])) {
            return response()->json([
                'message' => 'A child account must have a guardian_user_id.',
            ], 422);
        }

        Role::ensureDefaults();

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password'] ?? bin2hex(random_bytes(20))),
            'auth_provider' => 'local',
            'is_active' => $data['is_active'] ?? true,
            'guardian_user_id' => $data['guardian_user_id'] ?? null,
        ]);

        $user->syncRoles([$data['role']]);

        return response()->json([
            'data' => $user->load('roles', 'guardian'),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => $user->load('roles', 'guardian', 'children'),
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:10'],
            'role' => ['sometimes', 'required', 'string', Rule::in(['admin', 'adult', 'child'])],
            'is_active' => ['sometimes', 'boolean'],
            'guardian_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        if (($data['role'] ?? null) === 'child' && array_key_exists('guardian_user_id', $data) && empty($data['guardian_user_id'])) {
            return response()->json([
                'message' => 'A child account must have a guardian_user_id.',
            ], 422);
        }

        if (array_key_exists('password', $data) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->fill($data)->save();

        if (array_key_exists('role', $data)) {
            Role::ensureDefaults();
            $user->syncRoles([$data['role']]);
        }

        return response()->json([
            'data' => $user->load('roles', 'guardian', 'children'),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        /** @var User $authUser */
        $authUser = $request->user();

        if ($authUser->id === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $user->delete();

        return response()->json([], 204);
    }
}
