<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRadiologyOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'imaging_type_id' => ['required', 'exists:imaging_types,id'],
            'medical_record_id' => ['nullable', 'exists:medical_records,id'],
            'body_part' => ['nullable', 'string', 'max:100'],
            'priority' => ['required', 'in:routine,urgent,stat'],
            'ordered_date' => ['required', 'date'],
            'clinical_indication' => ['nullable', 'string'],
        ];
    }
}
