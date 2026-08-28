<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\Role;
use App\Http\Middleware\InitializeTenancyByUser;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Staff management queries the central users table directly
        // and does not need multi-database tenancy initialization.
        $this->withoutMiddleware(InitializeTenancyByUser::class);
    }

    private function hospitalAdmin(Tenant $tenant): User
    {
        return User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => Role::HospitalAdmin->value,
            'email_verified_at' => now(),
        ]);
    }

    private function staffUser(Tenant $tenant, string $role = 'nurse'): User
    {
        return User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => $role,
            'email_verified_at' => now(),
        ]);
    }

    // ─── Access Control ──────────────────────────────────────────────────────

    public function test_guests_cannot_access_staff(): void
    {
        $this->get(route('staff.index'))->assertRedirect(route('login'));
    }

    public function test_super_admin_cannot_access_staff_list(): void
    {
        $user = User::factory()->create([
            'role' => Role::SuperAdmin->value,
            'email_verified_at' => now(),
        ]);
        $this->actingAs($user);

        // Super admins manage hospital admins only — staff belongs to each hospital admin.
        $this->get(route('staff.index'))->assertForbidden();
    }

    public function test_hospital_admin_can_access_staff_index(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);

        $this->actingAs($admin)
            ->get(route('staff.index'))
            ->assertOk();
    }

    public function test_hospital_admin_can_view_create_form(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);

        $this->actingAs($admin)
            ->get(route('staff.create'))
            ->assertOk();
    }

    // ─── Create Staff ────────────────────────────────────────────────────────

    public function test_hospital_admin_can_create_staff(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);

        $this->actingAs($admin)
            ->post(route('staff.store'), [
                'name' => 'Dr. Sarah Kone',
                'email' => 'sarah.kone@lae-international.hms',
                'password' => 'password123',
                'role' => 'doctor',
                'phone' => '+675 7123 4567',
            ])
            ->assertRedirect(route('staff.index'));

        $this->assertDatabaseHas('users', [
            'name' => 'Dr. Sarah Kone',
            'email' => 'sarah.kone@lae-international.hms',
            'role' => 'doctor',
            'tenant_id' => $tenant->id,
            'is_active' => true,
        ]);
    }

    public function test_staff_store_validates_required_fields(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);

        $this->actingAs($admin)
            ->post(route('staff.store'), [])
            ->assertSessionHasErrors(['name', 'email', 'password', 'role']);
    }

    public function test_staff_store_validates_unique_email(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);

        User::factory()->create(['email' => 'duplicate@hms.com']);

        $this->actingAs($admin)
            ->post(route('staff.store'), [
                'name' => 'Test User',
                'email' => 'duplicate@hms.com',
                'password' => 'password123',
                'role' => 'nurse',
            ])
            ->assertSessionHasErrors(['email']);
    }

    public function test_staff_store_validates_role_is_staff(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);

        $this->actingAs($admin)
            ->post(route('staff.store'), [
                'name' => 'Test Patient',
                'email' => 'patient@hms.com',
                'password' => 'password123',
                'role' => 'patient',
            ])
            ->assertSessionHasErrors(['role']);
    }

    // ─── View Staff ──────────────────────────────────────────────────────────

    public function test_hospital_admin_can_view_staff_details(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);
        $staff = $this->staffUser($tenant);

        $this->actingAs($admin)
            ->get(route('staff.show', $staff->id))
            ->assertOk();
    }

    public function test_hospital_admin_cannot_view_staff_from_other_tenant(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenantA);
        $otherStaff = $this->staffUser($tenantB);

        $this->actingAs($admin)
            ->get(route('staff.show', $otherStaff->id))
            ->assertNotFound();
    }

    // ─── Edit Staff ──────────────────────────────────────────────────────────

    public function test_hospital_admin_can_edit_staff(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);
        $staff = $this->staffUser($tenant, 'nurse');

        $this->actingAs($admin)
            ->get(route('staff.edit', $staff->id))
            ->assertOk();
    }

    public function test_hospital_admin_can_update_staff(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);
        $staff = $this->staffUser($tenant, 'nurse');

        $this->actingAs($admin)
            ->put(route('staff.update', $staff->id), [
                'name' => 'Updated Name',
                'email' => 'updated@hms.com',
                'role' => 'doctor',
                'is_active' => true,
            ])
            ->assertRedirect(route('staff.index'));

        $this->assertDatabaseHas('users', [
            'id' => $staff->id,
            'name' => 'Updated Name',
            'email' => 'updated@hms.com',
            'role' => 'doctor',
        ]);
    }

    public function test_staff_update_password_is_optional(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);
        $staff = $this->staffUser($tenant);

        $originalPassword = $staff->password;

        $this->actingAs($admin)
            ->put(route('staff.update', $staff->id), [
                'name' => $staff->name,
                'email' => $staff->email,
                'role' => $staff->role,
            ])
            ->assertRedirect(route('staff.index'));

        $staff->refresh();
        $this->assertSame($originalPassword, $staff->password);
    }

    // ─── Deactivate Staff ────────────────────────────────────────────────────

    public function test_hospital_admin_can_deactivate_staff(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);
        $staff = $this->staffUser($tenant);

        $this->actingAs($admin)
            ->delete(route('staff.destroy', $staff->id))
            ->assertRedirect(route('staff.index'));

        $this->assertDatabaseHas('users', [
            'id' => $staff->id,
            'is_active' => false,
        ]);
    }

    public function test_hospital_admin_cannot_deactivate_themselves(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);

        $this->actingAs($admin)
            ->delete(route('staff.destroy', $admin->id))
            ->assertSessionHasErrors('error');

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'is_active' => true,
        ]);
    }

    // ─── Filtering ───────────────────────────────────────────────────────────

    public function test_staff_can_be_filtered_by_role(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);
        $this->staffUser($tenant, 'doctor');
        $this->staffUser($tenant, 'nurse');
        $this->staffUser($tenant, 'nurse');

        $this->actingAs($admin)
            ->get(route('staff.index', ['role' => 'nurse']))
            ->assertOk();
    }

    public function test_staff_can_be_filtered_by_active_status(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);
        $this->staffUser($tenant);
        User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => 'doctor',
            'is_active' => false,
        ]);

        $this->actingAs($admin)
            ->get(route('staff.index', ['is_active' => '0']))
            ->assertOk();
    }

    // ─── Tenant Isolation ────────────────────────────────────────────────────

    public function test_staff_index_only_shows_own_tenant_users(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenantA);
        $this->staffUser($tenantA, 'doctor');
        $this->staffUser($tenantB, 'nurse');

        $this->actingAs($admin)
            ->get(route('staff.index'))
            ->assertOk();
    }

    // ─── Authorization Boundaries ───────────────────────────────────────────

    public function test_super_admin_cannot_access_staff(): void
    {
        $superAdmin = User::factory()->create([
            'role' => Role::SuperAdmin->value,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($superAdmin)
            ->get(route('staff.index'))
            ->assertForbidden();
    }

    public function test_super_admin_cannot_access_patients(): void
    {
        $superAdmin = User::factory()->create([
            'role' => Role::SuperAdmin->value,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($superAdmin)
            ->get(route('patients.index'))
            ->assertForbidden();
    }

    public function test_non_admin_staff_cannot_access_staff_management(): void
    {
        $tenant = Tenant::factory()->create();
        $doctor = User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => Role::Doctor->value,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($doctor)
            ->get(route('staff.index'))
            ->assertForbidden();
    }

    public function test_hospital_admin_cannot_create_another_hospital_admin(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);

        $this->actingAs($admin)
            ->post(route('staff.store'), [
                'name' => 'Rogue Admin',
                'email' => 'rogue@hms.com',
                'password' => 'password123',
                'role' => Role::HospitalAdmin->value,
            ])
            ->assertSessionHasErrors(['role']);
    }
}
