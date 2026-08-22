import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus, RadioTower } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { PaginatedResult, Patient, RadiologyOrder } from '@/types/auth';
import { index as radiologyIndex, create as radiologyCreate, show as radiologyShow } from '@/routes/radiology';

type Props = {
    orders: PaginatedResult<RadiologyOrder>;
    stats: { total: number; ordered: number; in_progress: number; completed: number };
    filters: { status?: string; priority?: string; patient_id?: string };
    patients: Pick<Patient, 'id' | 'first_name' | 'last_name' | 'mrn'>[];
};

const statusColors: Record<string, string> = {
    ordered: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

export default function RadiologyIndex({ orders, stats, filters, patients }: Props) {
    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilter(key: string, value: string) {
        router.get(radiologyIndex.url(), { ...filters, [key]: value === 'all' ? '' : value }, { replace: true });
    }

    return (
        <>
            <Head title="Radiology" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Radiology Orders</h1>
                        <p className="text-muted-foreground">{orders.total} orders</p>
                    </div>
                    <Link href={radiologyCreate.url()}>
                        <Button><Plus className="mr-2 h-4 w-4" />New Order</Button>
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                    {[{ label: 'Total', value: stats.total, color: 'text-foreground' },
                      { label: 'Ordered', value: stats.ordered, color: 'text-yellow-600' },
                      { label: 'In Progress', value: stats.in_progress, color: 'text-purple-600' },
                      { label: 'Completed', value: stats.completed, color: 'text-green-600' }].map(({ label, value, color }) => (
                        <Card key={label}>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
                            <CardContent><p className={`text-3xl font-bold ${color}`}>{value}</p></CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <Select value={status} onValueChange={(v) => { setStatus(v); applyFilter('status', v); }}>
                            <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="ordered">Ordered</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Order #</th>
                                        <th className="px-4 py-3 text-left font-medium">Patient</th>
                                        <th className="px-4 py-3 text-left font-medium">Study Type</th>
                                        <th className="px-4 py-3 text-left font-medium">Body Part</th>
                                        <th className="px-4 py-3 text-left font-medium">Date</th>
                                        <th className="px-4 py-3 text-left font-medium">Priority</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orders.data.length === 0 ? (
                                        <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                                            <RadioTower className="mx-auto mb-2 h-8 w-8 opacity-30" />No radiology orders found.
                                        </td></tr>
                                    ) : orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                                            <td className="px-4 py-3 font-medium">{order.patient?.first_name} {order.patient?.last_name}</td>
                                            <td className="px-4 py-3">{order.imaging_type?.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{order.body_part ?? '\u2014'}</td>
                                            <td className="px-4 py-3">{new Date(order.ordered_date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3"><Badge variant="outline">{order.priority.toUpperCase()}</Badge></td>
                                            <td className="px-4 py-3"><Badge className={statusColors[order.status]}>{order.status.replace('_', ' ')}</Badge></td>
                                            <td className="px-4 py-3">
                                                <Link href={radiologyShow(order.id).url}>
                                                    <Button variant="ghost" size="sm"><Eye className="mr-1 h-3 w-3" />View</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

RadiologyIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Radiology', href: '/radiology' },
    ],
};
