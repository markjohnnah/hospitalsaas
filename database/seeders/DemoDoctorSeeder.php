<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Stancl\Tenancy\Facades\Tenancy;

class DemoDoctorSeeder extends Seeder
{
    private const DOCTORS_PER_TENANT = 3;

    private const DOCTOR_TEMPLATES = [
        [
            'first_name' => 'James',
            'last_name' => 'Kuman',
            'gender' => 'male',
            'department' => 'General Medicine',
            'specialization' => 'General Practitioner',
            'qualification' => 'MBBS, UPNG',
            'experience_years' => 15,
            'consultation_fee' => 120.00,
            'bio' => 'Experienced general practitioner with a focus on preventive care and chronic disease management.',
        ],
        [
            'first_name' => 'Margaret',
            'last_name' => 'Tau',
            'gender' => 'female',
            'department' => 'Pediatrics',
            'specialization' => 'Pediatrician',
            'qualification' => 'MBBS, MMed (Paediatrics), UPNG',
            'experience_years' => 10,
            'consultation_fee' => 150.00,
            'bio' => 'Dedicated pediatrician specialising in child development, immunisation, and infectious diseases.',
        ],
        [
            'first_name' => 'Robert',
            'last_name' => 'Poka',
            'gender' => 'male',
            'department' => 'Cardiology',
            'specialization' => 'Cardiologist',
            'qualification' => 'MBBS, MMed (Cardiology), Fiji National University',
            'experience_years' => 20,
            'consultation_fee' => 200.00,
            'bio' => 'Senior cardiologist with expertise in echocardiography, hypertension, and cardiac rehabilitation.',
        ],
    ];

    public function run(): void
    {
        $this->command->info('Seeding demo doctors...');

        $tenants = Tenant::where('is_active', true)->get();

        if ($tenants->isEmpty()) {
            $this->command->warn('No tenants found.');

            return;
        }

        $total = 0;

        foreach ($tenants as $tenant) {
            $count = $this->seedDoctorsForTenant($tenant);
            $total += $count;
            $this->command->info("  {$tenant->name}: {$count} doctors");
        }

        $this->command->info("Total: {$total} doctors seeded across {$tenants->count()} hospitals.");
    }

    private function seedDoctorsForTenant(Tenant $tenant): int
    {
        Tenancy::initialize($tenant);

        // Ensure departments and specializations exist
        $this->ensureReferenceData();

        $existing = Doctor::count();

        if ($existing >= self::DOCTORS_PER_TENANT) {
            Tenancy::end();

            return 0;
        }

        $slug = $tenant->slug ?? Str::slug($tenant->name);
        $created = 0;

        foreach (self::DOCTOR_TEMPLATES as $i => $template) {
            $email = strtolower("{$template['first_name']}.{$template['last_name']}@{$slug}.hms");

            // Skip if user already exists
            if (User::where('email', $email)->exists()) {
                continue;
            }

            // Create User in central DB
            $user = User::create([
                'tenant_id' => $tenant->id,
                'name' => "Dr. {$template['first_name']} {$template['last_name']}",
                'email' => $email,
                'password' => bcrypt('password'),
                'role' => Role::Doctor->value,
                'phone' => '+675 '.fake()->numerify('7### ####'),
                'gender' => $template['gender'],
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            // Find or create department
            $department = Department::firstOrCreate(
                ['name' => $template['department']],
                ['is_active' => true]
            );

            // Find or create specialization
            $specialization = Specialization::firstOrCreate(
                ['name' => $template['specialization']],
                ['is_active' => true]
            );

            // Create Doctor in tenant DB
            $doctor = Doctor::create([
                'user_id' => $user->id,
                'department_id' => $department->id,
                'specialization_id' => $specialization->id,
                'license_number' => 'PNG-MC-'.fake()->numerify('20##-####'),
                'consultation_fee' => $template['consultation_fee'],
                'qualification' => $template['qualification'],
                'experience_years' => $template['experience_years'],
                'bio' => $template['bio'],
                'is_available' => true,
            ]);

            // Create weekly schedule (Mon-Fri, 9am-5pm)
            foreach (range(1, 5) as $day) {
                $doctor->schedules()->create([
                    'day_of_week' => $day,
                    'start_time' => '09:00',
                    'end_time' => '17:00',
                    'slot_duration_minutes' => 30,
                ]);
            }

            $created++;
        }

        Tenancy::end();

        return $created;
    }

    private function ensureReferenceData(): void
    {
        $departments = ['General Medicine', 'Pediatrics', 'Cardiology', 'Surgery', 'Obstetrics & Gynaecology'];
        $specializations = ['General Practitioner', 'Pediatrician', 'Cardiologist', 'Surgeon', 'Obstetrician'];

        foreach ($departments as $name) {
            Department::firstOrCreate(['name' => $name], ['is_active' => true]);
        }

        foreach ($specializations as $name) {
            Specialization::firstOrCreate(['name' => $name], ['is_active' => true]);
        }
    }
}
