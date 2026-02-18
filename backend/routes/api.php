<?php

use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\VocabEntryController;
use App\Http\Controllers\Api\Admin\VocabListController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/google', [AuthController::class, 'googleLogin'])->middleware('throttle:20,1');
    Route::post('/login', [AuthController::class, 'localLogin'])->middleware('throttle:20,1');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function (): void {
    Route::apiResource('users', UserController::class);
    Route::apiResource('vocab-lists', VocabListController::class);
    Route::apiResource('vocab-lists.entries', VocabEntryController::class)->shallow();
});

