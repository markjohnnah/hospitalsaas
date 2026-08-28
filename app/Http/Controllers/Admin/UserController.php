<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->where('role', Role::HospitalAdmin->value)
            ->with('tenant:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    public function edit(int $id): Response
    {
        $user = $this->findHospitalAdmin($id);

        return Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $user = $this->findHospitalAdmin($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['boolean'],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Hospital admin '{$user->name}' updated successfully."]);

        return to_route('admin.users.index');
    }

    public function resetPassword(Request $request, int $id): RedirectResponse
    {
        $user = $this->findHospitalAdmin($id);

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Password for '{$user->name}' was reset successfully."]);

        return to_route('admin.users.index');
    }

    public function destroy(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        // Only hospital admins are managed from this section
        if ($user->role !== Role::HospitalAdmin->value) {
            return back()->withErrors(['error' => 'Only hospital admin accounts can be deleted here.']);
        }

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Hospital admin '{$user->name}' deleted successfully."]);

        return to_route('admin.users.index');
    }

    private function findHospitalAdmin(int $id): User
    {
        return User::where('role', Role::HospitalAdmin->value)->findOrFail($id);
    }
}
