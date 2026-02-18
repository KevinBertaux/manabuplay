<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VocabEntry extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'vocab_list_id',
        'source_text',
        'position',
    ];

    public function vocabList(): BelongsTo
    {
        return $this->belongsTo(VocabList::class);
    }

    public function translations(): HasMany
    {
        return $this->hasMany(VocabEntryTranslation::class);
    }
}
