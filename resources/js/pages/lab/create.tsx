import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { LabTest, Patient } from '@/types/auth';
import { store as labStore } from '@/routes/lab';

type Props = {
    patients: Pick<Patient, 'id' | 'first_name' | 'last_name' | 'mrn'>[];
    doctors: { id: number; name: string }[];
    lab_tests: LabTest[];
};

export default function LabCreate({ patients, doctors, lab_tests }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        doctor_id: '',
        medical_record_id: '',
        priority: 'routine',
        ordered_date: new Date().toISOString().slice(0, 10),
        clinical_notes: '',
        tests: [] as number[],
    });

    function toggleTest(testId: number) {
        setData('tests', data.tests.includes(testId)
            ? data.tests.filter((id) => id !== testId)
            : [...data.tests, testId]);
    }

    const grouped = lab_tests.reduce<Record<string, LabTest[]>>((acc, t) => {
        const cat = t.category ?? 'Other';
        acc[cat] = acc[cat] ?? [];
        acc[cat].push(t);
        return acc;
    }, {});

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(labStore.url());
    }

    return (
        <>
            <Head title="New Lab Order" />
            <form onSubmit={submit} className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">New Lab Order</h1>
                    <Button type="submit" disabled={processing || data.tests.length === 0}>Create Order</Button>
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
                            <Label>Priority <span className="text-destructive">*</span></Label>
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
                        <div className="sm:col-span-2 space-y-2">
                            <Label>Clinical Notes</Label>
                            <Input value={data.clinical_notes} onChange={(e) => setData('clinical_notes', e.target.value)}
                                placeholder="Clinical indication..." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Select Tests <span className="text-sm font-normal text-muted-foreground">({data.tests.length} selected)</span></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {errors.tests && <p className="text-sm text-destructive">{errors.tests}</p>}
                        {Object.entries(grouped).map(([category, tests]) => (
                            <div key={category}>
                                <h3 className="mb-3 font-medium text-sm text-muted-foreground uppercase tracking-wide">{category}</h3>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {tests.map((test) => (
                                        <label key={test.id}
                                            className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                                            <Checkbox checked={data.tests.includes(test.id)}
                                                onCheckedChange={() => toggleTest(test.id)} className="mt-0.5" />
                                            <div>
                                                <p className="font-medium text-sm">{test.name}</p>
                                                <p className="text-xs text-muted-foreground">{test.code}{test.normal_range ? ` \u2014 Normal: ${test.normal_range}` : ''}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {lab_tests.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-8">No lab tests configured yet.</p>
                        )}
                    </CardContent>
                </Card>
            </form>
        </>
    );
}

LabCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laboratory', href: '/lab' },
        { title: 'New Order', href: '/lab/create' },
    ],
};
