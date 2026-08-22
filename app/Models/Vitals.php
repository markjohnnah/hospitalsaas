<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vitals extends Model
{
    protected $fillable = [
        'medical_record_id',
        'patient_id',
        'temperature',
        'pulse_rate',
        'respiratory_rate',
        'systolic_bp',
        'diastolic_bp',
        'oxygen_saturation',
        'weight',
        'height',
        'bmi',
        'blood_glucose',
        'notes',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'temperature' => 'decimal:2',
            'oxygen_saturation' => 'decimal:2',
            'weight' => 'decimal:2',
            'height' => 'decimal:2',
            'bmi' => 'decimal:2',
            'recorded_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<MedicalRecord, $this> */
    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    /** @return BelongsTo<Patient, $this> */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
