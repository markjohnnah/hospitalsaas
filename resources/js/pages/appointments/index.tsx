import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Calendar, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { index as appointmentsIndex, create as appointmentsCreate, show as appointmentsShow } from '@/routes/appointments';
import type { Appointment, Doctor, PaginatedResult } from '@/types/auth';

type Stats = {
    today: number;
    pending: number;
    confirmed: number;
};

type Props = {
    appointments: PaginatedResult<Appointment>;
    doctors: { id: number; name: string }[];
    filters: {
        search?: string;
        status?: string;
        doctor_id?: string;
        date?: string;
    };
    stats: Stats;
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-700',
};

const TYPE_LABELS: Record<string, string> = {
    in_person: 'In Person',
    telemedicine: 'Telemedicine',
};

export default function AppointmentsIndex({ appointments, doctors, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(appointmentsIndex.url(), { ...filters, search }, { preserveScroll: true, replace: true });
    }

    function applyFilter(key: string, value: string) {
        router.get(appointmentsIndex.url(), { ...filters, [key]: value }, { preserveScroll: true, replace: true });
    }

    return (
        <>
            <Head title="Appointments" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
                        <p className="text-muted-foreground">{appointments.total} total appointments</p>
                    </div>
                    <Link href={appointmentsCreate.url()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Book Appointment
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard icon={Calendar} label="Today's Appointments" value={stats.today} color="text-blue-600" />
                    <StatCard icon={Clock} label="Pending Confirmation" value={stats.pending} color="text-yellow-600" />
                    <StatCard icon={Users} label="Confirmed Today" value={stats.confirmed} color="text-green-600" />
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Search by patient or appointment #…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={filters.status ?? ''} onChange={(e) => applyFilter('status', e.target.value)}>
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="no_show">No Show</option>
                            </select>
                            <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={filters.doctor_id ?? ''} onChange={(e) => applyFilter('doctor_id', e.target.value)}>
                                <option value="">All Doctors</option>
                                {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
                            </select>
                            <Input type="date" className="w-40 h-9" value={filters.date ?? ''} onChange={(e) => applyFilter('date', e.target.value)} />
                            <Button type="submit">Search</Button>
                            {Object.values(filters).some(Boolean) && (
                                <Button variant="outline" type="button" onClick={() => { setSearch(''); router.get(appointmentsIndex.url()); }}>Clear</Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">#</th>
                                        <th className="px-4 py-3 text-left font-medium">Patient</th>
                                        <th className="px-4 py-3 text-left font-medium">Doctor</th>
                                        <th className="px-4 py-3 text-left font-medium">Scheduled</th>
                                        <th className="px-4 py-3 text-left font-medium">Type</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {appointments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No appointments found.</td>
                                        </tr>
                                    ) : appointments.data.map((appt) => (
                                        <tr key={appt.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{appt.appointment_number}</td>
                                            <td className="px-4 py-3">
                                                {appt.patient ? (
                                                    <div>
                                                        <p className="font-medium">{appt.patient.full_name}</p>
                                                        <p className="text-xs text-muted-foreground">{appt.patient.mrn}</p>
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {appt.doctor ? `Dr. ${appt.doctor.full_name}` : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p>{new Date(appt.scheduled_at).toLocaleDateString()}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline">{TYPE_LABELS[appt.type] ?? appt.type}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className={STATUS_COLORS[appt.status] ?? ''}>{appt.status.replace('_', ' ')}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={appointmentsShow(appt.id).url}>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {appointments.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">Showing {appointments.from}–{appointments.to} of {appointments.total}</p>
                                <div className="flex gap-1">
                                    {appointments.links.map((link, i) => (
                                        <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-muted p-3">
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}
