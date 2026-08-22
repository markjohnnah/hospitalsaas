<?php

namespace Database\Factories;

use App\Models\Ward;
use Illuminate\Database\Eloquent\Factories\Factory;

class BedFactory extends Factory
{
    private static int $sequence = 0;

    public function definition(): array
    {
        self::$sequence++;

        return [
            'bed_number' => 'B-' . str_pad((string) self::$sequence, 3, '0', STR_PAD_LEFT),
            'ward_id' => Ward::factory(),
            'type' => 'standard',
            'status' => 'available',
            'is_active' => true,
        ];
    }
}
