import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { ImagingType, Patient } from '@/types/auth';
import { store as radiologyStore } from '@/routes/radiology';

type Props = {
    patients: Pick<Patient, 'id' | 'first_name' | 'last_name' | 'mrn'>[];
    doctors: { id: number; name: string }[];
    imaging_types: ImagingType[];
};

export default function RadiologyCreate({ patients, doctors, imaging_types }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        doctor_id: '',
        imaging_type_id: '',
        medical_record_id: '',
        body_part: '',
        priority: 'routine',
        ordered_date: new Date().toISOString().slice(0, 10),
        clinical_indication: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(radiologyStore.url());
    }

    return (
        <>
            <Head title="New Radiology Order" />
            <form onSubmit={submit} className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">New Radiology Order</h1>
                    <Button type="submit" disabled={processing}>Create Order</Button>
                </div>

                <Card>
                    <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
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
                            <Label>Ordering Doctor <span className="text-destructive">*</span></Label>
                            <Select value={data.doctor_id} onValueChange={(v) => setData('doctor_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select doctor..." /></SelectTrigger>
                                <SelectContent>
                                    {doctors.map((d) => <SelectItem key={d.id} value={String(d.id)}>Dr. {d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.doctor_id && <p className="text-sm text-destructive">{errors.doctor_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Study Type <span className="text-destructive">*</span></Label>
                            <Select value={data.imaging_type_id} onValueChange={(v) => setData('imaging_type_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select study..." /></SelectTrigger>
                                <SelectContent>
                                    {imaging_types.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.imaging_type_id && <p className="text-sm text-destructive">{errors.imaging_type_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Body Part</Label>
                            <Input value={data.body_part} onChange={(e) => setData('body_part', e.target.value)}
                                placeholder="e.g. Chest, Abdomen..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={data.priority} onValueChange={(v) => setData('priority', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="routine">Routine</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="stat">STAT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ordered Date</Label>
                            <Input type="date" value={data.ordered_date} onChange={(e) => setData('ordered_date', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                            <Label>Clinical Indication</Label>
                            <Input value={data.clinical_indication} onChange={(e) => setData('clinical_indication', e.target.value)}
                                placeholder="Reason for imaging..." />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </>
    );
}

RadiologyCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Radiology', href: '/radiology' },
        { title: 'New Order', href: '/radiology/create' },
    ],
};
