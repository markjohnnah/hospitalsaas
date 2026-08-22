<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'bed_id' => ['required', 'exists:beds,id'],
            'ward_id' => ['required', 'exists:wards,id'],
            'admitting_doctor_id' => ['required', 'exists:doctors,id'],
            'medical_record_id' => ['nullable', 'exists:medical_records,id'],
            'admitted_at' => ['required', 'date'],
            'admission_type' => ['required', 'in:emergency,elective,transfer'],
            'diagnosis_on_admission' => ['nullable', 'string'],
        ];
    }
}
