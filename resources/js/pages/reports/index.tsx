import { Head } from '@inertiajs/react';
import {
    Activity,
    Bed,
    Calendar,
    DollarSign,
    TrendingDown,
    TrendingUp,
    Users,
    UserSquare2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type StaffBreakdown = { role: string; count: number };
type Trend = { month: string; total: number };
type Distribution = { gender?: string; type?: string; count: number };

type Props = {
    stats: {
        total_patients: number;
        new_patients_this_month: number;
        patient_growth: number;
        today_appointments: number;
        pending_appointments: number;
        completion_rate: number;
        active_admissions: number;
        discharged_this_month: number;
        total_staff: number;
        total_doctors: number;
        staff_breakdown: StaffBreakdown[];
        total_revenue: number;
        revenue_this_month: number;
        outstanding: number;
        total_invoices: number;
        overdue_invoices: number;
        appointment_trend: Trend[];
        gender_distribution: Distribution[];
        blood_type_distribution: Distribution[];
    };
};

function formatPrice(cents: number): string {
    return `K${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function ReportsIndex({ stats }: Props) {
    const maxTrend = Math.max(...stats.appointment_trend.map((t) => t.total), 1);

    return (
        <>
            <Head title="Reports" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Hospital Reports</h1>
                    <p className="text-muted-foreground">Overview of key metrics and performance</p>
                </div>

                {/* KPI Row 1: Patients & Appointments */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <UserSquare2 className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_patients.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.new_patients_this_month} this month
                                {stats.patient_growth !== 0 && (
                                    <span className={stats.patient_growth > 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                                        ({stats.patient_growth > 0 ? <TrendingUp className="inline h-3 w-3" /> : <TrendingDown className="inline h-3 w-3" />}
                                        {stats.patient_growth > 0 ? '+' : ''}{stats.patient_growth}%)
                                    </span>
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.today_appointments}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.pending_appointments} pending · {stats.completion_rate}% completion
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Admissions</CardTitle>
                            <Bed className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.active_admissions}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.discharged_this_month} discharged this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                            <Users className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_staff}</div>
                            <p className="text-xs text-muted-foreground">{stats.total_doctors} doctors</p>
                        </CardContent>
                    </Card>
                </div>

                {/* KPI Row 2: Revenue */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{formatPrice(stats.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground">{formatPrice(stats.revenue_this_month)} this month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{formatPrice(stats.outstanding)}</div>
                            <p className="text-xs text-muted-foreground">{stats.overdue_invoices} overdue</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                            <Activity className="h-4 w-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_invoices}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Appt. Completion</CardTitle>
                            <Activity className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.completion_rate}%</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Appointment Trend */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Appointment Trend (6 Months)</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2 h-40">
                                {stats.appointment_trend.map((t) => (
                                    <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-xs font-medium">{t.total}</span>
                                        <div
                                            className="w-full bg-blue-500 rounded-t"
                                            style={{ height: `${(t.total / maxTrend) * 120}px`, minHeight: 4 }}
                                        />
                                        <span className="text-[10px] text-muted-foreground">{t.month}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Staff Breakdown */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Staff Breakdown</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.staff_breakdown.map((s) => (
                                    <div key={s.role} className="flex items-center justify-between">
                                        <span className="text-sm">{s.role}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.max(s.count * 8, 16)}px` }} />
                                            <span className="text-sm font-medium w-6 text-right">{s.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Demographics */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Gender Distribution */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Patient Gender Distribution</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center gap-8 py-4">
                                {stats.gender_distribution.map((g) => (
                                    <div key={g.gender} className="text-center">
                                        <div className="text-2xl font-bold">{g.count}</div>
                                        <div className="text-sm text-muted-foreground">{g.gender}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Blood Types */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Blood Type Distribution</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {stats.blood_type_distribution.map((b) => (
                                    <div key={b.type} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm">
                                        <span className="font-medium text-red-600">{b.type}</span>
                                        <span className="text-muted-foreground">{b.count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
