import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Appointment, Patient } from '@/types/auth';
import { store as emrStore } from '@/routes/emr';

type DiagnosisInput = { diagnosis_name: string; icd10_code: string; type: string; notes: string };

type Props = {
    patients: Pick<Patient, 'id' | 'first_name' | 'last_name' | 'mrn'>[];
    doctors: { id: number; name: string }[];
    appointments: (Appointment & { patient: Patient; doctor: { user: { name: string } } })[];
};

export default function EmrCreate({ patients, doctors, appointments }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        doctor_id: '',
        appointment_id: '',
        visit_date: new Date().toISOString().slice(0, 10),
        visit_type: 'outpatient',
        chief_complaint: '',
        history_of_present_illness: '',
        past_medical_history: '',
        physical_examination: '',
        assessment: '',
        plan: '',
        notes: '',
        status: 'draft',
        vitals: {
            temperature: '', pulse_rate: '', respiratory_rate: '',
            systolic_bp: '', diastolic_bp: '', oxygen_saturation: '',
            weight: '', height: '', blood_glucose: '', notes: '',
        },
        diagnoses: [] as DiagnosisInput[],
    });

    function addDiagnosis() {
        setData('diagnoses', [...data.diagnoses, { diagnosis_name: '', icd10_code: '', type: 'primary', notes: '' }]);
    }

    function removeDiagnosis(index: number) {
        setData('diagnoses', data.diagnoses.filter((_, i) => i !== index));
    }

    function updateDiagnosis(index: number, field: keyof DiagnosisInput, value: string) {
        const updated = [...data.diagnoses];
        updated[index] = { ...updated[index], [field]: value };
        setData('diagnoses', updated);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(emrStore.url());
    }

    return (
        <>
            <Head title="New Medical Record" />
            <form onSubmit={submit} className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">New Medical Record</h1>
                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>Save as Draft</Button>
                        <Button type="button" variant="outline" disabled={processing}
                            onClick={() => { setData('status', 'finalized'); }}>Finalize</Button>
                    </div>
                </div>

                {/* Visit Info */}
                <Card>
                    <CardHeader><CardTitle>Visit Information</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Patient <span className="text-destructive">*</span></Label>
                            <Select value={data.patient_id} onValueChange={(v) => setData('patient_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
                                <SelectContent>
                                    {patients.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.first_name} {p.last_name} — {p.mrn}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.patient_id && <p className="text-sm text-destructive">{errors.patient_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Doctor <span className="text-destructive">*</span></Label>
                            <Select value={data.doctor_id} onValueChange={(v) => setData('doctor_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select doctor..." /></SelectTrigger>
                                <SelectContent>
                                    {doctors.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>Dr. {d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.doctor_id && <p className="text-sm text-destructive">{errors.doctor_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Visit Date <span className="text-destructive">*</span></Label>
                            <Input type="date" value={data.visit_date} onChange={(e) => setData('visit_date', e.target.value)} />
                            {errors.visit_date && <p className="text-sm text-destructive">{errors.visit_date}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Visit Type <span className="text-destructive">*</span></Label>
                            <Select value={data.visit_type} onValueChange={(v) => setData('visit_type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="outpatient">Outpatient</SelectItem>
                                    <SelectItem value="inpatient">Inpatient</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                    <SelectItem value="follow_up">Follow-up</SelectItem>
                                    <SelectItem value="telemedicine">Telemedicine</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Chief Complaint</Label>
                            <Input value={data.chief_complaint} onChange={(e) => setData('chief_complaint', e.target.value)}
                                placeholder="Main reason for visit..." />
                        </div>
                    </CardContent>
                </Card>

                {/* Vitals */}
                <Card>
                    <CardHeader><CardTitle>Vitals</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {([
                            { key: 'temperature', label: 'Temperature (°C)', placeholder: '36.5' },
                            { key: 'pulse_rate', label: 'Pulse Rate (bpm)', placeholder: '72' },
                            { key: 'respiratory_rate', label: 'Resp. Rate (/min)', placeholder: '16' },
                            { key: 'systolic_bp', label: 'Systolic BP (mmHg)', placeholder: '120' },
                            { key: 'diastolic_bp', label: 'Diastolic BP (mmHg)', placeholder: '80' },
                            { key: 'oxygen_saturation', label: 'O₂ Saturation (%)', placeholder: '98' },
                            { key: 'weight', label: 'Weight (kg)', placeholder: '70' },
                            { key: 'height', label: 'Height (cm)', placeholder: '170' },
                            { key: 'blood_glucose', label: 'Blood Glucose (mg/dL)', placeholder: '90' },
                        ] as const).map(({ key, label, placeholder }) => (
                            <div key={key} className="space-y-2">
                                <Label>{label}</Label>
                                <Input type="number" step="any" placeholder={placeholder}
                                    value={(data.vitals as Record<string, string>)[key]}
                                    onChange={(e) => setData('vitals', { ...data.vitals, [key]: e.target.value })} />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Diagnoses */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Diagnoses</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addDiagnosis}>
                            <Plus className="mr-1 h-3 w-3" />Add Diagnosis
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.diagnoses.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No diagnoses added yet.</p>
                        ) : data.diagnoses.map((d, i) => (
                            <div key={i} className="grid gap-3 sm:grid-cols-4 border rounded-lg p-3">
                                <div className="sm:col-span-2 space-y-1">
                                    <Label>Diagnosis Name <span className="text-destructive">*</span></Label>
                                    <Input value={d.diagnosis_name}
                                        onChange={(e) => updateDiagnosis(i, 'diagnosis_name', e.target.value)}
                                        placeholder="e.g. Hypertension" />
                                </div>
                                <div className="space-y-1">
                                    <Label>ICD-10 Code</Label>
                                    <Input value={d.icd10_code}
                                        onChange={(e) => updateDiagnosis(i, 'icd10_code', e.target.value)}
                                        placeholder="e.g. I10" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Type</Label>
                                    <div className="flex gap-2">
                                        <Select value={d.type} onValueChange={(v) => updateDiagnosis(i, 'type', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="primary">Primary</SelectItem>
                                                <SelectItem value="secondary">Secondary</SelectItem>
                                                <SelectItem value="differential">Differential</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="ghost" size="icon"
                                            onClick={() => removeDiagnosis(i)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Clinical Notes */}
                <Card>
                    <CardHeader><CardTitle>Clinical Notes</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        {([
                            { key: 'history_of_present_illness', label: 'History of Present Illness' },
                            { key: 'past_medical_history', label: 'Past Medical History' },
                            { key: 'physical_examination', label: 'Physical Examination' },
                            { key: 'assessment', label: 'Assessment' },
                            { key: 'plan', label: 'Plan' },
                        ] as const).map(({ key, label }) => (
                            <div key={key} className="space-y-2">
                                <Label>{label}</Label>
                                <textarea className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data[key]}
                                    onChange={(e) => setData(key, e.target.value)}
                                    placeholder={label} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </form>
        </>
    );
}

EmrCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Medical Records', href: '/emr' },
        { title: 'New Record', href: '/emr/create' },
    ],
};
