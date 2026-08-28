<?php

namespace App\Models;

use Database\Factories\PatientChronicDiseaseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class PatientChronicDisease extends Model
{
    /** @use HasFactory<PatientChronicDiseaseFactory> */
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'patient_id',
        'condition_name',
        'icd10_code',
        'diagnosed_at',
        'managing_doctor',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'diagnosed_at' => 'date',
        ];
    }

    /** @return BelongsTo<Patient, $this> */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
