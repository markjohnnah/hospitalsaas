import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Bed, Patient, Ward } from '@/types/auth';
import { store as inpatientStore } from '@/routes/inpatient';

type Props = {
    patients: Pick<Patient, 'id' | 'first_name' | 'last_name' | 'mrn'>[];
    doctors: { id: number; name: string }[];
    wards: (Ward & { available_beds: Bed[] })[];
};

export default function InpatientCreate({ patients, doctors, wards }: Props) {
    const [selectedWardId, setSelectedWardId] = useState('');
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        admitting_doctor_id: '',
        ward_id: '',
        bed_id: '',
        admitted_at: new Date().toISOString().slice(0, 16),
        admission_type: 'elective',
        diagnosis_on_admission: '',
    });

    const selectedWard = wards.find((w) => String(w.id) === selectedWardId);
    const availableBeds = selectedWard?.available_beds ?? [];

    function selectWard(wardId: string) {
        setSelectedWardId(wardId);
        setData({ ...data, ward_id: wardId, bed_id: '' });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(inpatientStore.url());
    }

    return (
        <>
            <Head title="Admit Patient" />
            <form onSubmit={submit} className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Admit Patient</h1>
                    <Button type="submit" disabled={processing}>Confirm Admission</Button>
                </div>

                <Card>
                    <CardHeader><CardTitle>Admission Details</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Patient <span className="text-destructive">*</span></Label>
                            <Select value={data.patient_id} onValueChange={(v) => setData('patient_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
                                <SelectContent>
                                    {patients.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.first_name} {p.last_name} \u2014 {p.mrn}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.patient_id && <p className="text-sm text-destructive">{errors.patient_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Admitting Doctor <span className="text-destructive">*</span></Label>
                            <Select value={data.admitting_doctor_id} onValueChange={(v) => setData('admitting_doctor_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select doctor..." /></SelectTrigger>
                                <SelectContent>
                                    {doctors.map((d) => <SelectItem key={d.id} value={String(d.id)}>Dr. {d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.admitting_doctor_id && <p className="text-sm text-destructive">{errors.admitting_doctor_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Admission Type <span className="text-destructive">*</span></Label>
                            <Select value={data.admission_type} onValueChange={(v) => setData('admission_type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="elective">Elective</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ward <span className="text-destructive">*</span></Label>
                            <Select value={selectedWardId} onValueChange={selectWard}>
                                <SelectTrigger><SelectValue placeholder="Select ward..." /></SelectTrigger>
                                <SelectContent>
                                    {wards.map((w) => (
                                        <SelectItem key={w.id} value={String(w.id)}>
                                            {w.name} ({w.available_beds.length} beds available)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.ward_id && <p className="text-sm text-destructive">{errors.ward_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Bed <span className="text-destructive">*</span></Label>
                            <Select value={data.bed_id} onValueChange={(v) => setData('bed_id', v)} disabled={!selectedWardId}>
                                <SelectTrigger><SelectValue placeholder={selectedWardId ? 'Select bed...' : 'Select ward first'} /></SelectTrigger>
                                <SelectContent>
                                    {availableBeds.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>{b.bed_number} ({b.type})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.bed_id && <p className="text-sm text-destructive">{errors.bed_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Admitted At <span className="text-destructive">*</span></Label>
                            <Input type="datetime-local" value={data.admitted_at}
                                onChange={(e) => setData('admitted_at', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                            <Label>Diagnosis on Admission</Label>
                            <Input value={data.diagnosis_on_admission}
                                onChange={(e) => setData('diagnosis_on_admission', e.target.value)}
                                placeholder="Primary diagnosis at time of admission..." />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </>
    );
}

InpatientCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inpatient', href: '/inpatient' },
        { title: 'Admit Patient', href: '/inpatient/create' },
    ],
};
