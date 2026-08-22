<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTenantRequest;
use App\Http\Requests\Admin\UpdateTenantRequest;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(): Response
    {
        $tenants = Tenant::query()
            ->withCount('users')
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/tenants/index', [
            'tenants' => $tenants,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/tenants/create');
    }

    public function store(StoreTenantRequest $request): RedirectResponse
    {
        $tenant = Tenant::create([
            'id' => Str::uuid()->toString(),
            'name' => $request->name,
            'slug' => $request->slug,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'website' => $request->website,
            'is_active' => $request->boolean('is_active', true),
            'subscription_status' => SubscriptionStatus::Trialing,
            'trial_ends_at' => now()->addDays(14),
            'subscribed_at' => now(),
        ]);

        // Auto-assign Free Trial plan
        $freeTrialPlan = Plan::where('slug', 'free-trial')->first();
        if ($freeTrialPlan) {
            $tenant->plan()->associate($freeTrialPlan);
            $tenant->save();
        }

        User::create([
            'tenant_id' => $tenant->id,
            'name' => $request->admin_name,
            'email' => $request->admin_email,
            'password' => Hash::make($request->admin_password),
            'role' => Role::HospitalAdmin->value,
            'is_active' => true,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Hospital '{$tenant->name}' created successfully."]);

        return to_route('admin.tenants.index');
    }

    public function show(string $id): Response
    {
        $tenant = Tenant::with(['users' => fn ($q) => $q->select('id', 'tenant_id', 'name', 'email', 'role', 'is_active', 'created_at'), 'plan'])
            ->findOrFail($id);

        return Inertia::render('admin/tenants/show', [
            'tenant' => $tenant,
        ]);
    }

    public function edit(string $id): Response
    {
        $tenant = Tenant::findOrFail($id);

        return Inertia::render('admin/tenants/edit', [
            'tenant' => $tenant,
        ]);
    }

    public function update(UpdateTenantRequest $request, string $id): RedirectResponse
    {
        $tenant = Tenant::findOrFail($id);

        $tenant->update([
            'name' => $request->name,
            'slug' => $request->slug,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'website' => $request->website,
            'is_active' => $request->boolean('is_active', true),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Hospital updated successfully.']);

        return to_route('admin.tenants.index');
    }

    public function destroy(string $id): RedirectResponse
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Hospital deleted successfully.']);

        return to_route('admin.tenants.index');
    }
}
