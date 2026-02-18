<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VocabEntry;
use App\Models\VocabList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VocabEntryController extends Controller
{
    public function index(VocabList $vocab_list): JsonResponse
    {
        return response()->json([
            'data' => $vocab_list->entries()->with('translations')->get(),
        ]);
    }

    public function store(Request $request, VocabList $vocab_list): JsonResponse
    {
        $data = $this->validatePayload($request);

        $entry = DB::transaction(function () use ($data, $vocab_list) {
            $entry = $vocab_list->entries()->create([
                'source_text' => $data['source_text'],
                'position' => $data['position'] ?? 0,
            ]);

            $this->syncTranslations($entry, $data['translations'] ?? []);

            return $entry;
        });

        return response()->json([
            'data' => $entry->load('translations'),
        ], 201);
    }

    public function show(VocabEntry $entry): JsonResponse
    {
        return response()->json([
            'data' => $entry->load('translations', 'vocabList'),
        ]);
    }

    public function update(Request $request, VocabEntry $entry): JsonResponse
    {
        $data = $this->validatePayload($request, true);

        DB::transaction(function () use ($data, $entry) {
            $entry->fill([
                'source_text' => $data['source_text'] ?? $entry->source_text,
                'position' => $data['position'] ?? $entry->position,
            ])->save();

            if (array_key_exists('translations', $data)) {
                $this->syncTranslations($entry, $data['translations']);
            }
        });

        return response()->json([
            'data' => $entry->load('translations', 'vocabList'),
        ]);
    }

    public function destroy(VocabEntry $entry): JsonResponse
    {
        $entry->delete();

        return response()->json([], 204);
    }

    private function validatePayload(Request $request, bool $partial = false): array
    {
        $baseRules = [
            'source_text' => [$partial ? 'sometimes' : 'required', 'string', 'max:160'],
            'position' => ['sometimes', 'integer', 'min:0'],
            'translations' => ['sometimes', 'array'],
            'translations.*.language_code' => ['required_with:translations', 'string', 'size:2'],
            'translations.*.translated_text' => ['required_with:translations', 'string', 'max:160'],
        ];

        return $request->validate($baseRules);
    }

    /**
     * @param array<int, array{language_code: string, translated_text: string}> $translations
     */
    private function syncTranslations(VocabEntry $entry, array $translations): void
    {
        $payload = collect($translations)
            ->map(fn (array $row) => [
                'language_code' => Str::lower(trim($row['language_code'] ?? '')),
                'translated_text' => trim($row['translated_text'] ?? ''),
            ])
            ->filter(fn (array $row) => $row['language_code'] !== '' && $row['translated_text'] !== '')
            ->values();

        $entry->translations()->delete();

        if ($payload->isNotEmpty()) {
            $entry->translations()->createMany($payload->all());
        }
    }
}
