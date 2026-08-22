import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { store as storeDoctor } from '@/routes/doctors';
import type { Department, Specialization } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Props = {
    departments: Pick<Department, 'id' | 'name'>[];
    specializations: Pick<Specialization, 'id' | 'name'>[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Doctors', href: '/doctors' },
    { title: 'Add Doctor', href: '/doctors/create' },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type DoctorForm = {
    name: string;
    email: string;
    password: string;
    phone: string;
    department_id: string;
    specialization_id: string;
    license_number: string;
    consultation_fee: string;
    bio: string;
    qualification: string;
    experience_years: string;
    schedules: { day_of_week: number; start_time: string; end_time: string; slot_duration_minutes: number }[];
};

export default function CreateDoctor({ departments, specializations }: Props) {
    const { data, setData, post, processing, errors } = useForm<DoctorForm>({
        name: '',
        email: '',
        password: '',
        phone: '',
        department_id: '',
        specialization_id: '',
        license_number: '',
        consultation_fee: '',
        bio: '',
        qualification: '',
        experience_years: '',
        schedules: [],
    });

    function toggleDay(dayIndex: number) {
        const existing = data.schedules.findIndex((s) => s.day_of_week === dayIndex);
        if (existing >= 0) {
            setData('schedules', data.schedules.filter((_, i) => i !== existing));
        } else {
            setData('schedules', [...data.schedules, { day_of_week: dayIndex, start_time: '08:00', end_time: '17:00', slot_duration_minutes: 30 }]);
        }
    }

    function updateSchedule(dayIndex: number, field: string, value: string | number) {
        setData('schedules', data.schedules.map((s) =>
            s.day_of_week === dayIndex ? { ...s, [field]: value } : s
        ));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(storeDoctor.url());
    }

    return (
        <>
            <Head title="Add Doctor" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add Doctor</h1>
                    <p className="text-muted-foreground">This creates a new user account and doctor profile.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Account */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Account Information</CardTitle></CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <F label="Full Name" id="name" value={data.name} onChange={(v) => setData('name', v)} error={errors.name} required />
                            <F label="Email" id="email" type="email" value={data.email} onChange={(v) => setData('email', v)} error={errors.email} required />
                            <F label="Password" id="password" type="password" value={data.password} onChange={(v) => setData('password', v)} error={errors.password} required />
                            <F label="Phone" id="phone" type="tel" value={data.phone} onChange={(v) => setData('phone', v)} error={errors.phone} />
                        </CardContent>
                    </Card>

                    {/* Profile */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Doctor Profile</CardTitle></CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-1">
                                <Label htmlFor="department_id">Department</Label>
                                <select id="department_id" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={data.department_id} onChange={(e) => setData('department_id', e.target.value)}>
                                    <option value="">Select department</option>
                                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <InputError message={errors.department_id} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="specialization_id">Specialization</Label>
                                <select id="specialization_id" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={data.specialization_id} onChange={(e) => setData('specialization_id', e.target.value)}>
                                    <option value="">Select specialization</option>
                                    {specializations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <InputError message={errors.specialization_id} />
                            </div>
                            <F label="License Number" id="license_number" value={data.license_number} onChange={(v) => setData('license_number', v)} error={errors.license_number} />
                            <F label="Qualification" id="qualification" value={data.qualification} onChange={(v) => setData('qualification', v)} error={errors.qualification} />
                            <F label="Experience (years)" id="experience_years" type="number" value={data.experience_years} onChange={(v) => setData('experience_years', v)} error={errors.experience_years} />
                            <F label="Consultation Fee (KES)" id="consultation_fee" type="number" value={data.consultation_fee} onChange={(v) => setData('consultation_fee', v)} error={errors.consultation_fee} />
                        </CardContent>
                        <CardContent className="pt-0">
                            <div className="space-y-1">
                                <Label htmlFor="bio">Bio</Label>
                                <textarea id="bio" className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none" value={data.bio} onChange={(e) => setData('bio', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Working Schedule</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Select working days and set the schedule for each day.</p>
                            <div className="space-y-3">
                                {DAYS.map((day, index) => {
                                    const schedule = data.schedules.find((s) => s.day_of_week === index);
                                    return (
                                        <div key={index} className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-2 w-32">
                                                <input
                                                    type="checkbox"
                                                    id={`day-${index}`}
                                                    checked={!!schedule}
                                                    onChange={() => toggleDay(index)}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <Label htmlFor={`day-${index}`} className="cursor-pointer">{day}</Label>
                                            </div>
                                            {schedule && (
                                                <>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Label className="text-muted-foreground">From</Label>
                                                        <Input type="time" className="w-28 h-8" value={schedule.start_time} onChange={(e) => updateSchedule(index, 'start_time', e.target.value)} />
                                                        <Label className="text-muted-foreground">To</Label>
                                                        <Input type="time" className="w-28 h-8" value={schedule.end_time} onChange={(e) => updateSchedule(index, 'end_time', e.target.value)} />
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Label className="text-muted-foreground">Slot</Label>
                                                        <select className="flex h-8 rounded-md border border-input bg-transparent px-2 text-sm" value={schedule.slot_duration_minutes} onChange={(e) => updateSchedule(index, 'slot_duration_minutes', parseInt(e.target.value))}>
                                                            <option value={15}>15 min</option>
                                                            <option value={30}>30 min</option>
                                                            <option value={45}>45 min</option>
                                                            <option value={60}>60 min</option>
                                                        </select>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating…' : 'Create Doctor'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function F({ label, id, type = 'text', value, onChange, error, required = false }: {
    label: string; id: string; type?: string; value: string;
    onChange: (v: string) => void; error?: string; required?: boolean;
}) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
            <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
            <InputError message={error} />
        </div>
    );
}
