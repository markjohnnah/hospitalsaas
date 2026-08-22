import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { update as updatePatient } from '@/routes/patients';
import type { Patient } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Props = {
    patient: Patient;
};

export default function EditPatient({ patient }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Patients', href: '/patients' },
        { title: patient.full_name, href: `/patients/${patient.id}` },
        { title: 'Edit', href: `/patients/${patient.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        blood_type: patient.blood_type ?? '',
        phone: patient.phone ?? '',
        email: patient.email ?? '',
        address: patient.address ?? '',
        city: patient.city ?? '',
        country: patient.country ?? 'Kenya',
        nationality: patient.nationality ?? '',
        marital_status: patient.marital_status ?? '',
        occupation: patient.occupation ?? '',
        emergency_contact_name: patient.emergency_contact_name ?? '',
        emergency_contact_phone: patient.emergency_contact_phone ?? '',
        emergency_contact_relationship: patient.emergency_contact_relationship ?? '',
        insurance_provider: patient.insurance_provider ?? '',
        insurance_policy_number: patient.insurance_policy_number ?? '',
        insurance_expiry: patient.insurance_expiry ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(updatePatient(patient.id).url);
    }

    return (
        <>
            <Head title={`Edit ${patient.full_name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Patient Record</h1>
                    <p className="text-muted-foreground font-mono text-sm">{patient.mrn}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Field label="First Name" id="first_name" value={data.first_name} onChange={(v) => setData('first_name', v)} error={errors.first_name} required />
                            <Field label="Last Name" id="last_name" value={data.last_name} onChange={(v) => setData('last_name', v)} error={errors.last_name} required />
                            <Field label="Date of Birth" id="date_of_birth" type="date" value={data.date_of_birth} onChange={(v) => setData('date_of_birth', v)} error={errors.date_of_birth} required />
                            <div className="space-y-1">
                                <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
                                <select id="gender" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={data.gender} onChange={(e) => setData('gender', e.target.value as typeof data.gender)}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <InputError message={errors.gender} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="blood_type">Blood Type</Label>
                                <select id="blood_type" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={data.blood_type} onChange={(e) => setData('blood_type', e.target.value)}>
                                    <option value="">Unknown</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="marital_status">Marital Status</Label>
                                <select id="marital_status" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={data.marital_status} onChange={(e) => setData('marital_status', e.target.value)}>
                                    <option value="">Select status</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                </select>
                            </div>
                            <Field label="Nationality" id="nationality" value={data.nationality} onChange={(v) => setData('nationality', v)} error={errors.nationality} />
                            <Field label="Occupation" id="occupation" value={data.occupation} onChange={(v) => setData('occupation', v)} error={errors.occupation} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <Field label="Phone" id="phone" type="tel" value={data.phone} onChange={(v) => setData('phone', v)} error={errors.phone} />
                            <Field label="Email" id="email" type="email" value={data.email} onChange={(v) => setData('email', v)} error={errors.email} />
                            <Field label="Address" id="address" value={data.address} onChange={(v) => setData('address', v)} error={errors.address} />
                            <Field label="City" id="city" value={data.city} onChange={(v) => setData('city', v)} error={errors.city} />
                            <Field label="Country" id="country" value={data.country} onChange={(v) => setData('country', v)} error={errors.country} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Emergency Contact</CardTitle></CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <Field label="Contact Name" id="emergency_contact_name" value={data.emergency_contact_name} onChange={(v) => setData('emergency_contact_name', v)} error={errors.emergency_contact_name} />
                            <Field label="Contact Phone" id="emergency_contact_phone" type="tel" value={data.emergency_contact_phone} onChange={(v) => setData('emergency_contact_phone', v)} error={errors.emergency_contact_phone} />
                            <Field label="Relationship" id="emergency_contact_relationship" value={data.emergency_contact_relationship} onChange={(v) => setData('emergency_contact_relationship', v)} error={errors.emergency_contact_relationship} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Insurance</CardTitle></CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <Field label="Insurance Provider" id="insurance_provider" value={data.insurance_provider} onChange={(v) => setData('insurance_provider', v)} error={errors.insurance_provider} />
                            <Field label="Policy Number" id="insurance_policy_number" value={data.insurance_policy_number} onChange={(v) => setData('insurance_policy_number', v)} error={errors.insurance_policy_number} />
                            <Field label="Expiry Date" id="insurance_expiry" type="date" value={data.insurance_expiry} onChange={(v) => setData('insurance_expiry', v)} error={errors.insurance_expiry} />
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save Changes'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => history.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function Field({ label, id, type = 'text', value, onChange, error, required = false }: {
    label: string;
    id: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    required?: boolean;
}) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id}>
                {label}{required && <span className="text-destructive"> *</span>}
            </Label>
            <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
            <InputError message={error} />
        </div>
    );
}
