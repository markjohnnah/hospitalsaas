<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\InvoiceStatus;
use App\Enums\Role;
use App\Enums\SubscriptionStatus;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        return User::factory()->create([
            'role' => Role::SuperAdmin->value,
            'email_verified_at' => now(),
        ]);
    }

    private function hospitalAdmin(Tenant $tenant): User
    {
        return User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => Role::HospitalAdmin->value,
            'email_verified_at' => now(),
        ]);
    }

    // ─── Plan Model ──────────────────────────────────────────────────────────

    public function test_plan_has_features(): void
    {
        $plan = Plan::factory()->create([
            'features' => ['emr', 'lab', 'radiology'],
        ]);

        $this->assertTrue($plan->hasFeature('emr'));
        $this->assertTrue($plan->hasFeature('lab'));
        $this->assertFalse($plan->hasFeature('billing'));
    }

    public function test_plan_with_null_features_returns_false(): void
    {
        $plan = Plan::factory()->create(['features' => null]);

        $this->assertFalse($plan->hasFeature('emr'));
    }

    public function test_plan_formats_prices(): void
    {
        $plan = Plan::factory()->create([
            'price_monthly' => 29900,
            'price_yearly' => 299000,
        ]);

        $this->assertSame('299.00', $plan->priceMonthlyFormatted());
        $this->assertSame('2,990.00', $plan->priceYearlyFormatted());
    }

    // ─── Tenant Subscription ─────────────────────────────────────────────────

    public function test_tenant_can_be_on_trial(): void
    {
        $plan = Plan::factory()->free()->create();
        $tenant = Tenant::factory()->trialing()->withPlan($plan)->create();

        $this->assertTrue($tenant->onTrial());
        $this->assertFalse($tenant->isSubscribed());
    }

    public function test_tenant_with_expired_trial_is_not_on_trial(): void
    {
        $plan = Plan::factory()->free()->create();
        $tenant = Tenant::factory()->create([
            'plan_id' => $plan->id,
            'subscription_status' => SubscriptionStatus::Trialing,
            'trial_ends_at' => now()->subDay(),
        ]);

        $this->assertFalse($tenant->onTrial());
    }

    public function test_active_tenant_is_subscribed(): void
    {
        $plan = Plan::factory()->create();
        $tenant = Tenant::factory()->active()->withPlan($plan)->create();

        $this->assertTrue($tenant->isSubscribed());
        $this->assertFalse($tenant->onTrial());
    }

    // ─── Invoice Model ───────────────────────────────────────────────────────

    public function test_invoice_generates_number_on_creation(): void
    {
        $invoice = Invoice::factory()->create();

        $this->assertNotNull($invoice->number);
        $this->assertStringStartsWith('INV-', $invoice->number);
    }

    public function test_invoice_amount_due_calculates_correctly(): void
    {
        $invoice = Invoice::factory()->create([
            'total' => 100000,
            'status' => InvoiceStatus::Sent,
        ]);

        $this->assertSame(100000, $invoice->amountDue());

        Payment::factory()->forInvoice($invoice->id)->amount(40000)->create();
        $invoice->refresh();

        $this->assertSame(60000, $invoice->amountDue());
    }

    public function test_invoice_is_fully_paid_when_payments_equal_total(): void
    {
        $invoice = Invoice::factory()->create([
            'total' => 100000,
            'status' => InvoiceStatus::Sent,
        ]);

        $this->assertFalse($invoice->isFullyPaid());

        Payment::factory()->forInvoice($invoice->id)->amount(100000)->create();
        $invoice->refresh();

        $this->assertTrue($invoice->isFullyPaid());
    }

    public function test_invoice_formats_amounts(): void
    {
        $invoice = Invoice::factory()->create([
            'subtotal' => 50000,
            'total' => 58000,
        ]);

        $this->assertSame('500.00', $invoice->formattedSubtotal());
        $this->assertSame('580.00', $invoice->formattedTotal());
    }

    // ─── Payment Model ───────────────────────────────────────────────────────

    public function test_payment_belongs_to_invoice(): void
    {
        $invoice = Invoice::factory()->create();
        $payment = Payment::factory()->forInvoice($invoice->id)->create();

        $this->assertNotNull($payment->invoice);
        $this->assertSame($invoice->id, $payment->invoice->id);
    }

    public function test_payment_belongs_to_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $invoice = Invoice::factory()->forTenant($tenant->id)->create();
        $payment = Payment::factory()->forInvoice($invoice->id)->create();

        $this->assertSame($tenant->id, $payment->tenant->id);
    }

    public function test_payment_formats_amount(): void
    {
        $payment = Payment::factory()->create(['amount' => 75000]);

        $this->assertSame('750.00', $payment->formattedAmount());
    }

    // ─── Admin: Plans CRUD ───────────────────────────────────────────────────

    public function test_guests_cannot_access_plans(): void
    {
        $this->get(route('admin.billing.plans.index'))
            ->assertRedirect(route('login'));
    }

    public function test_non_super_admin_cannot_access_plans(): void
    {
        $user = User::factory()->create(['role' => Role::HospitalAdmin->value]);
        $this->actingAs($user);

        $this->get(route('admin.billing.plans.index'))->assertForbidden();
    }

    public function test_super_admin_can_view_plans(): void
    {
        $this->actingAs($this->superAdmin());
        Plan::factory()->count(3)->create();

        $this->get(route('admin.billing.plans.index'))
            ->assertOk();
    }

    public function test_super_admin_can_create_plan(): void
    {
        $this->actingAs($this->superAdmin());

        $this->post(route('admin.billing.plans.store'), [
            'name' => 'Gold Plan',
            'slug' => 'gold',
            'description' => 'A premium plan.',
            'price_monthly' => 199.00,
            'price_yearly' => 1990.00,
            'max_users' => 20,
            'max_patients' => 2000,
            'features' => ['emr', 'lab', 'radiology', 'billing'],
            'sort_order' => 5,
            'is_active' => true,
        ])->assertRedirect(route('admin.billing.plans.index'));

        $this->assertDatabaseHas('plans', [
            'name' => 'Gold Plan',
            'slug' => 'gold',
            'price_monthly' => 19900,
            'price_yearly' => 199000,
        ]);
    }

    public function test_super_admin_can_update_plan(): void
    {
        $this->actingAs($this->superAdmin());
        $plan = Plan::factory()->create(['name' => 'Old Name']);

        $this->put(route('admin.billing.plans.update', $plan->id), [
            'name' => 'Updated Plan',
            'slug' => $plan->slug,
            'price_monthly' => 299.00,
            'price_yearly' => 2990.00,
        ])->assertRedirect(route('admin.billing.plans.index'));

        $this->assertDatabaseHas('plans', [
            'id' => $plan->id,
            'name' => 'Updated Plan',
        ]);
    }

    public function test_super_admin_can_delete_plan_without_tenants(): void
    {
        $this->actingAs($this->superAdmin());
        $plan = Plan::factory()->create();

        $this->delete(route('admin.billing.plans.destroy', $plan->id))
            ->assertRedirect(route('admin.billing.plans.index'));

        $this->assertDatabaseMissing('plans', ['id' => $plan->id]);
    }

    public function test_cannot_delete_plan_with_active_subscribers(): void
    {
        $this->actingAs($this->superAdmin());
        $plan = Plan::factory()->create();
        Tenant::factory()->withPlan($plan)->create();

        $this->delete(route('admin.billing.plans.destroy', $plan->id))
            ->assertRedirect();

        $this->assertDatabaseHas('plans', ['id' => $plan->id]);
    }

    // ─── Admin: Invoices ─────────────────────────────────────────────────────

    public function test_guests_cannot_access_invoices(): void
    {
        $this->get(route('admin.billing.invoices.index'))
            ->assertRedirect(route('login'));
    }

    public function test_super_admin_can_view_invoices(): void
    {
        $this->actingAs($this->superAdmin());
        Invoice::factory()->count(5)->create();

        $this->get(route('admin.billing.invoices.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/billing/invoices/index'));
    }

    public function test_super_admin_can_create_invoice(): void
    {
        $this->actingAs($this->superAdmin());
        $tenant = Tenant::factory()->create();

        $this->post(route('admin.billing.invoices.store'), [
            'tenant_id' => $tenant->id,
            'subtotal' => 100.00,
            'tax_amount' => 16.00,
            'total' => 116.00,
            'issued_at' => '2026-07-01',
            'due_at' => '2026-07-31',
        ])->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'tenant_id' => $tenant->id,
            'total' => 11600,
            'status' => 'draft',
        ]);
    }

    public function test_super_admin_can_view_invoice(): void
    {
        $this->actingAs($this->superAdmin());
        $invoice = Invoice::factory()->create();

        $this->get(route('admin.billing.invoices.show', $invoice->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/billing/invoices/show'));
    }

    public function test_invoice_status_can_be_updated(): void
    {
        $this->actingAs($this->superAdmin());
        $invoice = Invoice::factory()->draft()->create();

        $this->patch(route('admin.billing.invoices.status', $invoice->id), [
            'status' => 'sent',
        ])->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'sent',
        ]);
    }

    public function test_marking_invoice_paid_sets_paid_at(): void
    {
        $this->actingAs($this->superAdmin());
        $invoice = Invoice::factory()->sent()->create(['paid_at' => null]);

        $this->patch(route('admin.billing.invoices.status', $invoice->id), [
            'status' => 'paid',
        ])->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'paid',
        ]);
        $this->assertNotNull(Invoice::find($invoice->id)->paid_at);
    }

    public function test_payment_can_be_recorded(): void
    {
        $this->actingAs($this->superAdmin());
        $invoice = Invoice::factory()->sent()->create(['total' => 100000]);

        $this->post(route('admin.billing.invoices.payments.store', $invoice->id), [
            'amount' => 500.00,
            'method' => 'bank_transfer',
            'reference' => 'REF-001',
            'paid_at' => '2026-07-25',
        ])->assertRedirect();

        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoice->id,
            'amount' => 50000,
            'method' => 'bank_transfer',
        ]);
    }

    public function test_full_payment_marks_invoice_paid(): void
    {
        $this->actingAs($this->superAdmin());
        $invoice = Invoice::factory()->sent()->create(['total' => 100000]);

        $this->post(route('admin.billing.invoices.payments.store', $invoice->id), [
            'amount' => 1000.00,
            'method' => 'bank_transfer',
            'paid_at' => '2026-07-25',
        ])->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'paid',
        ]);
    }

    // ─── Admin: Invoice Edit / Update / Delete ───────────────────────────────

    public function test_super_admin_can_view_edit_invoice_page(): void
    {
        $this->actingAs($this->superAdmin());
        $invoice = Invoice::factory()->draft()->create();

        $this->get(route('admin.billing.invoices.edit', $invoice->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/billing/invoices/edit'));
    }

    public function test_draft_invoice_can_be_updated(): void
    {
        $this->actingAs($this->superAdmin());
        $tenant = Tenant::factory()->create();
        $invoice = Invoice::factory()->draft()->create([
            'subtotal' => 50000,
            'total' => 58000,
        ]);

        $this->put(route('admin.billing.invoices.update', $invoice->id), [
            'tenant_id' => $tenant->id,
            'subtotal' => 100.00,
            'tax_amount' => 16.00,
            'total' => 116.00,
            'issued_at' => '2026-07-01',
            'due_at' => '2026-07-31',
        ])->assertRedirect(route('admin.billing.invoices.show', $invoice->id));

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'subtotal' => 10000,
            'tax_amount' => 1600,
            'total' => 11600,
        ]);
    }

    public function test_non_draft_invoice_cannot_be_updated(): void
    {
        $this->actingAs($this->superAdmin());
        $tenant = Tenant::factory()->create();
        $invoice = Invoice::factory()->sent()->create(['total' => 58000]);

        $this->put(route('admin.billing.invoices.update', $invoice->id), [
            'tenant_id' => $tenant->id,
            'subtotal' => 200.00,
            'tax_amount' => 32.00,
            'total' => 232.00,
            'issued_at' => '2026-07-01',
            'due_at' => '2026-07-31',
        ])->assertSessionHasErrors('error');

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'total' => 58000,
        ]);
    }

    public function test_draft_invoice_can_be_deleted(): void
    {
        $this->actingAs($this->superAdmin());
        $invoice = Invoice::factory()->draft()->create();

        $this->delete(route('admin.billing.invoices.destroy', $invoice->id))
            ->assertRedirect(route('admin.billing.invoices.index'));

        $this->assertDatabaseMissing('invoices', ['id' => $invoice->id]);
    }

    public function test_non_draft_invoice_cannot_be_deleted(): void
    {
        $this->actingAs($this->superAdmin());
        $invoice = Invoice::factory()->sent()->create();

        $this->delete(route('admin.billing.invoices.destroy', $invoice->id))
            ->assertSessionHasErrors('error');

        $this->assertDatabaseHas('invoices', ['id' => $invoice->id]);
    }

    public function test_invoice_with_payments_cannot_be_deleted(): void
    {
        $this->actingAs($this->superAdmin());
        $invoice = Invoice::factory()->draft()->create(['total' => 100000]);
        Payment::factory()->forInvoice($invoice->id)->amount(50000)->create();

        $this->delete(route('admin.billing.invoices.destroy', $invoice->id))
            ->assertSessionHasErrors('error');

        $this->assertDatabaseHas('invoices', ['id' => $invoice->id]);
    }

    // ─── Admin: Subscriptions ────────────────────────────────────────────────

    public function test_guests_cannot_access_subscriptions(): void
    {
        $this->get(route('admin.billing.subscriptions.index'))
            ->assertRedirect(route('login'));
    }

    public function test_super_admin_can_view_subscriptions(): void
    {
        $this->actingAs($this->superAdmin());
        Tenant::factory()->count(3)->withPlan(Plan::factory()->create())->create();

        $this->get(route('admin.billing.subscriptions.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/billing/subscriptions/index'));
    }

    public function test_subscription_can_be_updated(): void
    {
        $this->actingAs($this->superAdmin());
        $newPlan = Plan::factory()->create();
        $tenant = Tenant::factory()->withPlan(Plan::factory()->create())->create();

        $this->put(route('admin.billing.subscriptions.update', $tenant->id), [
            'plan_id' => $newPlan->id,
            'subscription_status' => SubscriptionStatus::Active->value,
        ])->assertRedirect();

        $this->assertDatabaseHas('tenants', [
            'id' => $tenant->id,
            'plan_id' => $newPlan->id,
            'subscription_status' => SubscriptionStatus::Active->value,
        ]);
    }

    public function test_trial_can_be_extended(): void
    {
        $this->actingAs($this->superAdmin());
        $tenant = Tenant::factory()->trialing()->create([
            'trial_ends_at' => now()->addDays(3),
        ]);
        $originalTrialEnd = $tenant->trial_ends_at;

        $this->post(route('admin.billing.subscriptions.extend-trial', $tenant->id), [
            'days' => 14,
        ])->assertRedirect();

        $tenant->refresh();
        $this->assertTrue($tenant->trial_ends_at->gt($originalTrialEnd));
        $this->assertSame(SubscriptionStatus::Trialing, $tenant->subscription_status);
    }

    // ─── Tenant Subscription Helper Methods ───────────────────────────────────

    public function test_tenant_subscription_helpers(): void
    {
        $plan = Plan::factory()->create();
        $tenant = Tenant::factory()->active()->withPlan($plan)->create([
            'trial_ends_at' => null,
        ]);

        $this->assertTrue($tenant->isSubscribed());
        $this->assertFalse($tenant->onTrial());
        $this->assertNotNull($tenant->plan);
        $this->assertSame($plan->id, $tenant->plan->id);
    }

    public function test_tenant_has_invoices_and_payments(): void
    {
        $tenant = Tenant::factory()->active()->create();
        Invoice::factory()->forTenant($tenant->id)->count(3)->create();
        Payment::factory()->forInvoice(
            Invoice::where('tenant_id', $tenant->id)->first()->id
        )->create();

        $this->assertCount(3, $tenant->invoices);
        $this->assertCount(1, $tenant->payments);
    }

    // ─── Invoice Filtering ───────────────────────────────────────────────────

    public function test_invoices_can_be_filtered_by_status(): void
    {
        $this->actingAs($this->superAdmin());

        Invoice::factory()->paid()->count(2)->create();
        Invoice::factory()->overdue()->count(3)->create();

        $this->get(route('admin.billing.invoices.index', ['status' => 'overdue']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('invoices'));
    }

    // ─── Plan validation ─────────────────────────────────────────────────────

    public function test_plan_store_validates_required_fields(): void
    {
        $this->actingAs($this->superAdmin());

        $this->post(route('admin.billing.plans.store'), [])
            ->assertSessionHasErrors(['name', 'slug', 'price_monthly', 'price_yearly']);
    }

    public function test_invoice_store_validates_required_fields(): void
    {
        $this->actingAs($this->superAdmin());

        $this->post(route('admin.billing.invoices.store'), [])
            ->assertSessionHasErrors(['tenant_id', 'subtotal', 'total', 'issued_at', 'due_at']);
    }

    // ─── Payment validation ──────────────────────────────────────────────────

    public function test_payment_cannot_exceed_amount_due(): void
    {
        $this->actingAs($this->superAdmin());
        $invoice = Invoice::factory()->sent()->create(['total' => 50000]);

        $this->post(route('admin.billing.invoices.payments.store', $invoice->id), [
            'amount' => 600.00,
            'method' => 'bank_transfer',
            'paid_at' => '2026-07-25',
        ])->assertSessionHasErrors(['amount']);
    }
}
