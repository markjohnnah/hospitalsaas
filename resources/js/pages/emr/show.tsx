import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { MedicalRecord } from '@/types/auth';
import { index as emrIndex, edit as emrEdit, update as emrUpdate } from '@/routes/emr';

const statusColors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    finalized: 'bg-green-100 text-green-800',
    amended: 'bg-blue-100 text-blue-800',
};

type Props = { record: MedicalRecord };

export default function EmrShow({ record }: Props) {
    function finalize() {
        router.put(emrUpdate(record.id).url, { ...record, status: 'finalized' });
    }

    return (
        <>
            <Head title={`Record ${record.record_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={emrIndex.url()}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{record.record_number}</h1>
                            <p className="text-muted-foreground">
                                {record.patient?.first_name} {record.patient?.last_name} &mdash; Dr. {record.doctor?.user?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={statusColors[record.status]}>{record.status}</Badge>
                        {record.status === 'draft' && (
                            <>
                                <Button variant="outline" onClick={finalize}>Finalize</Button>
                                <Link href={emrEdit(record.id).url}>
                                    <Button><Edit className="mr-2 h-4 w-4" />Edit</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Vitals */}
                {record.vitals && (
                    <Card>
                        <CardHeader><CardTitle>Vitals</CardTitle></CardHeader>
                        <CardContent>
                            <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                {record.vitals.temperature && <div><dt className="text-xs text-muted-foreground">Temperature</dt><dd className="font-medium">{record.vitals.temperature}°C</dd></div>}
                                {record.vitals.pulse_rate && <div><dt className="text-xs text-muted-foreground">Pulse Rate</dt><dd className="font-medium">{record.vitals.pulse_rate} bpm</dd></div>}
                                {record.vitals.systolic_bp && <div><dt className="text-xs text-muted-foreground">Blood Pressure</dt><dd className="font-medium">{record.vitals.systolic_bp}/{record.vitals.diastolic_bp} mmHg</dd></div>}
                                {record.vitals.oxygen_saturation && <div><dt className="text-xs text-muted-foreground">O₂ Sat</dt><dd className="font-medium">{record.vitals.oxygen_saturation}%</dd></div>}
                                {record.vitals.weight && <div><dt className="text-xs text-muted-foreground">Weight</dt><dd className="font-medium">{record.vitals.weight} kg</dd></div>}
                                {record.vitals.height && <div><dt className="text-xs text-muted-foreground">Height</dt><dd className="font-medium">{record.vitals.height} cm</dd></div>}
                                {record.vitals.bmi && <div><dt className="text-xs text-muted-foreground">BMI</dt><dd className="font-medium">{record.vitals.bmi}</dd></div>}
                                {record.vitals.blood_glucose && <div><dt className="text-xs text-muted-foreground">Blood Glucose</dt><dd className="font-medium">{record.vitals.blood_glucose} mg/dL</dd></div>}
                            </dl>
                        </CardContent>
                    </Card>
                )}

                {/* Diagnoses */}
                {(record.diagnoses?.length ?? 0) > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Diagnoses</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {record.diagnoses?.map((d) => (
                                    <div key={d.id} className="flex items-center gap-3 rounded-lg border p-3">
                                        <Badge variant={d.type === 'primary' ? 'default' : 'outline'}>{d.type}</Badge>
                                        <div>
                                            <p className="font-medium">{d.diagnosis_name}</p>
                                            {d.icd10_code && <p className="text-xs text-muted-foreground">ICD-10: {d.icd10_code}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Clinical Notes */}
                <div className="grid gap-4 md:grid-cols-2">
                    {([
                        { key: 'chief_complaint', label: 'Chief Complaint' },
                        { key: 'history_of_present_illness', label: 'History of Present Illness' },
                        { key: 'past_medical_history', label: 'Past Medical History' },
                        { key: 'physical_examination', label: 'Physical Examination' },
                        { key: 'assessment', label: 'Assessment' },
                        { key: 'plan', label: 'Plan' },
                    ] as const).filter(({ key }) => record[key]).map(({ key, label }) => (
                        <Card key={key}>
                            <CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm">{record[key]}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Prescriptions */}
                {(record.prescriptions?.length ?? 0) > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Prescriptions</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {record.prescriptions?.map((rx) => (
                                <div key={rx.id} className="rounded-lg border p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="font-mono text-xs text-muted-foreground">{rx.prescription_number}</p>
                                        <Badge>{rx.status}</Badge>
                                    </div>
                                    {rx.items && rx.items.map((item) => (
                                        <p key={item.id} className="mt-1 text-sm">
                                            <span className="font-medium">{item.medication_name}</span> {item.dosage} &mdash; {item.frequency}
                                        </p>
                                    ))}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

EmrShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Medical Records', href: '/emr' },
        { title: 'Record Details', href: '#' },
    ],
};
