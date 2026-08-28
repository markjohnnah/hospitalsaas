<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class RadiologyOrder extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'order_number',
        'patient_id',
        'doctor_id',
        'imaging_type_id',
        'medical_record_id',
        'body_part',
        'priority',
        'status',
        'ordered_date',
        'scheduled_at',
        'completed_at',
        'clinical_indication',
        'report',
        'images_path',
    ];

    protected function casts(): array
    {
        return [
            'ordered_date' => 'date',
            'scheduled_at' => 'datetime',
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

    /** @return BelongsTo<ImagingType, $this> */
    public function imagingType(): BelongsTo
    {
        return $this->belongsTo(ImagingType::class);
    }

    /** @return BelongsTo<MedicalRecord, $this> */
    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
