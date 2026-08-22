<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRadiologyOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:ordered,scheduled,in_progress,completed,cancelled'],
            'scheduled_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date'],
            'report' => ['nullable', 'string'],
        ];
    }
}
