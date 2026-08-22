<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicalRecordRequest extends FormRequest
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
            'appointment_id' => ['nullable', 'exists:appointments,id'],
            'visit_date' => ['required', 'date'],
            'visit_type' => ['required', 'in:outpatient,inpatient,emergency,follow_up,telemedicine'],
            'chief_complaint' => ['nullable', 'string', 'max:1000'],
            'history_of_present_illness' => ['nullable', 'string'],
            'past_medical_history' => ['nullable', 'string'],
            'physical_examination' => ['nullable', 'string'],
            'assessment' => ['nullable', 'string'],
            'plan' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'in:draft,finalized'],
            'vitals' => ['nullable', 'array'],
            'vitals.temperature' => ['nullable', 'numeric', 'between:30,45'],
            'vitals.pulse_rate' => ['nullable', 'integer', 'between:20,300'],
            'vitals.respiratory_rate' => ['nullable', 'integer', 'between:5,60'],
            'vitals.systolic_bp' => ['nullable', 'integer', 'between:50,300'],
            'vitals.diastolic_bp' => ['nullable', 'integer', 'between:20,200'],
            'vitals.oxygen_saturation' => ['nullable', 'numeric', 'between:50,100'],
            'vitals.weight' => ['nullable', 'numeric', 'between:0.5,300'],
            'vitals.height' => ['nullable', 'numeric', 'between:10,250'],
            'vitals.blood_glucose' => ['nullable', 'integer', 'between:20,600'],
            'vitals.notes' => ['nullable', 'string'],
            'diagnoses' => ['nullable', 'array'],
            'diagnoses.*.diagnosis_name' => ['required_with:diagnoses', 'string', 'max:255'],
            'diagnoses.*.icd10_code' => ['nullable', 'string', 'max:20'],
            'diagnoses.*.type' => ['nullable', 'in:primary,secondary,differential'],
            'diagnoses.*.notes' => ['nullable', 'string'],
        ];
    }
}
