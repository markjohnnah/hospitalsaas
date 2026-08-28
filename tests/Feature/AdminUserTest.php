<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

    public function test_admin_users_index_only_lists_hospital_admins(): void
    {
        $superAdmin = $this->superAdmin();
        $this->actingAs($superAdmin);

        $tenant = Tenant::factory()->create();
        $hospitalAdmin = User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => Role::HospitalAdmin->value,
        ]);
        User::factory()->create(['tenant_id' => $tenant->id, 'role' => Role::Doctor->value]);
        User::factory()->create(['tenant_id' => $tenant->id, 'role' => Role::Patient->value]);

        $response = $this->get(route('admin.users.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->has('users.data', 1)
            ->where('users.data.0.id', $hospitalAdmin->id)
        );
    }

    public function test_super_admin_can_edit_hospital_admin(): void
    {
        $superAdmin = $this->superAdmin();
        $hospitalAdmin = User::factory()->create(['role' => Role::HospitalAdmin->value]);
        $this->actingAs($superAdmin);

        $this->get(route('admin.users.edit', $hospitalAdmin))
            ->assertOk();
    }

    public function test_super_admin_can_update_hospital_admin(): void
    {
        $superAdmin = $this->superAdmin();
        $hospitalAdmin = User::factory()->create(['role' => Role::HospitalAdmin->value]);
        $this->actingAs($superAdmin);

        $this->put(route('admin.users.update', $hospitalAdmin), [
            'name' => 'Updated Admin',
            'email' => $hospitalAdmin->email,
            'phone' => '+675 7000 0000',
            'is_active' => false,
        ])->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', [
            'id' => $hospitalAdmin->id,
            'name' => 'Updated Admin',
            'is_active' => false,
        ]);
    }

    public function test_super_admin_can_reset_hospital_admin_password(): void
    {
        $superAdmin = $this->superAdmin();
        $hospitalAdmin = User::factory()->create(['role' => Role::HospitalAdmin->value]);
        $this->actingAs($superAdmin);

        $this->patch(route('admin.users.password', $hospitalAdmin), [
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertRedirect(route('admin.users.index'));

        $this->assertTrue(Hash::check('new-password-123', $hospitalAdmin->fresh()->password));
    }

    public function test_super_admin_cannot_delete_non_admin_users(): void
    {
        $superAdmin = $this->superAdmin();
        $doctor = User::factory()->create(['role' => Role::Doctor->value]);
        $this->actingAs($superAdmin);

        $this->delete(route('admin.users.destroy', $doctor))
            ->assertSessionHasErrors('error');

        $this->assertDatabaseHas('users', ['id' => $doctor->id]);
    }
}
