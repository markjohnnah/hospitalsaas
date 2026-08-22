<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'scheduled_at' => ['sometimes', 'date', 'after:now'],
            'duration_minutes' => ['nullable', 'integer', 'in:15,30,45,60'],
            'type' => ['sometimes', 'in:in_person,telemedicine'],
            'status' => ['sometimes', 'in:pending,confirmed,completed,cancelled,no_show'],
            'chief_complaint' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'cancellation_reason' => ['required_if:status,cancelled', 'nullable', 'string', 'max:500'],
        ];
    }
}
