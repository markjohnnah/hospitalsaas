<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->with('tenant:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    public function destroy(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        // Prevent deleting other super admins
        if ($user->role === Role::SuperAdmin->value) {
            return back()->withErrors(['error' => 'Super admin accounts cannot be deleted.']);
        }

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "User '{$user->name}' deleted successfully."]);

        return to_route('admin.users.index');
    }
}
