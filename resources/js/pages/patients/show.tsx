import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, Calendar, Edit, FileText, Heart, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { edit as editPatient } from '@/routes/patients';
import { create as createAppointment } from '@/routes/appointments';
import type { Patient } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Props = {
    patient: Patient;
};

export default function ShowPatient({ patient }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Patients', href: '/patients' },
        { title: patient.full_name, href: `/patients/${patient.id}` },
    ];

    function severityColor(severity: string) {
        const colors: Record<string, string> = {
            mild: 'bg-yellow-100 text-yellow-800',
            moderate: 'bg-orange-100 text-orange-800',
            severe: 'bg-red-100 text-red-800',
        };
        return colors[severity] ?? '';
    }

    return (
        <>
            <Head title={patient.full_name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{patient.full_name}</h1>
                            {patient.is_active
                                ? <Badge className="bg-green-100 text-green-800">Active</Badge>
                                : <Badge variant="secondary">Inactive</Badge>}
                        </div>
                        <p className="text-muted-foreground font-mono text-sm mt-1">{patient.mrn}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`${createAppointment.url()}?patient_id=${patient.id}`}>
                            <Button variant="outline">
                                <Calendar className="mr-2 h-4 w-4" />
                                Book Appointment
                            </Button>
                        </Link>
                        <Link href={editPatient(patient.id).url}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Record
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left column: personal info */}
                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
                                <InfoRow label="Date of Birth" value={new Date(patient.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                                <InfoRow label="Age" value={`${patient.age} years old`} />
                                <InfoRow label="Gender" value={patient.gender} className="capitalize" />
                                <InfoRow label="Blood Type" value={patient.blood_type ?? '—'} />
                                <InfoRow label="Nationality" value={patient.nationality ?? '—'} />
                                <InfoRow label="Marital Status" value={patient.marital_status ?? '—'} className="capitalize" />
                                <InfoRow label="Occupation" value={patient.occupation ?? '—'} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
                                <InfoRow label="Phone" value={patient.phone ?? '—'} />
                                <InfoRow label="Email" value={patient.email ?? '—'} />
                                <InfoRow label="Address" value={patient.address ?? '—'} />
                                <InfoRow label="City" value={patient.city ?? '—'} />
                                <InfoRow label="Country" value={patient.country ?? '—'} />
                            </CardContent>
                        </Card>

                        {/* Appointments */}
                        {patient.appointments && patient.appointments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Recent Appointments</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {patient.appointments.slice(0, 5).map((appt) => (
                                            <div key={appt.id} className="flex items-center justify-between px-6 py-3 text-sm">
                                                <div>
                                                    <p className="font-medium">{appt.doctor?.full_name}</p>
                                                    <p className="text-muted-foreground">{new Date(appt.scheduled_at).toLocaleDateString()}</p>
                                                </div>
                                                <StatusBadge status={appt.status} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right column: medical summary */}
                    <div className="space-y-4">
                        {/* Emergency Contact */}
                        {patient.emergency_contact_name && (
                            <Card className="border-orange-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base text-orange-700">
                                        <Phone className="h-4 w-4" />
                                        Emergency Contact
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p className="font-medium">{patient.emergency_contact_name}</p>
                                    <p className="text-muted-foreground">{patient.emergency_contact_relationship}</p>
                                    <p>{patient.emergency_contact_phone}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Insurance */}
                        {patient.insurance_provider && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <FileText className="h-4 w-4" />
                                        Insurance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p className="font-medium">{patient.insurance_provider}</p>
                                    <p className="text-muted-foreground">{patient.insurance_policy_number}</p>
                                    {patient.insurance_expiry && (
                                        <p className="text-muted-foreground">Expires: {new Date(patient.insurance_expiry).toLocaleDateString()}</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Allergies */}
                        <Card className={patient.allergies && patient.allergies.length > 0 ? 'border-red-200' : ''}>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    Allergies
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patient.allergies && patient.allergies.length > 0 ? (
                                    <div className="space-y-2">
                                        {patient.allergies.map((allergy) => (
                                            <div key={allergy.id} className="flex items-center justify-between text-sm">
                                                <div>
                                                    <p className="font-medium">{allergy.allergen}</p>
                                                    {allergy.reaction && <p className="text-muted-foreground text-xs">{allergy.reaction}</p>}
                                                </div>
                                                <Badge className={severityColor(allergy.severity)} style={{ fontSize: 11 }}>
                                                    {allergy.severity}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No known allergies</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Chronic Diseases */}
                        {patient.chronic_diseases && patient.chronic_diseases.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Heart className="h-4 w-4" />
                                        Chronic Conditions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {patient.chronic_diseases.map((cd) => (
                                            <li key={cd.id}>
                                                <p className="font-medium">{cd.condition_name}</p>
                                                {cd.icd10_code && <p className="text-xs text-muted-foreground">ICD-10: {cd.icd10_code}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoRow({ label, value, className = '' }: { label: string; value: string; className?: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`font-medium ${className}`}>{value}</p>
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
