<?php

namespace App\Models;

use Database\Factories\PatientDocumentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class PatientDocument extends Model
{
    /** @use HasFactory<PatientDocumentFactory> */
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'patient_id',
        'document_type',
        'file_path',
        'file_name',
        'description',
        'uploaded_by',
    ];

    /** @return BelongsTo<Patient, $this> */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /** @return BelongsTo<User, $this> */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
