<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $tenant = Tenant::with('plan')->findOrFail($user->tenant_id);

        $invoices = Invoice::query()
            ->where('tenant_id', $tenant->id)
            ->with('payments')
            ->latest('issued_at')
            ->paginate(10);

        // Usage stats from the shared users table
        $usage = [
            'users' => User::where('tenant_id', $tenant->id)->count(),
            'patients' => User::where('tenant_id', $tenant->id)->where('role', Role::Patient->value)->count(),
            'doctors' => User::where('tenant_id', $tenant->id)->where('role', Role::Doctor->value)->count(),
        ];

        return Inertia::render('settings/billing', [
            'tenant' => $tenant,
            'plan' => $tenant->plan,
            'usage' => $usage,
            'invoices' => $invoices,
        ]);
    }
}
