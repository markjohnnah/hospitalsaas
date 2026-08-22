<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@hms.test'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@hms.test',
                'password' => Hash::make('password'),
                'role' => Role::SuperAdmin->value,
                'tenant_id' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Super Admin seeded: admin@hms.test / password');
    }
}
