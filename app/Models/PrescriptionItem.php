<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class PrescriptionItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'prescription_id',
        'medication_name',
        'generic_name',
        'dosage',
        'frequency',
        'route',
        'duration_days',
        'quantity',
        'instructions',
    ];

    protected function casts(): array
    {
        return [
            'duration_days' => 'integer',
            'quantity' => 'integer',
        ];
    }

    /** @return BelongsTo<Prescription, $this> */
    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }
}
