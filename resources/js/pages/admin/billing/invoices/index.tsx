import { Head, Link, router } from '@inertiajs/react';
import { FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Invoice = {
    id: string;
    number: string;
    tenant_id: string;
    tenant: { id: string; name: string; slug: string };
    status: string;
    subtotal: number;
    tax_amount: number;
    total: number;
    issued_at: string;
    due_at: string;
    paid_at: string | null;
    payments: { amount: number }[];
};

type Props = {
    invoices: {
        data: Invoice[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { status?: string; tenant_id?: string };
    statuses: { name: string; value: string; label: string; color: string }[];
};

function statusColor(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (s) {
        case 'paid': return 'default';
        case 'sent': return 'secondary';
        case 'overdue': return 'destructive';
        case 'canceled': return 'outline';
        default: return 'secondary';
    }
}

function formatPrice(cents: number): string {
    return `K${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function InvoicesIndex({ invoices, filters, statuses }: Props) {
    return (
        <>
            <Head title="Invoices" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                        <p className="text-muted-foreground">Manage billing invoices — {invoices.total} total</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/billing/invoices/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Invoice
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <Select defaultValue={filters.status ?? 'all'}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {statuses.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input placeholder="Search..." className="max-w-xs" />
                </div>

                {invoices.data.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <FileText className="mb-4 h-10 w-10 text-muted-foreground/40" />
                            <h3 className="text-lg font-medium">No invoices yet</h3>
                            <p className="mb-4 text-sm text-muted-foreground">Create your first invoice.</p>
                            <Button asChild>
                                <Link href="/admin/billing/invoices/create">
                                    <Plus className="mr-2 h-4 w-4" />New Invoice
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Hospital</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Issued</TableHead>
                                        <TableHead>Due</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.data.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell>
                                                <Link href={`/admin/billing/invoices/${invoice.id}`} className="font-medium text-primary hover:underline">
                                                    {invoice.number}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{invoice.tenant?.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusColor(invoice.status)}>{invoice.status}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{formatPrice(invoice.total)}</TableCell>
                                            <TableCell className="text-muted-foreground">{invoice.issued_at}</TableCell>
                                            <TableCell className="text-muted-foreground">{invoice.due_at}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {invoice.status === 'draft' && (
                                                        <>
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <Link href={`/admin/billing/invoices/${invoice.id}/edit`}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    if (confirm('Delete this draft invoice?')) {
                                                                        router.delete(`/admin/billing/invoices/${invoice.id}`);
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
