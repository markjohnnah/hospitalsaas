<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $staff = User::query()
            ->where('tenant_id', $tenantId)
            ->whereNot('role', Role::Patient->value)
            ->when($request->input('search'), fn ($q, $s) => $q->where(fn ($q) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")))
            ->when($request->input('role'), fn ($q, $r) => $q->where('role', $r))
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('staff/index', [
            'staff' => $staff,
            'roles' => Role::hospitalStaffRoles(),
            'filters' => $request->only(['search', 'role', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('staff/create', [
            'roles' => Role::hospitalStaffRoles(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', 'string', Rule::in(array_column(Role::hospitalStaffRoles(), 'value'))],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'password' => ['required', Password::defaults()],
            'is_active' => ['boolean'],
        ]);

        User::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'gender' => $validated['gender'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'password' => Hash::make($validated['password']),
            'is_active' => $request->boolean('is_active', true),
            'email_verified_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Staff member '{$validated['name']}' created successfully."]);

        return to_route('staff.index');
    }

    public function show(string $id): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $staff = User::where('tenant_id', $tenantId)->findOrFail($id);

        return Inertia::render('staff/show', [
            'staff' => $staff,
        ]);
    }

    public function edit(string $id): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $staff = User::where('tenant_id', $tenantId)->findOrFail($id);

        return Inertia::render('staff/edit', [
            'staff' => $staff,
            'roles' => Role::hospitalStaffRoles(),
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $tenantId = auth()->user()->tenant_id;

        $staff = User::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($staff->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', 'string', Rule::in(array_column(Role::hospitalStaffRoles(), 'value'))],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'password' => ['nullable', Password::defaults()],
            'is_active' => ['boolean'],
        ]);

        $staff->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'gender' => $validated['gender'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        if (! empty($validated['password'])) {
            $staff->password = Hash::make($validated['password']);
        }

        $staff->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Staff member '{$validated['name']}' updated successfully."]);

        return to_route('staff.index');
    }

    public function destroy(string $id): RedirectResponse
    {
        $tenantId = auth()->user()->tenant_id;

        $staff = User::where('tenant_id', $tenantId)->findOrFail($id);

        if ($staff->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        $staff->update(['is_active' => false]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Staff member '{$staff->name}' deactivated successfully."]);

        return to_route('staff.index');
    }
}
