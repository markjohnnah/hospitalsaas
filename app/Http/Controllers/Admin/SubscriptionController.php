<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $tenants = Tenant::query()
            ->with(['plan:id,name,slug'])
            ->withCount('users')
            ->when($request->input('status'), fn ($q, $s) => $q->where('subscription_status', $s))
            ->latest('subscribed_at')
            ->paginate(20)
            ->withQueryString();

        $plans = Plan::where('is_active', true)->orderBy('sort_order')->get();
        $statuses = SubscriptionStatus::cases();

        return Inertia::render('admin/billing/subscriptions/index', [
            'tenants' => $tenants,
            'plans' => $plans,
            'filters' => $request->only(['status']),
            'statuses' => $statuses,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $tenant = Tenant::findOrFail($id);

        $validated = $request->validate([
            'plan_id' => ['required', 'string', 'exists:plans,id'],
            'subscription_status' => ['required', 'string', Rule::in(array_column(SubscriptionStatus::cases(), 'value'))],
            'trial_ends_at' => ['nullable', 'date'],
            'subscription_ends_at' => ['nullable', 'date'],
        ]);

        $tenant->plan_id = $validated['plan_id'];
        $tenant->subscription_status = SubscriptionStatus::from($validated['subscription_status']);

        if (isset($validated['trial_ends_at'])) {
            $tenant->trial_ends_at = $validated['trial_ends_at'];
        }

        if (isset($validated['subscription_ends_at'])) {
            $tenant->subscription_ends_at = $validated['subscription_ends_at'];
        }

        if ($validated['subscription_status'] === SubscriptionStatus::Active->value && ! $tenant->subscribed_at) {
            $tenant->subscribed_at = now();
        }

        $tenant->save();

        return back()->with('success', "Subscription for '{$tenant->name}' updated successfully.");
    }

    public function extendTrial(Request $request, string $id): RedirectResponse
    {
        $tenant = Tenant::findOrFail($id);

        $validated = $request->validate([
            'days' => ['required', 'integer', 'min:1', 'max:90'],
        ]);

        $tenant->trial_ends_at = ($tenant->trial_ends_at ?? now())->addDays((int) $validated['days']);
        $tenant->subscription_status = SubscriptionStatus::Trialing;
        $tenant->save();

        return back()->with('success', "Trial extended by {$validated['days']} days for '{$tenant->name}'.");
    }
}
