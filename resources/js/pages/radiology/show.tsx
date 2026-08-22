import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { RadiologyOrder } from '@/types/auth';
import { index as radiologyIndex, update as radiologyUpdate } from '@/routes/radiology';

type Props = { order: RadiologyOrder };

const statusColors: Record<string, string> = {
    ordered: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

export default function RadiologyShow({ order }: Props) {
    const { data, setData, put, processing } = useForm({
        status: order.status,
        scheduled_at: order.scheduled_at?.slice(0, 16) ?? '',
        completed_at: order.completed_at?.slice(0, 16) ?? '',
        report: order.report ?? '',
    });

    function save(e: React.FormEvent) {
        e.preventDefault();
        put(radiologyUpdate(order.id).url);
    }

    return (
        <>
            <Head title={`Radiology ${order.order_number}`} />
            <form onSubmit={save} className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={radiologyIndex.url()}>
                            <Button variant="ghost" size="icon" type="button"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{order.order_number}</h1>
                            <p className="text-muted-foreground">
                                {order.patient?.first_name} {order.patient?.last_name} \u2014 {order.imaging_type?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={statusColors[order.status]}>{order.status.replace('_', ' ')}</Badge>
                        <Button type="submit" disabled={processing}>Save</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>Order Information</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div><p className="text-xs text-muted-foreground">Patient</p><p className="font-medium">{order.patient?.first_name} {order.patient?.last_name}</p></div>
                        <div><p className="text-xs text-muted-foreground">Doctor</p><p className="font-medium">Dr. {order.doctor?.user?.name}</p></div>
                        <div><p className="text-xs text-muted-foreground">Study</p><p className="font-medium">{order.imaging_type?.name}</p></div>
                        <div><p className="text-xs text-muted-foreground">Body Part</p><p className="font-medium">{order.body_part ?? '\u2014'}</p></div>
                        {order.clinical_indication && (
                            <div className="sm:col-span-2 lg:col-span-4">
                                <p className="text-xs text-muted-foreground">Clinical Indication</p>
                                <p className="font-medium">{order.clinical_indication}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Status Update</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={data.status} onValueChange={(v) => setData('status', v as RadiologyOrder['status'])}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ordered">Ordered</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Scheduled At</Label>
                            <Input type="datetime-local" value={data.scheduled_at}
                                onChange={(e) => setData('scheduled_at', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Completed At</Label>
                            <Input type="datetime-local" value={data.completed_at}
                                onChange={(e) => setData('completed_at', e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Radiology Report</CardTitle></CardHeader>
                    <CardContent>
                        <textarea className="flex min-h-48 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={data.report}
                            onChange={(e) => setData('report', e.target.value)}
                            placeholder="Enter radiology report findings here..." />
                    </CardContent>
                </Card>
            </form>
        </>
    );
}

RadiologyShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Radiology', href: '/radiology' },
        { title: 'Order Details', href: '#' },
    ],
};
