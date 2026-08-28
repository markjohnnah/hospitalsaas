<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class LabOrder extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'order_number',
        'patient_id',
        'doctor_id',
        'medical_record_id',
        'priority',
        'status',
        'ordered_date',
        'sample_collected_at',
        'completed_at',
        'clinical_notes',
    ];

    protected function casts(): array
    {
        return [
            'ordered_date' => 'date',
            'sample_collected_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Patient, $this> */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /** @return BelongsTo<Doctor, $this> */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /** @return BelongsTo<MedicalRecord, $this> */
    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    /** @return HasMany<LabResult, $this> */
    public function results(): HasMany
    {
        return $this->hasMany(LabResult::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
