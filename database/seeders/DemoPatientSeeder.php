<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Patient;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Stancl\Tenancy\Facades\Tenancy;

class DemoPatientSeeder extends Seeder
{
    private const PATIENTS_PER_TENANT = 15;

    public function run(): void
    {
        $this->command->info('Seeding demo patients...');

        $tenants = Tenant::where('is_active', true)->get();

        if ($tenants->isEmpty()) {
            $this->command->warn('No tenants found. Run DemoBillingSeeder first.');

            return;
        }

        $total = 0;

        foreach ($tenants as $tenant) {
            $count = $this->seedPatientsForTenant($tenant);
            $total += $count;

            $this->command->info("  {$tenant->name}: {$count} patients");
        }

        $this->command->info("Total: {$total} patients seeded across {$tenants->count()} hospitals.");
    }

    private function seedPatientsForTenant(Tenant $tenant): int
    {
        Tenancy::initialize($tenant);

        $existing = Patient::count();

        if ($existing >= self::PATIENTS_PER_TENANT) {
            Tenancy::end();

            return 0;
        }

        $toCreate = self::PATIENTS_PER_TENANT - $existing;

        // Create patient User records in central DB
        $patientUsers = [];
        for ($i = 0; $i < $toCreate; $i++) {
            $firstName = fake()->firstName();
            $lastName = fake()->lastName();

            $patientUsers[] = User::create([
                'tenant_id' => $tenant->id,
                'name' => "{$firstName} {$lastName}",
                'email' => strtolower("{$firstName}.{$lastName}".fake()->numberBetween(1, 9999).'@patient.hms'),
                'password' => bcrypt('password'),
                'role' => Role::Patient->value,
                'phone' => '+675 '.fake()->numerify('7### ####'),
                'gender' => fake()->randomElement(['male', 'female']),
                'date_of_birth' => fake()->dateTimeBetween('-85 years', '-1 year'),
                'is_active' => true,
                'email_verified_at' => fake()->boolean(70) ? now() : null,
                'created_at' => fake()->dateTimeBetween('-2 years', 'now'),
                'updated_at' => now(),
            ]);
        }

        // Create Patient records in tenant DB
        for ($i = 0; $i < $toCreate; $i++) {
            $user = $patientUsers[$i];

            Patient::create([
                'mrn' => 'MRN-'.strtoupper(fake()->unique()->bothify('??######')),
                'first_name' => explode(' ', $user->name)[0],
                'last_name' => explode(' ', $user->name)[1] ?? '',
                'date_of_birth' => $user->date_of_birth->format('Y-m-d'),
                'gender' => $user->gender,
                'blood_type' => fake()->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
                'phone' => $user->phone,
                'email' => $user->email,
                'address' => fake()->streetAddress(),
                'city' => fake()->randomElement([
                    'Port Moresby', 'Lae', 'Mount Hagen', 'Goroka', 'Madang',
                    'Kokopo', 'Wewak', 'Kimbe', 'Alotau', 'Mendi',
                ]),
                'country' => 'Papua New Guinea',
                'nationality' => 'Papua New Guinean',
                'marital_status' => fake()->randomElement(['single', 'married', 'divorced', 'widowed']),
                'occupation' => fake()->jobTitle(),
                'emergency_contact_name' => fake()->name(),
                'emergency_contact_phone' => '+675 '.fake()->numerify('7### ####'),
                'emergency_contact_relationship' => fake()->randomElement(['Spouse', 'Parent', 'Sibling', 'Child', 'Friend']),
                'user_id' => $user->id,
                'is_active' => true,
                'created_at' => $user->created_at,
                'updated_at' => now(),
            ]);
        }

        Tenancy::end();

        return $toCreate;
    }
}
