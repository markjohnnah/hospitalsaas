<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\ImagingType;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class RadiologyOrderFactory extends Factory
{
    private static int $sequence = 0;

    public function definition(): array
    {
        self::$sequence++;

        return [
            'order_number' => 'RAD-' . date('Ymd') . '-' . str_pad((string) self::$sequence, 4, '0', STR_PAD_LEFT),
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'imaging_type_id' => ImagingType::factory(),
            'medical_record_id' => null,
            'body_part' => $this->faker->randomElement(['Chest', 'Abdomen', 'Head', 'Spine', 'Pelvis']),
            'priority' => 'routine',
            'status' => 'ordered',
            'ordered_date' => $this->faker->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'clinical_indication' => $this->faker->optional()->sentence(),
        ];
    }
}
