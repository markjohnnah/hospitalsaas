<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\InvoiceStatus;
use App\Enums\Role;
use App\Models\Admission;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Stancl\Tenancy\Facades\Tenancy;

class ReportsController extends Controller
{
    public function index(): Response
    {
        $tenantId = auth()->user()->tenant_id;
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        return Inertia::render('reports/index', [
            'stats' => $this->computeStats($tenantId, $today, $thisMonth, $lastMonth),
        ]);
    }

    private function computeStats(string $tenantId, Carbon $today, Carbon $thisMonth, Carbon $lastMonth): array
    {
        // ---- Tenant DB queries (MUST run before any Tenancy::central()) ----

        // Patient stats
        $totalPatients = Patient::count();
        $newThisMonth = Patient::where('created_at', '>=', $thisMonth)->count();
        $newLastMonth = Patient::whereBetween('created_at', [$lastMonth, $thisMonth->copy()->subSecond()])->count();

        // Appointment stats
        $totalAppointments = Appointment::count();
        $todayAppointments = Appointment::whereDate('scheduled_at', $today)->count();
        $completedAppointments = Appointment::where('status', 'completed')->count();
        $pendingAppointments = Appointment::where('status', 'pending')->count();

        // Admission stats
        $activeAdmissions = Admission::where('status', 'admitted')->count();
        $dischargedThisMonth = Admission::where('status', 'discharged')
            ->where('discharged_at', '>=', $thisMonth)
            ->count();

        // Doctor count (tenant DB)
        $totalDoctors = Doctor::count();

        // Appointment trend (last 6 months) - tenant DB
        $appointmentTrend = collect(range(5, 0))->map(function ($monthsAgo) {
            $month = Carbon::now()->subMonths($monthsAgo)->startOfMonth();

            return [
                'month' => $month->format('M Y'),
                'total' => Appointment::whereBetween('created_at', [
                    $month->copy(),
                    $month->copy()->endOfMonth(),
                ])->count(),
            ];
        })->values();

        // Patient demographics - tenant DB
        $genderDistribution = Patient::selectRaw('gender, count(*) as count')
            ->groupBy('gender')
            ->get()
            ->map(fn ($r) => ['gender' => ucfirst($r->gender), 'count' => $r->count])
            ->values();

        $bloodTypeDistribution = Patient::selectRaw('blood_type, count(*) as count')
            ->whereNotNull('blood_type')
            ->groupBy('blood_type')
            ->orderBy('blood_type')
            ->get()
            ->map(fn ($r) => ['type' => $r->blood_type, 'count' => $r->count])
            ->values();

        // ---- Central DB queries ----
        $centralStats = Tenancy::central(function () use ($tenantId, $thisMonth) {
            return [
                'total_staff' => User::where('tenant_id', $tenantId)
                    ->whereNot('role', Role::Patient->value)->count(),
                'staff_breakdown' => User::where('tenant_id', $tenantId)
                    ->whereNot('role', Role::Patient->value)
                    ->selectRaw('role, count(*) as count')
                    ->groupBy('role')
                    ->get()
                    ->map(fn ($r) => ['role' => Role::tryFrom($r->role)?->label() ?? $r->role, 'count' => $r->count])
                    ->values(),
                'total_revenue' => Invoice::where('tenant_id', $tenantId)
                    ->where('status', InvoiceStatus::Paid)->sum('total'),
                'revenue_this_month' => Invoice::where('tenant_id', $tenantId)
                    ->where('status', InvoiceStatus::Paid)
                    ->where('paid_at', '>=', $thisMonth)
                    ->sum('total'),
                'outstanding' => Invoice::where('tenant_id', $tenantId)
                    ->whereIn('status', [InvoiceStatus::Sent->value, InvoiceStatus::Overdue->value])
                    ->sum('total'),
                'total_invoices' => Invoice::where('tenant_id', $tenantId)->count(),
                'overdue_invoices' => Invoice::where('tenant_id', $tenantId)
                    ->where('status', InvoiceStatus::Overdue)->count(),
            ];
        });

        return [
            'total_patients' => $totalPatients,
            'new_patients_this_month' => $newThisMonth,
            'patient_growth' => $newLastMonth > 0
                ? round((($newThisMonth - $newLastMonth) / $newLastMonth) * 100, 1)
                : ($newThisMonth > 0 ? 100 : 0),
            'today_appointments' => $todayAppointments,
            'pending_appointments' => $pendingAppointments,
            'completion_rate' => $totalAppointments > 0
                ? round(($completedAppointments / $totalAppointments) * 100, 1)
                : 0,
            'active_admissions' => $activeAdmissions,
            'discharged_this_month' => $dischargedThisMonth,
            'total_staff' => $centralStats['total_staff'],
            'total_doctors' => $totalDoctors,
            'staff_breakdown' => $centralStats['staff_breakdown'],
            'total_revenue' => $centralStats['total_revenue'],
            'revenue_this_month' => $centralStats['revenue_this_month'],
            'outstanding' => $centralStats['outstanding'],
            'total_invoices' => $centralStats['total_invoices'],
            'overdue_invoices' => $centralStats['overdue_invoices'],
            'appointment_trend' => $appointmentTrend,
            'gender_distribution' => $genderDistribution,
            'blood_type_distribution' => $bloodTypeDistribution,
        ];
    }
}
