<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free Trial',
                'slug' => 'free-trial',
                'description' => '14-day trial with basic features. Perfect for small clinics evaluating the system.',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'max_users' => 5,
                'max_patients' => 100,
                'features' => json_encode(['emr', 'appointments', 'patients']),
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Essential tools for small hospitals and clinics. Includes patient management, appointments, and pharmacy.',
                'price_monthly' => 29900,
                'price_yearly' => 299000,
                'max_users' => 10,
                'max_patients' => 500,
                'features' => json_encode(['emr', 'appointments', 'patients', 'pharmacy', 'doctors']),
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Full clinical suite for mid-size hospitals. All modules including lab, radiology, and billing.',
                'price_monthly' => 89900,
                'price_yearly' => 899000,
                'max_users' => 50,
                'max_patients' => 5000,
                'features' => json_encode(['emr', 'appointments', 'patients', 'pharmacy', 'doctors', 'lab', 'radiology', 'inpatient', 'billing']),
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Unlimited everything for large hospitals and multi-branch operations. Priority support included.',
                'price_monthly' => 249900,
                'price_yearly' => 2499000,
                'max_users' => null,
                'max_patients' => null,
                'features' => json_encode(['emr', 'appointments', 'patients', 'pharmacy', 'doctors', 'lab', 'radiology', 'inpatient', 'billing', 'hr', 'inventory', 'multi_branch']),
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::firstOrCreate(
                ['slug' => $plan['slug']],
                array_merge($plan, ['id' => (string) Str::uuid()])
            );
        }

        $this->command->info('Subscription plans seeded successfully.');
    }
}
