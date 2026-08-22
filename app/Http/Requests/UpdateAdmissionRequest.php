<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:admitted,discharged,transferred'],
            'discharged_at' => ['nullable', 'date'],
            'discharge_summary' => ['nullable', 'string'],
            'discharge_condition' => ['nullable', 'in:improved,recovered,referred,against_advice,deceased'],
        ];
    }
}
