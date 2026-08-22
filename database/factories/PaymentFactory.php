<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'invoice_id' => Invoice::factory(),
            'tenant_id' => fn (array $attributes) => Invoice::find($attributes['invoice_id'])->tenant_id,
            'amount' => fake()->numberBetween(5000, 100000),
            'method' => fake()->randomElement(['bank_transfer', 'cash', 'check', 'other']),
            'reference' => fake()->optional()->bothify('PAY-####-????'),
            'paid_at' => fake()->dateTimeBetween('-3 months', 'now'),
            'notes' => fake()->optional()->sentence(),
            'recorded_by' => User::factory(),
        ];
    }

    public function bankTransfer(): static
    {
        return $this->state(fn (array $attributes) => [
            'method' => 'bank_transfer',
            'reference' => 'BANK-' . fake()->numerify('########'),
        ]);
    }

    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'method' => 'cash',
            'reference' => null,
        ]);
    }

    public function forInvoice(string $invoiceId): static
    {
        return $this->state(fn (array $attributes) => [
            'invoice_id' => $invoiceId,
            'tenant_id' => Invoice::find($invoiceId)->tenant_id,
        ]);
    }

    public function amount(int $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $amount,
        ]);
    }
}
