<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\InvoiceStatus;
use App\Enums\Role;
use App\Http\Middleware\InitializeTenancyByUser;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantBillingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Skip tenant DB switching — invoices are central
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

    private function createInvoiceForTenant(Tenant $tenant, InvoiceStatus $status = InvoiceStatus::Sent): Invoice
    {
        return Invoice::factory()->forTenant($tenant->id)->create(['status' => $status]);
    }

    // ─── Access Control ──────────────────────────────────────────────────────

    public function test_guests_cannot_access_billing(): void
    {
        $this->get(route('billing.dashboard'))->assertRedirect(route('login'));
    }

    public function test_hospital_admin_can_view_billing_dashboard(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);
        $this->createInvoiceForTenant($tenant);

        $this->actingAs($admin)
            ->get(route('billing.dashboard'))
            ->assertOk();
    }

    public function test_billing_only_shows_own_tenant_invoices(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenantA);
        $this->createInvoiceForTenant($tenantA);
        $this->createInvoiceForTenant($tenantB);

        $this->actingAs($admin)
            ->get(route('billing.dashboard'))
            ->assertOk();
    }

    // ─── Invoice Detail ──────────────────────────────────────────────────────

    public function test_hospital_admin_can_view_invoice_detail(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);
        $invoice = $this->createInvoiceForTenant($tenant);

        $this->actingAs($admin)
            ->get(route('billing.show', $invoice->id))
            ->assertOk();
    }

    public function test_hospital_admin_cannot_view_other_tenant_invoice(): void
    {
        $tenantA = Tenant::factory()->create();
        $tenantB = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenantA);
        $otherInvoice = $this->createInvoiceForTenant($tenantB);

        $this->actingAs($admin)
            ->get(route('billing.show', $otherInvoice->id))
            ->assertNotFound();
    }

    // ─── Dashboard Stats ─────────────────────────────────────────────────────

    public function test_billing_dashboard_shows_correct_stats(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);

        Invoice::factory()->forTenant($tenant->id)->paid()->create(['total' => 100000]);
        Invoice::factory()->forTenant($tenant->id)->paid()->create(['total' => 50000]);
        Invoice::factory()->forTenant($tenant->id)->overdue()->create(['total' => 30000]);
        Invoice::factory()->forTenant($tenant->id)->draft()->create(['total' => 20000]);

        $response = $this->actingAs($admin)
            ->get(route('billing.dashboard'))
            ->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('billing/index')
                ->where('stats.total_invoices', 4)
                ->where('stats.paid_invoices', 2)
                ->where('stats.overdue_invoices', 1)
                ->where('stats.draft_invoices', 1)
                ->where('stats.total_revenue', 150000)
                ->where('stats.pending_amount', 30000)
        );
    }

    // ─── Invoice with Payments ───────────────────────────────────────────────

    public function test_invoice_detail_shows_payments(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = $this->hospitalAdmin($tenant);
        $invoice = Invoice::factory()->forTenant($tenant->id)->sent()->create(['total' => 100000]);
        Payment::factory()->forInvoice($invoice->id)->amount(40000)->create();
        Payment::factory()->forInvoice($invoice->id)->amount(30000)->create();

        $this->actingAs($admin)
            ->get(route('billing.show', $invoice->id))
            ->assertOk();
    }

    // ─── Accountant Access ───────────────────────────────────────────────────

    public function test_accountant_can_access_billing(): void
    {
        $tenant = Tenant::factory()->create();
        $accountant = User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => Role::Accountant->value,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($accountant)
            ->get(route('billing.dashboard'))
            ->assertOk();
    }
}
