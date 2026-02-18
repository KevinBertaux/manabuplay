<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    public const DEFAULTS = [
        'admin' => 'Administrateur',
        'adult' => 'Adulte',
        'child' => 'Enfant',
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'label',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles')->withTimestamps();
    }

    public static function ensureDefaults(): void
    {
        foreach (self::DEFAULTS as $name => $label) {
            self::query()->firstOrCreate(
                ['name' => $name],
                ['label' => $label],
            );
        }
    }
}
