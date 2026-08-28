<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Tenant;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $stats = match ($user->role) {
            Role::SuperAdmin->value => $this->superAdminStats(),
            default => $this->hospitalStats(),
        };

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'role' => $user->role,
        ]);
    }

    private function superAdminStats(): array
    {
        return [
            ['label' => 'Total Hospitals', 'value' => Tenant::count(), 'icon' => 'building'],
            ['label' => 'Active Hospitals', 'value' => Tenant::where('is_active', true)->count(), 'icon' => 'activity'],
            ['label' => 'Total Users', 'value' => User::whereNotNull('tenant_id')->count(), 'icon' => 'users'],
            ['label' => 'System Admins', 'value' => User::where('role', Role::SuperAdmin->value)->count(), 'icon' => 'shield'],
        ];
    }

    private function hospitalStats(): array
    {
        $tenantId = auth()->user()->tenant_id;

        return [
            ['label' => 'Total Staff', 'value' => User::where('tenant_id', $tenantId)->whereNot('role', Role::Patient->value)->count(), 'icon' => 'users'],
            ['label' => 'Patients', 'value' => User::where('tenant_id', $tenantId)->where('role', Role::Patient->value)->count(), 'icon' => 'heart-pulse'],
            ['label' => 'Doctors', 'value' => User::where('tenant_id', $tenantId)->where('role', Role::Doctor->value)->count(), 'icon' => 'stethoscope'],
            ['label' => 'Nurses', 'value' => User::where('tenant_id', $tenantId)->where('role', Role::Nurse->value)->count(), 'icon' => 'activity'],
        ];
    }
}
