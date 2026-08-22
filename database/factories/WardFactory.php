<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class WardFactory extends Factory
{
    private static int $sequence = 0;

    public function definition(): array
    {
        self::$sequence++;

        return [
            'name' => $this->faker->randomElement(['General Ward', 'ICU', 'Pediatric Ward', 'Surgical Ward']) . ' ' . self::$sequence,
            'code' => 'WRD-' . str_pad((string) self::$sequence, 3, '0', STR_PAD_LEFT),
            'department_id' => null,
            'type' => $this->faker->randomElement(['general', 'private', 'icu', 'maternity', 'pediatric', 'surgical']),
            'total_beds' => $this->faker->numberBetween(10, 50),
            'floor' => $this->faker->randomElement(['1st', '2nd', '3rd', '4th']),
            'is_active' => true,
        ];
    }
}
