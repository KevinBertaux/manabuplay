<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VocabEntryTranslation extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'vocab_entry_id',
        'language_code',
        'translated_text',
    ];

    public function vocabEntry(): BelongsTo
    {
        return $this->belongsTo(VocabEntry::class);
    }
}
