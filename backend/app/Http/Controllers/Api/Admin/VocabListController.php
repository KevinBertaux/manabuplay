<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VocabList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class VocabListController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => VocabList::query()
                ->withCount('entries')
                ->orderBy('title')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', 'alpha_dash', Rule::unique('vocab_lists', 'slug')],
            'description' => ['nullable', 'string', 'max:1000'],
            'source_language_code' => ['required', 'string', 'size:2'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $slug = $data['slug'] ?? Str::slug($data['title']);

        $vocabList = VocabList::query()->create([
            'title' => $data['title'],
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'source_language_code' => Str::lower($data['source_language_code']),
            'is_active' => $data['is_active'] ?? true,
            'created_by_user_id' => $request->user()?->id,
        ]);

        return response()->json([
            'data' => $vocabList,
        ], 201);
    }

    public function show(VocabList $vocab_list): JsonResponse
    {
        return response()->json([
            'data' => $vocab_list->load(['entries.translations']),
        ]);
    }

    public function update(Request $request, VocabList $vocab_list): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:120'],
            'slug' => ['sometimes', 'required', 'string', 'max:120', 'alpha_dash', Rule::unique('vocab_lists', 'slug')->ignore($vocab_list->id)],
            'description' => ['nullable', 'string', 'max:1000'],
            'source_language_code' => ['sometimes', 'required', 'string', 'size:2'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (isset($data['source_language_code'])) {
            $data['source_language_code'] = Str::lower($data['source_language_code']);
        }

        $vocab_list->fill($data)->save();

        return response()->json([
            'data' => $vocab_list,
        ]);
    }

    public function destroy(VocabList $vocab_list): JsonResponse
    {
        $vocab_list->delete();

        return response()->json([], 204);
    }
}
