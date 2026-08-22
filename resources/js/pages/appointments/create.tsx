import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { store as storeAppointment } from '@/routes/appointments';
import type { Doctor, Patient } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Props = {
    patients: Pick<Patient, 'id' | 'mrn' | 'first_name' | 'last_name'>[];
    doctors: (Doctor & { schedules: NonNullable<Doctor['schedules']> })[];
    defaultPatientId: number | null;
    defaultDoctorId: number | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Appointments', href: '/appointments' },
    { title: 'Book Appointment', href: '/appointments/create' },
];

export default function CreateAppointment({ patients, doctors, defaultPatientId, defaultDoctorId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: defaultPatientId?.toString() ?? '',
        doctor_id: defaultDoctorId?.toString() ?? '',
        department_id: '',
        scheduled_at: '',
        duration_minutes: '30',
        type: 'in_person',
        chief_complaint: '',
        notes: '',
    });

    const [selectedDoctor, setSelectedDoctor] = useState<(typeof doctors)[number] | null>(
        defaultDoctorId ? (doctors.find((d) => d.id === defaultDoctorId) ?? null) : null
    );

    useEffect(() => {
        const doc = doctors.find((d) => d.id.toString() === data.doctor_id) ?? null;
        setSelectedDoctor(doc);
        if (doc?.department) {
            setData('department_id', doc.department.id.toString());
        }
    }, [data.doctor_id]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(storeAppointment.url());
    }

    // Build available time slots for selected date based on doctor schedule
    function getAvailableDays(): number[] {
        if (!selectedDoctor) return [0, 1, 2, 3, 4, 5, 6];
        return (selectedDoctor.schedules ?? []).filter((s) => s.is_active).map((s) => s.day_of_week);
    }

    function isDateDisabled(dateStr: string): boolean {
        if (!selectedDoctor) return false;
        const day = new Date(dateStr).getDay();
        return !getAvailableDays().includes(day);
    }

    return (
        <>
            <Head title="Book Appointment" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Book Appointment</h1>
                    <p className="text-muted-foreground">Schedule a new patient appointment.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left: Patient & Doctor */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Patient & Doctor</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="patient_id">Patient <span className="text-destructive">*</span></Label>
                                    <select
                                        id="patient_id"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                        value={data.patient_id}
                                        onChange={(e) => setData('patient_id', e.target.value)}
                                    >
                                        <option value="">Select patient…</option>
                                        {patients.map((p) => (
                                            <option key={p.id} value={p.id}>{p.last_name}, {p.first_name} — {p.mrn}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.patient_id} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="doctor_id">Doctor <span className="text-destructive">*</span></Label>
                                    <select
                                        id="doctor_id"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                        value={data.doctor_id}
                                        onChange={(e) => setData('doctor_id', e.target.value)}
                                    >
                                        <option value="">Select doctor…</option>
                                        {doctors.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                Dr. {d.full_name}{d.specialization ? ` — ${d.specialization.name}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.doctor_id} />
                                </div>

                                {/* Doctor schedule info */}
                                {selectedDoctor && selectedDoctor.schedules && selectedDoctor.schedules.length > 0 && (
                                    <div className="rounded-md bg-muted/50 p-3 text-sm">
                                        <p className="font-medium mb-2 text-xs text-muted-foreground uppercase">Doctor's Schedule</p>
                                        <div className="space-y-1">
                                            {selectedDoctor.schedules.filter((s) => s.is_active).map((s) => (
                                                <div key={s.id} className="flex gap-2">
                                                    <span className="font-medium w-24">{DAYS[s.day_of_week]}</span>
                                                    <span className="text-muted-foreground">{s.start_time} – {s.end_time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Right: Schedule details */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Appointment Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="scheduled_at">Date & Time <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="scheduled_at"
                                        type="datetime-local"
                                        value={data.scheduled_at}
                                        min={new Date().toISOString().slice(0, 16)}
                                        onChange={(e) => setData('scheduled_at', e.target.value)}
                                    />
                                    <InputError message={errors.scheduled_at} />
                                    {data.scheduled_at && selectedDoctor && isDateDisabled(data.scheduled_at.slice(0, 10)) && (
                                        <p className="text-xs text-yellow-600">⚠ Doctor is not scheduled on this day.</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="duration_minutes">Duration</Label>
                                    <select id="duration_minutes" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={data.duration_minutes} onChange={(e) => setData('duration_minutes', e.target.value)}>
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60">60 minutes</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="type">Appointment Type <span className="text-destructive">*</span></Label>
                                    <select id="type" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={data.type} onChange={(e) => setData('type', e.target.value)}>
                                        <option value="in_person">In Person</option>
                                        <option value="telemedicine">Telemedicine</option>
                                    </select>
                                    <InputError message={errors.type} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="chief_complaint">Chief Complaint <span className="text-destructive">*</span></Label>
                                    <textarea
                                        id="chief_complaint"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
                                        value={data.chief_complaint}
                                        onChange={(e) => setData('chief_complaint', e.target.value)}
                                        placeholder="Reason for visit…"
                                    />
                                    <InputError message={errors.chief_complaint} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <textarea
                                        id="notes"
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Booking…' : 'Book Appointment'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
