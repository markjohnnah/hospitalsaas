import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Admission } from '@/types/auth';
import { index as inpatientIndex, update as inpatientUpdate } from '@/routes/inpatient';

type Props = { admission: Admission };

const statusColors: Record<string, string> = {
    admitted: 'bg-green-100 text-green-800',
    discharged: 'bg-gray-100 text-gray-800',
    transferred: 'bg-blue-100 text-blue-800',
};

export default function InpatientShow({ admission }: Props) {
    const { data, setData, put, processing } = useForm({
        status: admission.status,
        discharged_at: admission.discharged_at?.slice(0, 16) ?? '',
        discharge_summary: admission.discharge_summary ?? '',
        discharge_condition: admission.discharge_condition ?? '',
    });

    function save(e: React.FormEvent) {
        e.preventDefault();
        put(inpatientUpdate(admission.id).url);
    }

    return (
        <>
            <Head title={`Admission ${admission.admission_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={inpatientIndex.url()}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{admission.admission_number}</h1>
                            <p className="text-muted-foreground">
                                {admission.patient?.first_name} {admission.patient?.last_name}
                            </p>
                        </div>
                    </div>
                    <Badge className={statusColors[admission.status]}>{admission.status}</Badge>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader><CardTitle>Admission Information</CardTitle></CardHeader>
                        <CardContent>
                            <dl className="grid gap-3 sm:grid-cols-2">
                                <div><dt className="text-xs text-muted-foreground">Patient</dt><dd className="font-medium">{admission.patient?.first_name} {admission.patient?.last_name}</dd></div>
                                <div><dt className="text-xs text-muted-foreground">Admitting Doctor</dt><dd className="font-medium">Dr. {admission.admitting_doctor?.user?.name}</dd></div>
                                <div><dt className="text-xs text-muted-foreground">Ward</dt><dd className="font-medium">{admission.ward?.name}</dd></div>
                                <div><dt className="text-xs text-muted-foreground">Bed</dt><dd className="font-medium">{admission.bed?.bed_number}</dd></div>
                                <div><dt className="text-xs text-muted-foreground">Admission Type</dt><dd className="font-medium capitalize">{admission.admission_type}</dd></div>
                                <div><dt className="text-xs text-muted-foreground">Admitted At</dt><dd className="font-medium">{new Date(admission.admitted_at).toLocaleString()}</dd></div>
                                {admission.diagnosis_on_admission && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs text-muted-foreground">Diagnosis on Admission</dt>
                                        <dd className="font-medium">{admission.diagnosis_on_admission}</dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Days Admitted</CardTitle></CardHeader>
                        <CardContent className="flex items-center justify-center py-8">
                            <p className="text-5xl font-bold">{admission.days_admitted ?? '\u2014'}</p>
                        </CardContent>
                    </Card>
                </div>

                {admission.status === 'admitted' && (
                    <Card>
                        <CardHeader><CardTitle>Discharge Patient</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v as Admission['status'])}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admitted">Admitted</SelectItem>
                                            <SelectItem value="discharged">Discharged</SelectItem>
                                            <SelectItem value="transferred">Transferred</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Discharged At</Label>
                                    <Input type="datetime-local" value={data.discharged_at}
                                        onChange={(e) => setData('discharged_at', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Discharge Condition</Label>
                                    <Select value={data.discharge_condition} onValueChange={(v) => setData('discharge_condition', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="improved">Improved</SelectItem>
                                            <SelectItem value="recovered">Recovered</SelectItem>
                                            <SelectItem value="referred">Referred</SelectItem>
                                            <SelectItem value="against_advice">Against Advice</SelectItem>
                                            <SelectItem value="deceased">Deceased</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                                    <Label>Discharge Summary</Label>
                                    <textarea className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={data.discharge_summary}
                                        onChange={(e) => setData('discharge_summary', e.target.value)}
                                        placeholder="Discharge summary..." />
                                </div>
                                <div>
                                    <Button type="submit" disabled={processing}>Update Admission</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {admission.status !== 'admitted' && admission.discharge_summary && (
                    <Card>
                        <CardHeader><CardTitle>Discharge Summary</CardTitle></CardHeader>
                        <CardContent>
                            <dl className="grid gap-3 sm:grid-cols-2">
                                <div><dt className="text-xs text-muted-foreground">Discharged At</dt><dd>{admission.discharged_at ? new Date(admission.discharged_at).toLocaleString() : '\u2014'}</dd></div>
                                <div><dt className="text-xs text-muted-foreground">Condition</dt><dd className="capitalize">{admission.discharge_condition ?? '\u2014'}</dd></div>
                                <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Summary</dt><dd className="whitespace-pre-wrap">{admission.discharge_summary}</dd></div>
                            </dl>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

InpatientShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inpatient', href: '/inpatient' },
        { title: 'Admission Details', href: '#' },
    ],
};
