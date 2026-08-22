<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\InvoiceStatus;
use App\Enums\Role;
use App\Enums\SubscriptionStatus;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoBillingSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding demo billing data...');

        // Ensure plans exist
        $freeTrial = Plan::where('slug', 'free-trial')->first();
        $starter = Plan::where('slug', 'starter')->first();
        $professional = Plan::where('slug', 'professional')->first();
        $enterprise = Plan::where('slug', 'enterprise')->first();

        if (! $freeTrial || ! $starter || ! $professional || ! $enterprise) {
            $this->command->warn('Plans not found. Run PlanSeeder first.');

            return;
        }

        // Create demo tenants with various subscription states
        $tenants = $this->createDemoTenants($freeTrial, $starter, $professional, $enterprise);

        // Create invoices for each tenant
        foreach ($tenants as $tenant) {
            $this->createInvoicesForTenant($tenant);
        }

        $this->command->info('Demo billing data seeded successfully!');
        $this->command->info("  - {$tenants->count()} tenants with subscriptions");
        $this->command->info('  - Invoices in various states (draft, sent, paid, overdue)');
        $this->command->info('  - Payments recorded for paid invoices');
    }

    private function createDemoTenants(Plan $freeTrial, Plan $starter, Plan $professional, Plan $enterprise)
    {
        $tenantData = [
            // Active subscribers
            [
                'name' => 'Port Moresby General Hospital',
                'slug' => 'port-moresby-general',
                'plan' => $enterprise,
                'status' => SubscriptionStatus::Active,
                'subscribed_at' => now()->subYears(2),
                'users' => 85,
            ],
            [
                'name' => 'Lae International Hospital',
                'slug' => 'lae-international',
                'plan' => $professional,
                'status' => SubscriptionStatus::Active,
                'subscribed_at' => now()->subMonths(6),
                'users' => 30,
            ],
            [
                'name' => 'Mount Hagen Provincial Hospital',
                'slug' => 'mount-hagen-provincial',
                'plan' => $professional,
                'status' => SubscriptionStatus::Active,
                'subscribed_at' => now()->subMonths(4),
                'users' => 25,
            ],
            [
                'name' => 'Goroka Medical Centre',
                'slug' => 'goroka-medical',
                'plan' => $starter,
                'status' => SubscriptionStatus::Active,
                'subscribed_at' => now()->subMonths(3),
                'users' => 10,
            ],
            [
                'name' => 'Madang Family Clinic',
                'slug' => 'madang-family',
                'plan' => $starter,
                'status' => SubscriptionStatus::Active,
                'subscribed_at' => now()->subYear(),
                'users' => 8,
            ],
            // Trialing
            [
                'name' => 'Kokopo Community Health',
                'slug' => 'kokopo-community',
                'plan' => $freeTrial,
                'status' => SubscriptionStatus::Trialing,
                'trial_ends_at' => now()->addDays(10),
                'subscribed_at' => now(),
                'users' => 4,
            ],
            [
                'name' => 'Wewak Rural Clinic',
                'slug' => 'wewak-rural',
                'plan' => $freeTrial,
                'status' => SubscriptionStatus::Trialing,
                'trial_ends_at' => now()->addDays(3),
                'subscribed_at' => now()->subDays(11),
                'users' => 3,
            ],
            // Past due
            [
                'name' => 'Kimbe District Hospital',
                'slug' => 'kimbe-district',
                'plan' => $professional,
                'status' => SubscriptionStatus::PastDue,
                'subscribed_at' => now()->subMonths(4),
                'users' => 18,
            ],
            // Canceled
            [
                'name' => 'Alotau Private Medical',
                'slug' => 'alotau-private',
                'plan' => $starter,
                'status' => SubscriptionStatus::Canceled,
                'subscribed_at' => now()->subYear(),
                'subscription_ends_at' => now()->addMonth(),
                'users' => 2,
            ],
            // Expired
            [
                'name' => 'Mendi Health Services',
                'slug' => 'mendi-health',
                'plan' => $starter,
                'status' => SubscriptionStatus::Expired,
                'subscribed_at' => now()->subMonths(8),
                'subscription_ends_at' => now()->subDay(),
                'users' => 1,
            ],
        ];

        $tenants = collect();

        foreach ($tenantData as $data) {
            $tenant = Tenant::create([
                'id' => (string) Str::uuid(),
                'name' => $data['name'],
                'slug' => $data['slug'],
                'email' => Str::slug($data['name']).'@example.com',
                'phone' => '+675 '.fake()->numerify('7### ####'),
                'address' => fake()->address(),
                'is_active' => true,
                'plan_id' => $data['plan']->id,
                'subscription_status' => $data['status'],
                'trial_ends_at' => $data['trial_ends_at'] ?? null,
                'subscribed_at' => $data['subscribed_at'],
                'subscription_ends_at' => $data['subscription_ends_at'] ?? null,
            ]);

            // Create hospital admin for this tenant
            User::create([
                'tenant_id' => $tenant->id,
                'name' => $data['name'].' Admin',
                'email' => 'admin@'.$data['slug'].'.hms',
                'password' => bcrypt('password'),
                'role' => Role::HospitalAdmin->value,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            // Create additional staff users for this tenant
            $additionalStaff = max(0, $data['users'] - 1);
            if ($additionalStaff > 0) {
                User::factory()
                    ->count($additionalStaff)
                    ->state([
                        'tenant_id' => $tenant->id,
                        'role' => fake()->randomElement(Role::hospitalStaffRoles())->value,
                    ])
                    ->create();
            }

            $tenants->push($tenant);
        }

        return $tenants;
    }

    private function createInvoicesForTenant(Tenant $tenant): void
    {
        $plan = $tenant->plan;
        $monthlyAmount = $plan?->price_monthly ?? 29900;
        $taxRate = 0.16;

        // Determine number of months to generate invoices for
        $monthsActive = match ($tenant->subscription_status) {
            SubscriptionStatus::Active => $tenant->subscribed_at
                ? max(1, (int) $tenant->subscribed_at->diffInMonths(now()))
                : 6,
            SubscriptionStatus::Trialing => 0,
            SubscriptionStatus::PastDue => $tenant->subscribed_at
                ? max(2, (int) $tenant->subscribed_at->diffInMonths(now()))
                : 3,
            SubscriptionStatus::Canceled => $tenant->subscribed_at
                ? max(1, (int) $tenant->subscribed_at->diffInMonths(now()))
                : 3,
            default => 3,
        };

        $monthsActive = min($monthsActive, 12);

        // Generate past months invoices
        for ($i = $monthsActive; $i >= 1; $i--) {
            $issuedAt = now()->subMonths($i)->startOfMonth();
            $dueAt = (clone $issuedAt)->addDays(30);

            $subtotal = $monthlyAmount;
            $tax = (int) ($subtotal * $taxRate);
            $total = $subtotal + $tax;

            // Recent invoices may be unpaid (past due / sent), older ones are paid
            $isRecent = $i <= 1;
            $isOverdue = $tenant->subscription_status === SubscriptionStatus::PastDue && $i === 1;

            $status = match (true) {
                $isOverdue => InvoiceStatus::Overdue,
                $isRecent && $tenant->subscription_status === SubscriptionStatus::PastDue => InvoiceStatus::Sent,
                $isRecent && $tenant->subscription_status === SubscriptionStatus::Canceled => InvoiceStatus::Canceled,
                $isRecent => fake()->randomElement([InvoiceStatus::Sent, InvoiceStatus::Paid]),
                default => InvoiceStatus::Paid,
            };

            $paidAt = $status === InvoiceStatus::Paid
                ? (clone $issuedAt)->addDays(fake()->numberBetween(1, 25))
                : null;

            $invoice = Invoice::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'number' => sprintf('INV-%s-%04d', $issuedAt->format('Y'), fake()->unique()->numberBetween(1, 9999)),
                'status' => $status,
                'subtotal' => $subtotal,
                'tax_amount' => $tax,
                'total' => $total,
                'issued_at' => $issuedAt,
                'due_at' => $dueAt,
                'paid_at' => $paidAt,
                'notes' => "Monthly subscription: {$plan?->name} - {$issuedAt->format('F Y')}",
            ]);

            // Create payment for paid invoices
            if ($status === InvoiceStatus::Paid) {
                Payment::create([
                    'id' => (string) Str::uuid(),
                    'invoice_id' => $invoice->id,
                    'tenant_id' => $tenant->id,
                    'amount' => $total,
                    'method' => fake()->randomElement(['bank_transfer', 'check']),
                    'reference' => 'TXN-'.fake()->numerify('########'),
                    'paid_at' => $paidAt,
                    'notes' => 'Monthly subscription payment',
                    'recorded_by' => User::where('role', Role::SuperAdmin->value)->first()?->id,
                ]);
            }
        }

        // Add a one-time service invoice for some tenants
        if (fake()->boolean(60)) {
            $serviceSubtotal = fake()->numberBetween(5000, 50000);
            $serviceTax = (int) ($serviceSubtotal * $taxRate);
            $serviceTotal = $serviceSubtotal + $serviceTax;
            $serviceIssued = now()->subDays(fake()->numberBetween(5, 45));

            Invoice::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'number' => sprintf('INV-%s-%04d', date('Y'), fake()->unique()->numberBetween(1, 9999)),
                'status' => InvoiceStatus::Draft,
                'subtotal' => $serviceSubtotal,
                'tax_amount' => $serviceTax,
                'total' => $serviceTotal,
                'issued_at' => $serviceIssued,
                'due_at' => (clone $serviceIssued)->addDays(30),
                'paid_at' => null,
                'notes' => fake()->randomElement([
                    'Onboarding and setup fee',
                    'Additional user licenses',
                    'Training and support package',
                    'Data migration service',
                ]),
            ]);
        }
    }
}
