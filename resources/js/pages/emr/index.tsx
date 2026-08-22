import { Head, Link, router } from '@inertiajs/react';
import { Eye, FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Doctor, MedicalRecord, PaginatedResult, Patient } from '@/types/auth';
import { index as emrIndex, create as emrCreate, show as emrShow } from '@/routes/emr';

type Props = {
    records: PaginatedResult<MedicalRecord & { patient: Pick<Patient, 'id' | 'first_name' | 'last_name'>; doctor: Doctor }>;
    filters: { patient_id?: string; doctor_id?: string; status?: string; visit_type?: string };
    patients: Pick<Patient, 'id' | 'first_name' | 'last_name' | 'mrn'>[];
    doctors: { id: number; name: string }[];
};

const statusColors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    finalized: 'bg-green-100 text-green-800',
    amended: 'bg-blue-100 text-blue-800',
};

const visitTypeLabels: Record<string, string> = {
    outpatient: 'Outpatient',
    inpatient: 'Inpatient',
    emergency: 'Emergency',
    follow_up: 'Follow-up',
    telemedicine: 'Telemedicine',
};

export default function EmrIndex({ records, filters, patients, doctors }: Props) {
    const [status, setStatus] = useState(filters.status ?? '');
    const [visitType, setVisitType] = useState(filters.visit_type ?? '');

    function applyFilter(key: string, value: string) {
        router.get(emrIndex.url(), { ...filters, [key]: value === 'all' ? '' : value }, { replace: true, preserveScroll: true });
    }

    return (
        <>
            <Head title="Medical Records" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Medical Records</h1>
                        <p className="text-muted-foreground">{records.total} records</p>
                    </div>
                    <Link href={emrCreate.url()}>
                        <Button><Plus className="mr-2 h-4 w-4" />New Record</Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-3">
                            <Select value={status} onValueChange={(v) => { setStatus(v); applyFilter('status', v); }}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="finalized">Finalized</SelectItem>
                                    <SelectItem value="amended">Amended</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={visitType} onValueChange={(v) => { setVisitType(v); applyFilter('visit_type', v); }}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="All Visit Types" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {Object.entries(visitTypeLabels).map(([k, v]) => (
                                        <SelectItem key={k} value={k}>{v}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {(filters.status || filters.visit_type) && (
                                <Button variant="outline" onClick={() => router.get(emrIndex.url())}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Record #</th>
                                        <th className="px-4 py-3 text-left font-medium">Patient</th>
                                        <th className="px-4 py-3 text-left font-medium">Doctor</th>
                                        <th className="px-4 py-3 text-left font-medium">Visit Date</th>
                                        <th className="px-4 py-3 text-left font-medium">Type</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {records.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                                <FileText className="mx-auto mb-2 h-8 w-8 opacity-30" />
                                                No medical records found.
                                            </td>
                                        </tr>
                                    ) : records.data.map((record) => (
                                        <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{record.record_number}</td>
                                            <td className="px-4 py-3 font-medium">
                                                {record.patient?.first_name} {record.patient?.last_name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                Dr. {record.doctor?.user?.name}
                                            </td>
                                            <td className="px-4 py-3">{new Date(record.visit_date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline">{visitTypeLabels[record.visit_type]}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className={statusColors[record.status]}>{record.status}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={emrShow(record.id).url}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="mr-1 h-3 w-3" />View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {records.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">Showing {records.from}\u2013{records.to} of {records.total}</p>
                                <div className="flex gap-1">
                                    {records.links.map((link, i) => (
                                        <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm"
                                            disabled={!link.url} onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EmrIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Medical Records', href: '/emr' },
    ],
};
