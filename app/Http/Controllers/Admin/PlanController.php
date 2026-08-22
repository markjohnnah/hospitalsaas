<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(): Response
    {
        $plans = Plan::orderBy('sort_order')->get();

        return Inertia::render('admin/billing/plans/index', [
            'plans' => $plans,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/billing/plans/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:plans,slug'],
            'description' => ['nullable', 'string'],
            'price_monthly' => ['required', 'numeric', 'min:0'],
            'price_yearly' => ['required', 'numeric', 'min:0'],
            'max_users' => ['nullable', 'integer', 'min:1'],
            'max_patients' => ['nullable', 'integer', 'min:1'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['price_monthly'] = (int) ($validated['price_monthly'] * 100);
        $validated['price_yearly'] = (int) ($validated['price_yearly'] * 100);
        $validated['is_active'] = $request->boolean('is_active', true);

        Plan::create($validated);

        return to_route('admin.billing.plans.index')
            ->with('success', "Plan '{$validated['name']}' created successfully.");
    }

    public function edit(string $id): Response
    {
        $plan = Plan::findOrFail($id);

        return Inertia::render('admin/billing/plans/edit', [
            'plan' => [
                ...$plan->toArray(),
                'price_monthly' => $plan->price_monthly / 100,
                'price_yearly' => $plan->price_yearly / 100,
            ],
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('plans', 'slug')->ignore($plan->id)],
            'description' => ['nullable', 'string'],
            'price_monthly' => ['required', 'numeric', 'min:0'],
            'price_yearly' => ['required', 'numeric', 'min:0'],
            'max_users' => ['nullable', 'integer', 'min:1'],
            'max_patients' => ['nullable', 'integer', 'min:1'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['price_monthly'] = (int) ($validated['price_monthly'] * 100);
        $validated['price_yearly'] = (int) ($validated['price_yearly'] * 100);
        $validated['is_active'] = $request->boolean('is_active', true);

        $plan->update($validated);

        return to_route('admin.billing.plans.index')
            ->with('success', "Plan '{$validated['name']}' updated successfully.");
    }

    public function destroy(string $id): RedirectResponse
    {
        $plan = Plan::findOrFail($id);

        if ($plan->tenants()->exists()) {
            return back()->with('error', 'Cannot delete a plan with active subscribers.');
        }

        $plan->delete();

        return to_route('admin.billing.plans.index')
            ->with('success', 'Plan deleted successfully.');
    }
}
