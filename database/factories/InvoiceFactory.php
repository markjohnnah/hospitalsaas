<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    private static int $counter = 0;

    public function definition(): array
    {
        self::$counter++;
        $subtotal = fake()->numberBetween(10000, 500000);
        $tax = (int) ($subtotal * 0.16);
        $issuedAt = fake()->dateTimeBetween('-6 months', 'now');

        return [
            'id' => (string) Str::uuid(),
            'tenant_id' => Tenant::factory(),
            'number' => sprintf('INV-%s-%04d', date('Y'), self::$counter),
            'status' => InvoiceStatus::Draft,
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'total' => $subtotal + $tax,
            'issued_at' => $issuedAt,
            'due_at' => (clone $issuedAt)->modify('+30 days'),
            'paid_at' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvoiceStatus::Draft,
            'paid_at' => null,
        ]);
    }

    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvoiceStatus::Sent,
            'paid_at' => null,
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvoiceStatus::Paid,
            'paid_at' => $attributes['due_at'] ?? now(),
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvoiceStatus::Overdue,
            'due_at' => now()->subDays(fake()->numberBetween(1, 60)),
            'paid_at' => null,
        ]);
    }

    public function canceled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvoiceStatus::Canceled,
            'paid_at' => null,
        ]);
    }

    public function forTenant(string $tenantId): static
    {
        return $this->state(fn (array $attributes) => [
            'tenant_id' => $tenantId,
        ]);
    }
}
