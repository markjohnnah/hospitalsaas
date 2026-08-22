<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\SubscriptionStatus;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Tenant>
 */
class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'id' => (string) Str::uuid(),
            'name' => $name . ' Hospital',
            'slug' => Str::slug($name),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->unique()->companyEmail(),
            'website' => fake()->optional()->url(),
            'logo' => null,
            'is_active' => true,
            'plan_id' => null,
            'subscription_status' => SubscriptionStatus::Trialing,
            'trial_ends_at' => now()->addDays(14),
            'subscribed_at' => now(),
            'subscription_ends_at' => null,
        ];
    }

    public function withPlan(?Plan $plan = null): static
    {
        return $this->state(fn (array $attributes) => [
            'plan_id' => $plan?->id ?? Plan::factory()->create()->id,
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => SubscriptionStatus::Active,
            'trial_ends_at' => null,
            'subscribed_at' => now(),
        ]);
    }

    public function trialing(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => SubscriptionStatus::Trialing,
            'trial_ends_at' => now()->addDays(14),
        ]);
    }

    public function pastDue(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => SubscriptionStatus::PastDue,
        ]);
    }

    public function canceled(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => SubscriptionStatus::Canceled,
            'subscription_ends_at' => now()->addMonth(),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => SubscriptionStatus::Expired,
            'subscription_ends_at' => now()->subDay(),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
