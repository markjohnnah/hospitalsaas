<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'id' => (string) Str::uuid(),
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'price_monthly' => fake()->randomElement([0, 9900, 19900, 49900, 99900, 199900]),
            'price_yearly' => fake()->randomElement([0, 99000, 199000, 499000, 999000, 1999000]),
            'max_users' => fake()->optional(0.7)->numberBetween(5, 500),
            'max_patients' => fake()->optional(0.7)->numberBetween(100, 10000),
            'features' => fake()->randomElements(
                ['emr', 'appointments', 'patients', 'pharmacy', 'doctors', 'lab', 'radiology', 'inpatient', 'billing', 'hr', 'inventory', 'multi_branch'],
                fake()->numberBetween(2, 8)
            ),
            'sort_order' => fake()->numberBetween(1, 10),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'price_monthly' => 0,
            'price_yearly' => 0,
        ]);
    }

    public function enterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_users' => null,
            'max_patients' => null,
            'price_monthly' => 249900,
            'price_yearly' => 2499000,
        ]);
    }
}
