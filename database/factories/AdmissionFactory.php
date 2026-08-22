<?php

namespace Database\Factories;

use App\Models\Bed;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Ward;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdmissionFactory extends Factory
{
    private static int $sequence = 0;

    public function definition(): array
    {
        self::$sequence++;
        $ward = Ward::factory()->create();
        $bed = Bed::factory()->for($ward)->create();

        return [
            'admission_number' => 'ADM-' . date('Y') . '-' . str_pad((string) self::$sequence, 5, '0', STR_PAD_LEFT),
            'patient_id' => Patient::factory(),
            'bed_id' => $bed->id,
            'ward_id' => $ward->id,
            'admitting_doctor_id' => Doctor::factory(),
            'medical_record_id' => null,
            'admitted_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'status' => 'admitted',
            'admission_type' => $this->faker->randomElement(['emergency', 'elective', 'transfer']),
            'diagnosis_on_admission' => $this->faker->sentence(),
        ];
    }
}
