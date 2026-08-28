<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Admission extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'admission_number',
        'patient_id',
        'bed_id',
        'ward_id',
        'admitting_doctor_id',
        'medical_record_id',
        'admitted_at',
        'discharged_at',
        'status',
        'admission_type',
        'diagnosis_on_admission',
        'discharge_summary',
        'discharge_condition',
    ];

    protected function casts(): array
    {
        return [
            'admitted_at' => 'datetime',
            'discharged_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Patient, $this> */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /** @return BelongsTo<Bed, $this> */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    /** @return BelongsTo<Ward, $this> */
    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    /** @return BelongsTo<Doctor, $this> */
    public function admittingDoctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'admitting_doctor_id');
    }

    /** @return BelongsTo<MedicalRecord, $this> */
    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function isAdmitted(): bool
    {
        return $this->status === 'admitted';
    }

    public function getDaysAdmittedAttribute(): int
    {
        $end = $this->discharged_at ?? now();

        return (int) $this->admitted_at->diffInDays($end);
    }
}
