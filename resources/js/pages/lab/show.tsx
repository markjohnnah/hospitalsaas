import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { LabOrder, LabResult } from '@/types/auth';
import { index as labIndex, update as labUpdate } from '@/routes/lab';

type Props = { order: LabOrder };

const flagColors: Record<string, string> = {
    normal: 'bg-green-100 text-green-800',
    low: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical_low: 'bg-red-200 text-red-900',
    critical_high: 'bg-red-200 text-red-900',
};

const statusColors: Record<string, string> = {
    ordered: 'bg-yellow-100 text-yellow-800',
    sample_collected: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

const nextStatus: Record<string, string> = {
    ordered: 'sample_collected',
    sample_collected: 'processing',
    processing: 'completed',
};

export default function LabShow({ order }: Props) {
    const { data, setData, put, processing } = useForm({
        status: order.status,
        sample_collected_at: order.sample_collected_at?.slice(0, 16) ?? '',
        completed_at: order.completed_at?.slice(0, 16) ?? '',
        results: (order.results ?? []).map((r) => ({
            lab_result_id: r.id,
            result_value: r.result_value ?? '',
            flag: r.flag,
            notes: r.notes ?? '',
        })),
    });

    function updateResult(index: number, field: string, value: string) {
        const updated = [...data.results];
        updated[index] = { ...updated[index], [field]: value };
        setData('results', updated);
    }

    function save(e: React.FormEvent) {
        e.preventDefault();
        put(labUpdate(order.id).url);
    }

    function advanceStatus() {
        if (nextStatus[order.status]) {
            setData('status', nextStatus[order.status]);
        }
    }

    return (
        <>
            <Head title={`Lab Order ${order.order_number}`} />
            <form onSubmit={save} className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={labIndex.url()}>
                            <Button variant="ghost" size="icon" type="button"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{order.order_number}</h1>
                            <p className="text-muted-foreground">
                                {order.patient?.first_name} {order.patient?.last_name} \u2014 Dr. {order.doctor?.user?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={statusColors[order.status]}>{order.status.replace('_', ' ')}</Badge>
                        {nextStatus[order.status] && (
                            <Button type="button" variant="outline" onClick={advanceStatus}>
                                Mark as {nextStatus[order.status].replace('_', ' ')}
                            </Button>
                        )}
                        <Button type="submit" disabled={processing}>Save</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>Order Information</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={data.status} onValueChange={(v) => setData('status', v as LabOrder['status'])}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ordered">Ordered</SelectItem>
                                    <SelectItem value="sample_collected">Sample Collected</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Sample Collected At</Label>
                            <Input type="datetime-local" value={data.sample_collected_at}
                                onChange={(e) => setData('sample_collected_at', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Completed At</Label>
                            <Input type="datetime-local" value={data.completed_at}
                                onChange={(e) => setData('completed_at', e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                {(order.results?.length ?? 0) > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Test Results</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.results?.map((result, i) => (
                                    <div key={result.id} className="grid gap-3 sm:grid-cols-4 border rounded-lg p-3">
                                        <div className="sm:col-span-1">
                                            <p className="font-medium text-sm">{result.lab_test?.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {result.lab_test?.unit && `Unit: ${result.lab_test.unit}`}
                                                {result.lab_test?.normal_range && ` \u2014 Normal: ${result.lab_test.normal_range}`}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Result Value</Label>
                                            <Input value={data.results[i]?.result_value ?? ''}
                                                onChange={(e) => updateResult(i, 'result_value', e.target.value)}
                                                placeholder="Enter value" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Flag</Label>
                                            <Select value={data.results[i]?.flag ?? 'normal'}
                                                onValueChange={(v) => updateResult(i, 'flag', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="critical_low">Critical Low</SelectItem>
                                                    <SelectItem value="critical_high">Critical High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Notes</Label>
                                            <Input value={data.results[i]?.notes ?? ''}
                                                onChange={(e) => updateResult(i, 'notes', e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </form>
        </>
    );
}

LabShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laboratory', href: '/lab' },
        { title: 'Order Details', href: '#' },
    ],
};
