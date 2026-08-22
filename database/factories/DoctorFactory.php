<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Doctor>
 */
class DoctorFactory extends Factory
{
    protected $model = Doctor::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'license_number' => 'LIC-' . strtoupper($this->faker->unique()->bothify('???####')),
            'consultation_fee' => $this->faker->randomFloat(2, 500, 5000),
            'bio' => $this->faker->paragraph(),
            'qualification' => $this->faker->randomElement(['MBChB', 'MBBS', 'MD', 'MBChB, MMed']),
            'experience_years' => $this->faker->numberBetween(1, 30),
            'is_available' => true,
        ];
    }
}

