<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use Inertia\Inertia;
use Inertia\Response;
use Stancl\Tenancy\Facades\Tenancy;

class TenantBillingController extends Controller
{
    public function index(): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $stats = Tenancy::central(function () use ($tenantId) {
            return [
                'total_invoices' => Invoice::where('tenant_id', $tenantId)->count(),
                'paid_invoices' => Invoice::where('tenant_id', $tenantId)->where('status', InvoiceStatus::Paid)->count(),
                'overdue_invoices' => Invoice::where('tenant_id', $tenantId)->where('status', InvoiceStatus::Overdue)->count(),
                'draft_invoices' => Invoice::where('tenant_id', $tenantId)->where('status', InvoiceStatus::Draft)->count(),
                'total_revenue' => Invoice::where('tenant_id', $tenantId)->where('status', InvoiceStatus::Paid)->sum('total'),
                'pending_amount' => Invoice::where('tenant_id', $tenantId)->whereIn('status', [InvoiceStatus::Sent->value, InvoiceStatus::Overdue->value])->sum('total'),
            ];
        });

        $invoices = Invoice::where('tenant_id', $tenantId)
            ->with('payments')
            ->latest('issued_at')
            ->paginate(15);

        return Inertia::render('billing/index', [
            'stats' => $stats,
            'invoices' => $invoices,
        ]);
    }

    public function show(string $id): Response
    {
        $tenantId = auth()->user()->tenant_id;
        $invoice = Invoice::where('tenant_id', $tenantId)
            ->with('payments')
            ->findOrFail($id);

        return Inertia::render('billing/show', [
            'invoice' => $invoice,
        ]);
    }
}
