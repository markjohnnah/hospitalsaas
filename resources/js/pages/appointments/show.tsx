import { Head, Link, router, useForm } from '@inertiajs/react';
import { Edit, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { show as showAppointment, update as updateAppointment } from '@/routes/appointments';
import { show as showPatient } from '@/routes/patients';
import { show as showDoctor } from '@/routes/doctors';
import type { Appointment } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Props = {
    appointment: Appointment;
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-700',
};

export default function ShowAppointment({ appointment }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Appointments', href: '/appointments' },
        { title: appointment.appointment_number, href: `/appointments/${appointment.id}` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        status: appointment.status,
        cancellation_reason: appointment.cancellation_reason ?? '',
    });

    function updateStatus(status: string) {
        setData('status', status as typeof data.status);
    }

    function submitStatusUpdate() {
        put(updateAppointment(appointment.id).url, {
            preserveScroll: true,
        });
    }

    const canConfirm = appointment.status === 'pending';
    const canComplete = appointment.status === 'confirmed';
    const canCancel = ['pending', 'confirmed'].includes(appointment.status);

    return (
        <>
            <Head title={`Appointment ${appointment.appointment_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{appointment.appointment_number}</h1>
                            <Badge className={STATUS_COLORS[appointment.status] ?? ''}>{appointment.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {new Date(appointment.scheduled_at).toLocaleString()} · {appointment.duration_minutes} min · {appointment.type === 'in_person' ? 'In Person' : 'Telemedicine'}
                        </p>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex gap-2">
                        {canConfirm && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => { updateStatus('confirmed'); setTimeout(submitStatusUpdate, 0); }}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm
                            </Button>
                        )}
                        {canComplete && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { updateStatus('completed'); setTimeout(submitStatusUpdate, 0); }}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                            </Button>
                        )}
                        {canCancel && (
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {/* Appointment details */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Appointment Details</CardTitle></CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
                                <InfoRow label="Chief Complaint" value={appointment.chief_complaint ?? '—'} />
                                <InfoRow label="Department" value={appointment.department?.name ?? '—'} />
                                {appointment.notes && <InfoRow label="Notes" value={appointment.notes} />}
                                {appointment.cancellation_reason && <InfoRow label="Cancellation Reason" value={appointment.cancellation_reason} />}
                                {appointment.confirmed_at && <InfoRow label="Confirmed At" value={new Date(appointment.confirmed_at).toLocaleString()} />}
                            </CardContent>
                        </Card>

                        {/* Status update form */}
                        {(canConfirm || canComplete || canCancel) && (
                            <Card>
                                <CardHeader><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="status">Status</Label>
                                        <select id="status" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={data.status} onChange={(e) => setData('status', e.target.value as typeof data.status)}>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="no_show">No Show</option>
                                        </select>
                                    </div>
                                    {data.status === 'cancelled' && (
                                        <div className="space-y-1">
                                            <Label htmlFor="cancellation_reason">Cancellation Reason <span className="text-destructive">*</span></Label>
                                            <textarea
                                                id="cancellation_reason"
                                                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
                                                value={data.cancellation_reason}
                                                onChange={(e) => setData('cancellation_reason', e.target.value)}
                                            />
                                            <InputError message={errors.cancellation_reason} />
                                        </div>
                                    )}
                                    <Button onClick={submitStatusUpdate} disabled={processing}>
                                        {processing ? 'Updating…' : 'Update Status'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right: Patient & Doctor cards */}
                    <div className="space-y-4">
                        {appointment.patient && (
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-base">Patient</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p className="font-medium">
                                        <Link href={showPatient(appointment.patient.id).url} className="hover:underline text-primary">
                                            {appointment.patient.full_name}
                                        </Link>
                                    </p>
                                    <p className="text-muted-foreground font-mono text-xs">{appointment.patient.mrn}</p>
                                    <p className="text-muted-foreground">{appointment.patient.phone}</p>
                                </CardContent>
                            </Card>
                        )}

                        {appointment.doctor && (
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-base">Doctor</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p className="font-medium">
                                        <Link href={showDoctor(appointment.doctor.id).url} className="hover:underline text-primary">
                                            Dr. {appointment.doctor.full_name}
                                        </Link>
                                    </p>
                                    {appointment.doctor.specialization && (
                                        <p className="text-muted-foreground">{appointment.doctor.specialization.name}</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}
