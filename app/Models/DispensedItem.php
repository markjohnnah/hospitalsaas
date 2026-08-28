<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class DispensedItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'dispensing_record_id',
        'medication_id',
        'quantity_dispensed',
        'unit_price',
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'quantity_dispensed' => 'integer',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<DispensingRecord, $this> */
    public function dispensingRecord(): BelongsTo
    {
        return $this->belongsTo(DispensingRecord::class);
    }

    /** @return BelongsTo<Medication, $this> */
    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class);
    }
}
