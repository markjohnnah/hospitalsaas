import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { MedicalRecord } from '@/types/auth';
import { show as emrShow, update as emrUpdate } from '@/routes/emr';

type Props = { record: MedicalRecord };

export default function EmrEdit({ record }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        visit_date: record.visit_date?.slice(0, 10) ?? '',
        visit_type: record.visit_type,
        chief_complaint: record.chief_complaint ?? '',
        history_of_present_illness: record.history_of_present_illness ?? '',
        past_medical_history: record.past_medical_history ?? '',
        physical_examination: record.physical_examination ?? '',
        assessment: record.assessment ?? '',
        plan: record.plan ?? '',
        notes: record.notes ?? '',
        status: record.status,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(emrUpdate(record.id).url);
    }

    return (
        <>
            <Head title={`Edit ${record.record_number}`} />
            <form onSubmit={submit} className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={emrShow(record.id).url}>
                            <Button variant="ghost" size="icon" type="button"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Edit {record.record_number}</h1>
                    </div>
                    <Button type="submit" disabled={processing}>Save Changes</Button>
                </div>

                <Card>
                    <CardHeader><CardTitle>Visit Details</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Visit Date</Label>
                            <Input type="date" value={data.visit_date} onChange={(e) => setData('visit_date', e.target.value)} />
                            {errors.visit_date && <p className="text-sm text-destructive">{errors.visit_date}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Visit Type</Label>
                            <Select value={data.visit_type} onValueChange={(v) => setData('visit_type', v as MedicalRecord['visit_type'])}>
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
                            <Label>Status</Label>
                            <Select value={data.status} onValueChange={(v) => setData('status', v as MedicalRecord['status'])}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="finalized">Finalized</SelectItem>
                                    <SelectItem value="amended">Amended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Chief Complaint</Label>
                            <Input value={data.chief_complaint} onChange={(e) => setData('chief_complaint', e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Clinical Notes</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        {([
                            { key: 'history_of_present_illness', label: 'History of Present Illness' },
                            { key: 'past_medical_history', label: 'Past Medical History' },
                            { key: 'physical_examination', label: 'Physical Examination' },
                            { key: 'assessment', label: 'Assessment' },
                            { key: 'plan', label: 'Plan' },
                            { key: 'notes', label: 'Additional Notes' },
                        ] as const).map(({ key, label }) => (
                            <div key={key} className="space-y-2">
                                <Label>{label}</Label>
                                <textarea className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data[key]}
                                    onChange={(e) => setData(key, e.target.value)} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </form>
        </>
    );
}

EmrEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Medical Records', href: '/emr' },
        { title: 'Edit Record', href: '#' },
    ],
};
