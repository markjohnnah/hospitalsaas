<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class DispensingRecord extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'dispensing_number',
        'prescription_id',
        'patient_id',
        'dispensed_by',
        'dispensed_at',
        'total_amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'dispensed_at' => 'datetime',
            'total_amount' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Prescription, $this> */
    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    /** @return BelongsTo<Patient, $this> */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /** @return BelongsTo<User, $this> */
    public function dispensedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dispensed_by');
    }

    /** @return HasMany<DispensedItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(DispensedItem::class);
    }
}
