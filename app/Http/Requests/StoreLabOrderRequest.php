<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLabOrderRequest extends FormRequest
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
            'medical_record_id' => ['nullable', 'exists:medical_records,id'],
            'priority' => ['required', 'in:routine,urgent,stat'],
            'ordered_date' => ['required', 'date'],
            'clinical_notes' => ['nullable', 'string'],
            'tests' => ['required', 'array', 'min:1'],
            'tests.*' => ['required', 'exists:lab_tests,id'],
        ];
    }
}
