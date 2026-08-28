<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Ward extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'name',
        'code',
        'department_id',
        'type',
        'total_beds',
        'floor',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'total_beds' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Department, $this> */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /** @return HasMany<Bed, $this> */
    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }

    /** @return HasMany<Bed, $this> */
    public function availableBeds(): HasMany
    {
        return $this->hasMany(Bed::class)->where('status', 'available')->where('is_active', true);
    }

    /** @return HasMany<Admission, $this> */
    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class);
    }
}
