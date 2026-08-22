import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Pill } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Medication, PaginatedResult, Prescription } from '@/types/auth';
import { index as pharmacyIndex } from '@/routes/pharmacy';

type Props = {
    prescriptions: PaginatedResult<Prescription>;
    medications: Medication[];
    stats: { active_prescriptions: number; dispensed_today: number; low_stock: number; total_medications: number };
    filters: { status?: string };
};

const prescriptionStatusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    dispensed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
};

export default function PharmacyIndex({ prescriptions, medications, stats, filters }: Props) {
    const [activeTab, setActiveTab] = useState<'prescriptions' | 'medications'>('prescriptions');
    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilter(value: string) {
        router.get(pharmacyIndex.url(), { status: value === 'all' ? '' : value }, { replace: true });
    }

    return (
        <>
            <Head title="Pharmacy" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pharmacy</h1>
                    <p className="text-muted-foreground">Prescription management and medication catalog</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Prescriptions</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold text-green-600">{stats.active_prescriptions}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Dispensed Today</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{stats.dispensed_today}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Low Stock Items</CardTitle></CardHeader>
                        <CardContent>
                            <p className={`text-3xl font-bold ${stats.low_stock > 0 ? 'text-red-600' : ''}`}>{stats.low_stock}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Medications</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{stats.total_medications}</p></CardContent>
                    </Card>
                </div>

                <div className="flex gap-2 border-b">
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'prescriptions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('prescriptions')}>Prescriptions</button>
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'medications' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('medications')}>Medications Catalog</button>
                </div>

                {activeTab === 'prescriptions' && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="mb-4 flex gap-3">
                                <Select value={status} onValueChange={(v) => { setStatus(v); applyFilter(v); }}>
                                    <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="dispensed">Dispensed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Rx #</th>
                                        <th className="px-4 py-3 text-left font-medium">Patient</th>
                                        <th className="px-4 py-3 text-left font-medium">Doctor</th>
                                        <th className="px-4 py-3 text-left font-medium">Date</th>
                                        <th className="px-4 py-3 text-left font-medium">Items</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {prescriptions.data.length === 0 ? (
                                        <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            <Pill className="mx-auto mb-2 h-8 w-8 opacity-30" />No prescriptions found.
                                        </td></tr>
                                    ) : prescriptions.data.map((rx) => (
                                        <tr key={rx.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs">{rx.prescription_number}</td>
                                            <td className="px-4 py-3 font-medium">{rx.patient?.first_name} {rx.patient?.last_name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">Dr. {rx.doctor?.user?.name}</td>
                                            <td className="px-4 py-3">{new Date(rx.prescribed_date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">{rx.items?.length ?? 0} items</td>
                                            <td className="px-4 py-3"><Badge className={prescriptionStatusColors[rx.status]}>{rx.status}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {prescriptions.last_page > 1 && (
                                <div className="flex items-center justify-between border-t px-4 py-3">
                                    <p className="text-sm text-muted-foreground">Showing {prescriptions.from}\u2013{prescriptions.to} of {prescriptions.total}</p>
                                    <div className="flex gap-1">
                                        {prescriptions.links.map((link, i) => (
                                            <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'medications' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Code</th>
                                        <th className="px-4 py-3 text-left font-medium">Brand Name</th>
                                        <th className="px-4 py-3 text-left font-medium">Generic</th>
                                        <th className="px-4 py-3 text-left font-medium">Category</th>
                                        <th className="px-4 py-3 text-left font-medium">Stock</th>
                                        <th className="px-4 py-3 text-left font-medium">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {medications.length === 0 ? (
                                        <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No medications in catalog.</td></tr>
                                    ) : medications.map((m) => (
                                        <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs">{m.code}</td>
                                            <td className="px-4 py-3 font-medium">
                                                {m.brand_name}
                                                {m.strength && <span className="text-muted-foreground ml-1 text-xs">{m.strength}</span>}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{m.generic_name ?? '\u2014'}</td>
                                            <td className="px-4 py-3">{m.category ?? '\u2014'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={m.quantity_in_stock <= m.reorder_level ? 'text-red-600 font-medium' : ''}>
                                                        {m.quantity_in_stock} {m.unit}
                                                    </span>
                                                    {m.quantity_in_stock <= m.reorder_level && (
                                                        <AlertTriangle className="h-3 w-3 text-red-500" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">${m.unit_price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

PharmacyIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pharmacy', href: '/pharmacy' },
    ],
};
