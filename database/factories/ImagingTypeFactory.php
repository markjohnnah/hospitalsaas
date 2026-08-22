<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ImagingTypeFactory extends Factory
{
    private static int $sequence = 0;

    public function definition(): array
    {
        self::$sequence++;

        return [
            'code' => 'IMG-' . str_pad((string) self::$sequence, 3, '0', STR_PAD_LEFT),
            'name' => $this->faker->randomElement(['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'PET Scan']) . ' ' . self::$sequence,
            'description' => $this->faker->optional()->sentence(),
            'price' => $this->faker->randomFloat(2, 50, 500),
            'is_active' => true,
        ];
    }
}
