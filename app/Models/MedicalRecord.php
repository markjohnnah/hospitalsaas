<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicalRecord extends Model
{
    /** @use HasFactory<\Database\Factories\MedicalRecordFactory> */
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'record_number',
        'patient_id',
        'appointment_id',
        'doctor_id',
        'visit_date',
        'visit_type',
        'chief_complaint',
        'history_of_present_illness',
        'past_medical_history',
        'physical_examination',
        'assessment',
        'plan',
        'notes',
        'status',
        'finalized_at',
    ];

    protected function casts(): array
    {
        return [
            'visit_date' => 'date',
            'finalized_at' => 'datetime',
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

    /** @return BelongsTo<Appointment, $this> */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    /** @return HasOne<Vitals, $this> */
    public function vitals(): HasOne
    {
        return $this->hasOne(Vitals::class);
    }

    /** @return HasMany<Diagnosis, $this> */
    public function diagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class);
    }

    /** @return HasMany<Prescription, $this> */
    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    /** @return HasMany<LabOrder, $this> */
    public function labOrders(): HasMany
    {
        return $this->hasMany(LabOrder::class);
    }

    /** @return HasMany<RadiologyOrder, $this> */
    public function radiologyOrders(): HasMany
    {
        return $this->hasMany(RadiologyOrder::class);
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isFinalized(): bool
    {
        return $this->status === 'finalized';
    }
}
