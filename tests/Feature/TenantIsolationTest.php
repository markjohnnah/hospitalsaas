<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Stancl\Tenancy\Facades\Tenancy;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Tenancy::end();

        parent::tearDown();
    }

    public function test_patient_tenant_id_is_auto_stamped_when_tenancy_is_initialized(): void
    {
        $tenant = Tenant::factory()->create();

        Tenancy::initialize($tenant);

        $patient = Patient::factory()->create();

        Tenancy::end();

        $this->assertSame($tenant->id, $patient->tenant_id);
    }

    public function test_patients_are_scoped_to_the_initialized_tenant(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();

        Tenancy::initialize($tenantA);
        $patientA = Patient::factory()->create();
        Tenancy::end();

        Tenancy::initialize($tenantB);
        $patientB = Patient::factory()->create();
        Tenancy::end();

        Tenancy::initialize($tenantA);
        $this->assertSame([$patientA->id], Patient::pluck('id')->all());
        Tenancy::end();

        Tenancy::initialize($tenantB);
        $this->assertSame([$patientB->id], Patient::pluck('id')->all());
        Tenancy::end();
    }
}
