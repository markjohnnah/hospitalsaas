<?php

namespace Database\Factories;

use App\Models\Appointment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    public function definition(): array
    {
        return [
            'appointment_number' => 'APT-'.strtoupper($this->faker->unique()->bothify('#######')),
            'scheduled_at' => $this->faker->dateTimeBetween('now', '+30 days'),
            'duration_minutes' => $this->faker->randomElement([15, 30, 45, 60]),
            'type' => $this->faker->randomElement(['in_person', 'telemedicine']),
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'completed', 'cancelled']),
            'chief_complaint' => $this->faker->sentence(),
            'notes' => $this->faker->optional(0.5)->paragraph(),
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending']);
    }

    public function confirmed(): static
    {
        return $this->state(['status' => 'confirmed']);
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed', 'scheduled_at' => $this->faker->dateTimeBetween('-30 days', 'now')]);
    }
}
