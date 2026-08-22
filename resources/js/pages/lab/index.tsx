import { Head, Link, router } from '@inertiajs/react';
import { Eye, FlaskConical, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { LabOrder, PaginatedResult, Patient } from '@/types/auth';
import { index as labIndex, create as labCreate, show as labShow } from '@/routes/lab';

type Props = {
    orders: PaginatedResult<LabOrder>;
    stats: { total: number; ordered: number; processing: number; completed: number };
    filters: { status?: string; priority?: string; patient_id?: string };
    patients: Pick<Patient, 'id' | 'first_name' | 'last_name' | 'mrn'>[];
};

const statusColors: Record<string, string> = {
    ordered: 'bg-yellow-100 text-yellow-800',
    sample_collected: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<string, string> = {
    routine: 'bg-gray-100 text-gray-800',
    urgent: 'bg-orange-100 text-orange-800',
    stat: 'bg-red-100 text-red-800',
};

export default function LabIndex({ orders, stats, filters, patients }: Props) {
    const [status, setStatus] = useState(filters.status ?? '');
    const [priority, setPriority] = useState(filters.priority ?? '');

    function applyFilter(key: string, value: string) {
        router.get(labIndex.url(), { ...filters, [key]: value === 'all' ? '' : value }, { replace: true });
    }

    return (
        <>
            <Head title="Laboratory" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laboratory Orders</h1>
                        <p className="text-muted-foreground">{orders.total} orders</p>
                    </div>
                    <Link href={labCreate.url()}>
                        <Button><Plus className="mr-2 h-4 w-4" />New Order</Button>
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                    {[{ label: 'Total', value: stats.total, color: 'text-foreground' },
                      { label: 'Ordered', value: stats.ordered, color: 'text-yellow-600' },
                      { label: 'Processing', value: stats.processing, color: 'text-purple-600' },
                      { label: 'Completed', value: stats.completed, color: 'text-green-600' }].map(({ label, value, color }) => (
                        <Card key={label}>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
                            <CardContent><p className={`text-3xl font-bold ${color}`}>{value}</p></CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-3">
                            <Select value={status} onValueChange={(v) => { setStatus(v); applyFilter('status', v); }}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="ordered">Ordered</SelectItem>
                                    <SelectItem value="sample_collected">Sample Collected</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={priority} onValueChange={(v) => { setPriority(v); applyFilter('priority', v); }}>
                                <SelectTrigger className="w-36"><SelectValue placeholder="All Priorities" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="routine">Routine</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="stat">STAT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                                        <th className="px-4 py-3 text-left font-medium">Doctor</th>
                                        <th className="px-4 py-3 text-left font-medium">Date</th>
                                        <th className="px-4 py-3 text-left font-medium">Priority</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orders.data.length === 0 ? (
                                        <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                            <FlaskConical className="mx-auto mb-2 h-8 w-8 opacity-30" />No lab orders found.
                                        </td></tr>
                                    ) : orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                                            <td className="px-4 py-3 font-medium">{order.patient?.first_name} {order.patient?.last_name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">Dr. {order.doctor?.user?.name}</td>
                                            <td className="px-4 py-3">{new Date(order.ordered_date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3"><Badge className={priorityColors[order.priority]}>{order.priority.toUpperCase()}</Badge></td>
                                            <td className="px-4 py-3"><Badge className={statusColors[order.status]}>{order.status.replace('_', ' ')}</Badge></td>
                                            <td className="px-4 py-3">
                                                <Link href={labShow(order.id).url}>
                                                    <Button variant="ghost" size="sm"><Eye className="mr-1 h-3 w-3" />View</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {orders.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">Showing {orders.from}\u2013{orders.to} of {orders.total}</p>
                                <div className="flex gap-1">
                                    {orders.links.map((link, i) => (
                                        <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)} dangerouslySetInnerHTML={{ __html: link.label }} />
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

LabIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laboratory', href: '/lab' },
    ],
};
