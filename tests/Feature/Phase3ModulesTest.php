<?php

namespace Tests\Feature;

use App\Models\Admission;
use App\Models\Bed;
use App\Models\ImagingType;
use App\Models\LabOrder;
use App\Models\MedicalRecord;
use App\Models\RadiologyOrder;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase3ModulesTest extends TestCase
{
    use RefreshDatabase;

    protected function afterRefreshingDatabase(): void
    {
        $this->artisan('migrate', [
            '--path' => 'database/migrations/tenant',
            '--realpath' => false,
        ]);
    }

    // ─── EMR ─────────────────────────────────────────────────────────────────

    public function test_guests_cannot_access_emr_index(): void
    {
        $this->get(route('emr.index'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_emr_index(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('emr.index'))
            ->assertOk();
    }

    public function test_authenticated_user_can_access_create_emr_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('emr.create'))
            ->assertOk();
    }

    public function test_medical_record_can_be_created(): void
    {
        $user = User::factory()->create();
        $record = MedicalRecord::factory()->create();

        $this->assertDatabaseHas('medical_records', [
            'id' => $record->id,
            'status' => 'draft',
        ]);
    }

    public function test_medical_record_show_page_is_accessible(): void
    {
        $user = User::factory()->create();
        $record = MedicalRecord::factory()->create();

        $this->actingAs($user)
            ->get(route('emr.show', $record))
            ->assertOk();
    }

    public function test_medical_record_edit_page_is_accessible(): void
    {
        $user = User::factory()->create();
        $record = MedicalRecord::factory()->create();

        $this->actingAs($user)
            ->get(route('emr.edit', $record))
            ->assertOk();
    }

    public function test_medical_record_can_be_updated(): void
    {
        $user = User::factory()->create();
        $record = MedicalRecord::factory()->create();

        $this->actingAs($user)
            ->put(route('emr.update', $record), [
                'visit_date' => '2026-06-17',
                'visit_type' => 'outpatient',
                'status' => 'finalized',
            ])
            ->assertRedirect(route('emr.show', $record));

        $this->assertDatabaseHas('medical_records', [
            'id' => $record->id,
            'status' => 'finalized',
        ]);
    }

    public function test_medical_record_store_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('emr.store'), [])
            ->assertSessionHasErrors(['patient_id', 'doctor_id', 'visit_date', 'visit_type']);
    }

    // ─── Lab Orders ──────────────────────────────────────────────────────────

    public function test_guests_cannot_access_lab_index(): void
    {
        $this->get(route('lab.index'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_lab_index(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('lab.index'))
            ->assertOk();
    }

    public function test_authenticated_user_can_access_create_lab_order_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('lab.create'))
            ->assertOk();
    }

    public function test_lab_order_can_be_created_via_factory(): void
    {
        $order = LabOrder::factory()->create();

        $this->assertDatabaseHas('lab_orders', [
            'id' => $order->id,
            'status' => 'ordered',
        ]);
    }

    public function test_lab_order_show_page_is_accessible(): void
    {
        $user = User::factory()->create();
        $order = LabOrder::factory()->create();

        $this->actingAs($user)
            ->get(route('lab.show', $order))
            ->assertOk();
    }

    public function test_lab_order_status_can_be_updated(): void
    {
        $user = User::factory()->create();
        $order = LabOrder::factory()->create(['status' => 'ordered']);

        $this->actingAs($user)
            ->put(route('lab.update', $order), [
                'status' => 'sample_collected',
                'sample_collected_at' => now()->toDateTimeString(),
            ])
            ->assertRedirect(route('lab.show', $order));

        $this->assertDatabaseHas('lab_orders', [
            'id' => $order->id,
            'status' => 'sample_collected',
        ]);
    }

    // ─── Radiology Orders ────────────────────────────────────────────────────

    public function test_guests_cannot_access_radiology_index(): void
    {
        $this->get(route('radiology.index'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_radiology_index(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('radiology.index'))
            ->assertOk();
    }

    public function test_authenticated_user_can_access_create_radiology_order_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('radiology.create'))
            ->assertOk();
    }

    public function test_radiology_order_can_be_created_via_factory(): void
    {
        $order = RadiologyOrder::factory()->create();

        $this->assertDatabaseHas('radiology_orders', [
            'id' => $order->id,
            'status' => 'ordered',
        ]);
    }

    public function test_radiology_order_show_page_is_accessible(): void
    {
        $user = User::factory()->create();
        $order = RadiologyOrder::factory()->create();

        $this->actingAs($user)
            ->get(route('radiology.show', $order))
            ->assertOk();
    }

    public function test_radiology_order_can_be_updated_with_report(): void
    {
        $user = User::factory()->create();
        $order = RadiologyOrder::factory()->create(['status' => 'in_progress']);

        $this->actingAs($user)
            ->put(route('radiology.update', $order), [
                'status' => 'completed',
                'completed_at' => now()->toDateTimeString(),
                'report' => 'No acute cardiopulmonary findings.',
            ])
            ->assertRedirect(route('radiology.show', $order));

        $this->assertDatabaseHas('radiology_orders', [
            'id' => $order->id,
            'status' => 'completed',
        ]);
    }

    // ─── Inpatient / Admissions ───────────────────────────────────────────────

    public function test_guests_cannot_access_inpatient_index(): void
    {
        $this->get(route('inpatient.index'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_inpatient_index(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('inpatient.index'))
            ->assertOk();
    }

    public function test_authenticated_user_can_access_admit_patient_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('inpatient.create'))
            ->assertOk();
    }

    public function test_admission_can_be_created_via_factory(): void
    {
        $admission = Admission::factory()->create();

        $this->assertDatabaseHas('admissions', [
            'id' => $admission->id,
            'status' => 'admitted',
        ]);
    }

    public function test_admission_show_page_is_accessible(): void
    {
        $user = User::factory()->create();
        $admission = Admission::factory()->create();

        $this->actingAs($user)
            ->get(route('inpatient.show', $admission))
            ->assertOk();
    }

    public function test_admission_can_be_discharged(): void
    {
        $user = User::factory()->create();
        $admission = Admission::factory()->create(['status' => 'admitted']);

        $this->actingAs($user)
            ->put(route('inpatient.update', $admission), [
                'status' => 'discharged',
                'discharged_at' => now()->toDateTimeString(),
                'discharge_condition' => 'recovered',
                'discharge_summary' => 'Patient recovered fully.',
            ])
            ->assertRedirect(route('inpatient.show', $admission));

        $this->assertDatabaseHas('admissions', [
            'id' => $admission->id,
            'status' => 'discharged',
        ]);
    }

    // ─── Pharmacy ────────────────────────────────────────────────────────────

    public function test_guests_cannot_access_pharmacy_index(): void
    {
        $this->get(route('pharmacy.index'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_pharmacy_index(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('pharmacy.index'))
            ->assertOk();
    }
}
