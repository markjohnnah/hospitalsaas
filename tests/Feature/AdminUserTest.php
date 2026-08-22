<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        return User::factory()->create(['role' => Role::SuperAdmin->value, 'email_verified_at' => now()]);
    }

    public function test_guests_cannot_access_admin_users(): void
    {
        $response = $this->get(route('admin.users.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_non_super_admin_cannot_access_admin_users(): void
    {
        $user = User::factory()->create(['role' => Role::HospitalAdmin->value]);
        $this->actingAs($user);

        $response = $this->get(route('admin.users.index'));
        $response->assertForbidden();
    }

    public function test_super_admin_can_view_system_users(): void
    {
        $superAdmin = $this->superAdmin();
        $this->actingAs($superAdmin);

        User::factory()->count(3)->create(['role' => Role::HospitalAdmin->value]);

        $response = $this->get(route('admin.users.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('admin/users/index')->has('users'));
    }

    public function test_super_admin_cannot_delete_themselves(): void
    {
        $superAdmin = $this->superAdmin();
        $this->actingAs($superAdmin);

        $response = $this->delete(route('admin.users.destroy', $superAdmin));
        $response->assertSessionHasErrors('error');
    }

    public function test_super_admin_cannot_delete_other_super_admins(): void
    {
        $superAdmin = $this->superAdmin();
        $anotherSuperAdmin = $this->superAdmin();
        $this->actingAs($superAdmin);

        $response = $this->delete(route('admin.users.destroy', $anotherSuperAdmin));
        $response->assertSessionHasErrors('error');
    }

    public function test_super_admin_can_delete_a_non_super_admin_user(): void
    {
        $superAdmin = $this->superAdmin();
        $hospitalAdmin = User::factory()->create(['role' => Role::HospitalAdmin->value]);
        $this->actingAs($superAdmin);

        $response = $this->delete(route('admin.users.destroy', $hospitalAdmin));
        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseMissing('users', ['id' => $hospitalAdmin->id]);
    }
}

