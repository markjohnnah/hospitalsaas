<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase2ModulesTest extends TestCase
{
    use RefreshDatabase;

    protected function afterRefreshingDatabase()
    {
        $this->artisan('migrate', [
            '--path' => 'database/migrations/tenant',
            '--realpath' => false,
        ]);
    }

    // ─── Patients ────────────────────────────────────────────────────────────

    public function test_guests_cannot_access_patients_index(): void
    {
        $this->get(route('patients.index'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_patients_index(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('patients.index'))
            ->assertOk();
    }

    public function test_authenticated_user_can_access_create_patient_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('patients.create'))
            ->assertOk();
    }

    public function test_patient_can_be_registered(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
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
        ]);
    }

    public function test_patient_store_validation_fails_without_required_fields(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('patients.store'), [])
            ->assertSessionHasErrors(['first_name', 'last_name', 'date_of_birth', 'gender']);
    }

    public function test_patient_show_page_is_accessible(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->get(route('patients.show', $patient))
            ->assertOk();
    }

    public function test_patient_edit_page_is_accessible(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->get(route('patients.edit', $patient))
            ->assertOk();
    }

    public function test_patient_can_be_updated(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $this->actingAs($user)
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
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $this->actingAs($user)
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
