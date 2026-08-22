<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicalRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'visit_date' => ['required', 'date'],
            'visit_type' => ['required', 'in:outpatient,inpatient,emergency,follow_up,telemedicine'],
            'chief_complaint' => ['nullable', 'string', 'max:1000'],
            'history_of_present_illness' => ['nullable', 'string'],
            'past_medical_history' => ['nullable', 'string'],
            'physical_examination' => ['nullable', 'string'],
            'assessment' => ['nullable', 'string'],
            'plan' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'in:draft,finalized,amended'],
        ];
    }
}
