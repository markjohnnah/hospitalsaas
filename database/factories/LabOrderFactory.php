<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class LabOrderFactory extends Factory
{
    private static int $sequence = 0;

    public function definition(): array
    {
        self::$sequence++;

        return [
            'order_number' => 'LAB-' . date('Ymd') . '-' . str_pad((string) self::$sequence, 4, '0', STR_PAD_LEFT),
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'medical_record_id' => null,
            'priority' => $this->faker->randomElement(['routine', 'urgent', 'stat']),
            'status' => 'ordered',
            'ordered_date' => $this->faker->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'clinical_notes' => $this->faker->optional()->sentence(),
        ];
    }
}
