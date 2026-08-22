<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\InvoiceStatus;
use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $invoices = Invoice::query()
            ->with(['tenant:id,name,slug', 'payments'])
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('tenant_id'), fn ($q, $t) => $q->where('tenant_id', $t))
            ->latest('issued_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/billing/invoices/index', [
            'invoices' => $invoices,
            'filters' => $request->only(['status', 'tenant_id']),
            'statuses' => InvoiceStatus::cases(),
        ]);
    }

    public function create(): Response
    {
        $tenants = Tenant::select('id', 'name', 'slug', 'plan_id')
            ->with('plan:id,name,slug,price_monthly,price_yearly')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $plans = Plan::where('is_active', true)->orderBy('sort_order')->get();

        return Inertia::render('admin/billing/invoices/create', [
            'tenants' => $tenants,
            'plans' => $plans,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tenant_id' => ['required', 'string', 'exists:tenants,id'],
            'plan_id' => ['nullable', 'string', 'exists:plans,id'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'issued_at' => ['required', 'date'],
            'due_at' => ['required', 'date', 'after_or_equal:issued_at'],
            'notes' => ['nullable', 'string'],
        ]);

        $invoice = Invoice::create([
            'tenant_id' => $validated['tenant_id'],
            'status' => InvoiceStatus::Draft,
            'subtotal' => (int) ($validated['subtotal'] * 100),
            'tax_amount' => (int) (($validated['tax_amount'] ?? 0) * 100),
            'total' => (int) ($validated['total'] * 100),
            'issued_at' => $validated['issued_at'],
            'due_at' => $validated['due_at'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return to_route('admin.billing.invoices.show', $invoice->id)
            ->with('success', "Invoice {$invoice->number} created successfully.");
    }

    public function show(string $id): Response
    {
        $invoice = Invoice::with(['tenant:id,name,slug,email,phone', 'payments.recordedBy:id,name'])
            ->findOrFail($id);

        return Inertia::render('admin/billing/invoices/show', [
            'invoice' => $invoice,
            'statuses' => InvoiceStatus::cases(),
        ]);
    }

    public function edit(string $id): Response
    {
        $invoice = Invoice::with('tenant:id,name,slug')->findOrFail($id);

        $tenants = Tenant::select('id', 'name', 'slug')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/billing/invoices/edit', [
            'invoice' => [
                'id' => $invoice->id,
                'number' => $invoice->number,
                'tenant_id' => $invoice->tenant_id,
                'status' => $invoice->status->value,
                'subtotal' => $invoice->subtotal / 100,
                'tax_amount' => $invoice->tax_amount / 100,
                'total' => $invoice->total / 100,
                'issued_at' => $invoice->issued_at->format('Y-m-d'),
                'due_at' => $invoice->due_at->format('Y-m-d'),
                'notes' => $invoice->notes,
            ],
            'tenants' => $tenants,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        if ($invoice->status !== InvoiceStatus::Draft) {
            return back()->withErrors(['error' => 'Only draft invoices can be edited.']);
        }

        $validated = $request->validate([
            'tenant_id' => ['required', 'string', 'exists:tenants,id'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'issued_at' => ['required', 'date'],
            'due_at' => ['required', 'date', 'after_or_equal:issued_at'],
            'notes' => ['nullable', 'string'],
        ]);

        $invoice->update([
            'tenant_id' => $validated['tenant_id'],
            'subtotal' => (int) ($validated['subtotal'] * 100),
            'tax_amount' => (int) (($validated['tax_amount'] ?? 0) * 100),
            'total' => (int) ($validated['total'] * 100),
            'issued_at' => $validated['issued_at'],
            'due_at' => $validated['due_at'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return to_route('admin.billing.invoices.show', $invoice->id)
            ->with('success', "Invoice {$invoice->number} updated successfully.");
    }

    public function destroy(string $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        if ($invoice->status !== InvoiceStatus::Draft) {
            return back()->withErrors(['error' => 'Only draft invoices can be deleted.']);
        }

        if ($invoice->payments()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete an invoice with recorded payments.']);
        }

        $number = $invoice->number;
        $invoice->delete();

        return to_route('admin.billing.invoices.index')
            ->with('success', "Invoice {$number} deleted successfully.");
    }

    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(array_column(InvoiceStatus::cases(), 'value'))],
        ]);

        $newStatus = InvoiceStatus::from($validated['status']);

        if ($newStatus === InvoiceStatus::Paid && ! $invoice->paid_at) {
            $invoice->paid_at = now();
        }

        $invoice->status = $newStatus;
        $invoice->save();

        return back()->with('success', "Invoice {$invoice->number} marked as {$newStatus->label()}.");
    }

    public function recordPayment(Request $request, string $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.($invoice->amountDue() / 100)],
            'method' => ['required', 'string', Rule::in(['bank_transfer', 'cash', 'check', 'other'])],
            'reference' => ['nullable', 'string', 'max:255'],
            'paid_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        Payment::create([
            'invoice_id' => $invoice->id,
            'tenant_id' => $invoice->tenant_id,
            'amount' => (int) ($validated['amount'] * 100),
            'method' => $validated['method'],
            'reference' => $validated['reference'] ?? null,
            'paid_at' => $validated['paid_at'],
            'notes' => $validated['notes'] ?? null,
            'recorded_by' => auth()->id(),
        ]);

        if ($invoice->fresh()->isFullyPaid()) {
            $invoice->status = InvoiceStatus::Paid;
            $invoice->paid_at = $validated['paid_at'];
            $invoice->save();
        }

        return back()->with('success', 'Payment recorded successfully.');
    }
}
