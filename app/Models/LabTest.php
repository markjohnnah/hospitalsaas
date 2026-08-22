<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabTest extends Model
{
    protected $fillable = [
        'code',
        'name',
        'category',
        'unit',
        'normal_range',
        'price',
        'turnaround_hours',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'turnaround_hours' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /** @return HasMany<LabResult, $this> */
    public function results(): HasMany
    {
        return $this->hasMany(LabResult::class);
    }
}
