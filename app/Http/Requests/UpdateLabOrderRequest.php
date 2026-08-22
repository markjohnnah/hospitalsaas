<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLabOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:ordered,sample_collected,processing,completed,cancelled'],
            'sample_collected_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date'],
            'results' => ['nullable', 'array'],
            'results.*.lab_result_id' => ['nullable', 'exists:lab_results,id'],
            'results.*.result_value' => ['nullable', 'string'],
            'results.*.flag' => ['nullable', 'in:normal,low,high,critical_low,critical_high'],
            'results.*.notes' => ['nullable', 'string'],
        ];
    }
}
