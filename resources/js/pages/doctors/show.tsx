import { Head, Link } from '@inertiajs/react';
import { Calendar, Clock, Edit, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { edit as editDoctor } from '@/routes/doctors';
import { create as createAppointment } from '@/routes/appointments';
import type { Doctor } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Props = {
    doctor: Doctor;
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ShowDoctor({ doctor }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Doctors', href: '/doctors' },
        { title: `Dr. ${doctor.full_name}`, href: `/doctors/${doctor.id}` },
    ];

    return (
        <>
            <Head title={`Dr. ${doctor.full_name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">Dr. {doctor.full_name}</h1>
                            {doctor.is_available
                                ? <Badge className="bg-green-100 text-green-800">Available</Badge>
                                : <Badge variant="secondary">Unavailable</Badge>}
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {[doctor.qualification, doctor.specialization?.name, doctor.department?.name].filter(Boolean).join(' · ')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`${createAppointment.url()}?doctor_id=${doctor.id}`}>
                            <Button variant="outline">
                                <Calendar className="mr-2 h-4 w-4" />
                                Book Appointment
                            </Button>
                        </Link>
                        <Link href={editDoctor(doctor.id).url}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {/* Profile */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Stethoscope className="h-4 w-4" />
                                    Professional Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
                                <InfoRow label="License Number" value={doctor.license_number ?? '—'} mono />
                                <InfoRow label="Experience" value={`${doctor.experience_years} years`} />
                                <InfoRow label="Department" value={doctor.department?.name ?? '—'} />
                                <InfoRow label="Specialization" value={doctor.specialization?.name ?? '—'} />
                                <InfoRow label="Consultation Fee" value={`KES ${parseFloat(doctor.consultation_fee).toLocaleString()}`} />
                                <InfoRow label="Email" value={doctor.user?.email ?? '—'} />
                                <InfoRow label="Phone" value={doctor.user?.phone ?? '—'} />
                            </CardContent>
                            {doctor.bio && (
                                <CardContent className="pt-0">
                                    <p className="text-xs text-muted-foreground mb-1">Bio</p>
                                    <p className="text-sm">{doctor.bio}</p>
                                </CardContent>
                            )}
                        </Card>

                        {/* Recent Appointments */}
                        {doctor.appointments && doctor.appointments.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle className="text-base">Recent Appointments</CardTitle></CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {doctor.appointments.map((appt) => (
                                            <div key={appt.id} className="flex items-center justify-between px-6 py-3 text-sm">
                                                <div>
                                                    <p className="font-medium">{appt.patient?.full_name}</p>
                                                    <p className="text-muted-foreground">{new Date(appt.scheduled_at).toLocaleString()}</p>
                                                </div>
                                                <StatusBadge status={appt.status} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Schedule */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="h-4 w-4" />
                                    Working Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {doctor.schedules && doctor.schedules.length > 0 ? (
                                    <div className="space-y-3">
                                        {DAYS.map((day, idx) => {
                                            const schedule = doctor.schedules?.find((s) => s.day_of_week === idx);
                                            return (
                                                <div key={idx} className={`flex items-center justify-between text-sm ${schedule ? '' : 'opacity-40'}`}>
                                                    <span className="font-medium w-24">{day}</span>
                                                    {schedule ? (
                                                        <span className="text-muted-foreground text-xs">
                                                            {schedule.start_time} – {schedule.end_time}
                                                            <span className="ml-1">({schedule.slot_duration_minutes}min slots)</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Day off</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No schedule set.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`font-medium ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        no_show: 'bg-gray-100 text-gray-700',
    };
    return <Badge className={colors[status] ?? ''}>{status.replace('_', ' ')}</Badge>;
}
