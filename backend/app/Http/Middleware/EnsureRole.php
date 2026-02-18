<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return new JsonResponse(['message' => 'Unauthenticated.'], 401);
        }

        $expectedRoles = collect(explode(',', $roles))
            ->map(fn (string $role) => trim($role))
            ->filter()
            ->values()
            ->all();

        if (! $user->hasAnyRole($expectedRoles)) {
            return new JsonResponse(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
