<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class MedicalRecordFactory extends Factory
{
    private static int $sequence = 0;

    public function definition(): array
    {
        self::$sequence++;

        return [
            'record_number' => 'REC-' . date('Y') . '-' . str_pad((string) self::$sequence, 5, '0', STR_PAD_LEFT),
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'appointment_id' => null,
            'visit_date' => $this->faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'visit_type' => $this->faker->randomElement(['outpatient', 'inpatient', 'emergency', 'follow_up']),
            'chief_complaint' => $this->faker->sentence(),
            'history_of_present_illness' => $this->faker->paragraph(),
            'assessment' => $this->faker->paragraph(),
            'plan' => $this->faker->paragraph(),
            'status' => 'draft',
        ];
    }
}
