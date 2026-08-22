<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            // User account fields
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            // Doctor profile fields
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'specialization_id' => ['nullable', 'integer', 'exists:specializations,id'],
            'license_number' => ['nullable', 'string', 'max:50', 'unique:doctors,license_number'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'qualification' => ['nullable', 'string', 'max:200'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:60'],
            // Schedule
            'schedules' => ['nullable', 'array'],
            'schedules.*.day_of_week' => ['required_with:schedules', 'integer', 'between:0,6'],
            'schedules.*.start_time' => ['required_with:schedules', 'date_format:H:i'],
            'schedules.*.end_time' => ['required_with:schedules', 'date_format:H:i', 'after:schedules.*.start_time'],
            'schedules.*.slot_duration_minutes' => ['nullable', 'integer', 'in:15,30,45,60'],
        ];
    }
}
