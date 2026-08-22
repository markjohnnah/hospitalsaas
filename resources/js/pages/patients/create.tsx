import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { store as storePatient } from '@/routes/patients';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Patients', href: '/patients' },
    { title: 'Register Patient', href: '/patients/create' },
];

type PatientForm = {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    blood_type: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    country: string;
    nationality: string;
    marital_status: string;
    occupation: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    insurance_provider: string;
    insurance_policy_number: string;
    insurance_expiry: string;
};

export default function CreatePatient() {
    const { data, setData, post, processing, errors } = useForm<PatientForm>({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        blood_type: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        country: 'Kenya',
        nationality: 'Kenyan',
        marital_status: '',
        occupation: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        insurance_provider: '',
        insurance_policy_number: '',
        insurance_expiry: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(storePatient.url());
    }

    function FormField({ label, name, type = 'text', required = false, children }: {
        label: string;
        name: keyof PatientForm;
        type?: string;
        required?: boolean;
        children?: React.ReactNode;
    }) {
        return (
            <div className="space-y-1">
                <Label htmlFor={name}>
                    {label}{required && <span className="text-destructive"> *</span>}
                </Label>
                {children ?? (
                    <Input
                        id={name}
                        type={type}
                        value={data[name]}
                        onChange={(e) => setData(name, e.target.value)}
                    />
                )}
                <InputError message={errors[name]} />
            </div>
        );
    }

    return (
        <>
            <Head title="Register Patient" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Register New Patient</h1>
                    <p className="text-muted-foreground">A Medical Record Number (MRN) will be auto-generated.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormField label="First Name" name="first_name" required />
                            <FormField label="Last Name" name="last_name" required />
                            <FormField label="Date of Birth" name="date_of_birth" type="date" required />
                            <div className="space-y-1">
                                <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
                                <select
                                    id="gender"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <InputError message={errors.gender} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="blood_type">Blood Type</Label>
                                <select
                                    id="blood_type"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={data.blood_type}
                                    onChange={(e) => setData('blood_type', e.target.value)}
                                >
                                    <option value="">Unknown</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                                        <option key={bt} value={bt}>{bt}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="marital_status">Marital Status</Label>
                                <select
                                    id="marital_status"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={data.marital_status}
                                    onChange={(e) => setData('marital_status', e.target.value)}
                                >
                                    <option value="">Select status</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                </select>
                            </div>
                            <FormField label="Nationality" name="nationality" />
                            <FormField label="Occupation" name="occupation" />
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Phone" name="phone" type="tel" />
                            <FormField label="Email" name="email" type="email" />
                            <FormField label="Address" name="address" />
                            <FormField label="City" name="city" />
                            <FormField label="Country" name="country" />
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <FormField label="Contact Name" name="emergency_contact_name" />
                            <FormField label="Contact Phone" name="emergency_contact_phone" type="tel" />
                            <FormField label="Relationship" name="emergency_contact_relationship" />
                        </CardContent>
                    </Card>

                    {/* Insurance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Insurance Information (Optional)</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <FormField label="Insurance Provider" name="insurance_provider" />
                            <FormField label="Policy Number" name="insurance_policy_number" />
                            <FormField label="Expiry Date" name="insurance_expiry" type="date" />
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Registering…' : 'Register Patient'}
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
