<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Patient;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Stancl\Tenancy\Facades\Tenancy;
use Tests\TestCase;

class Phase2ModulesTest extends TestCase
{
    use RefreshDatabase;

    private function hospitalAdmin(): array
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => Role::HospitalAdmin->value,
            'email_verified_at' => now(),
        ]);

        return [$tenant, $admin];
    }

    private function patientIn(Tenant $tenant): Patient
    {
        Tenancy::initialize($tenant);
        $patient = Patient::factory()->create();
        Tenancy::end();

        return $patient;
    }

    // ─── Patients ────────────────────────────────────────────────────────────

    public function test_guests_cannot_access_patients_index(): void
    {
        $this->get(route('patients.index'))
            ->assertRedirect(route('login'));
    }

    public function test_hospital_admin_can_access_patients_index(): void
    {
        [, $admin] = $this->hospitalAdmin();

        $this->actingAs($admin)
            ->get(route('patients.index'))
            ->assertOk();
    }

    public function test_hospital_admin_can_access_create_patient_page(): void
    {
        [, $admin] = $this->hospitalAdmin();

        $this->actingAs($admin)
            ->get(route('patients.create'))
            ->assertOk();
    }

    public function test_patient_can_be_registered(): void
    {
        [$tenant, $admin] = $this->hospitalAdmin();

        $this->actingAs($admin)
            ->post(route('patients.store'), [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'date_of_birth' => '1985-06-15',
                'gender' => 'male',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('patients', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'male',
            'tenant_id' => $tenant->id,
        ]);
    }

    public function test_patient_store_validation_fails_without_required_fields(): void
    {
        [, $admin] = $this->hospitalAdmin();

        $this->actingAs($admin)
            ->post(route('patients.store'), [])
            ->assertSessionHasErrors(['first_name', 'last_name', 'date_of_birth', 'gender']);
    }

    public function test_patient_show_page_is_accessible(): void
    {
        [$tenant, $admin] = $this->hospitalAdmin();
        $patient = $this->patientIn($tenant);

        $this->actingAs($admin)
            ->get(route('patients.show', $patient))
            ->assertOk();
    }

    public function test_patient_edit_page_is_accessible(): void
    {
        [$tenant, $admin] = $this->hospitalAdmin();
        $patient = $this->patientIn($tenant);

        $this->actingAs($admin)
            ->get(route('patients.edit', $patient))
            ->assertOk();
    }

    public function test_patient_can_be_updated(): void
    {
        [$tenant, $admin] = $this->hospitalAdmin();
        $patient = $this->patientIn($tenant);

        $this->actingAs($admin)
            ->put(route('patients.update', $patient), [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'date_of_birth' => '1990-01-01',
                'gender' => 'female',
            ])
            ->assertRedirect(route('patients.show', $patient));

        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ]);
    }

    public function test_patient_can_be_soft_deleted(): void
    {
        [$tenant, $admin] = $this->hospitalAdmin();
        $patient = $this->patientIn($tenant);

        $this->actingAs($admin)
            ->delete(route('patients.destroy', $patient))
            ->assertRedirect(route('patients.index'));

        $this->assertSoftDeleted('patients', ['id' => $patient->id]);
    }

    // ─── Doctors ─────────────────────────────────────────────────────────────

    public function test_guests_cannot_access_doctors_index(): void
    {
        $this->get(route('doctors.index'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_doctors_index(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('doctors.index'))
            ->assertOk();
    }

    public function test_authenticated_user_can_access_create_doctor_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('doctors.create'))
            ->assertOk();
    }

    // ─── Appointments ────────────────────────────────────────────────────────

    public function test_guests_cannot_access_appointments_index(): void
    {
        $this->get(route('appointments.index'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_appointments_index(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('appointments.index'))
            ->assertOk();
    }

    public function test_authenticated_user_can_access_create_appointment_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('appointments.create'))
            ->assertOk();
    }
}
