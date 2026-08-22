import { Head, usePage } from '@inertiajs/react';
import {
    Activity,
    Bed,
    Building2,
    Calendar,
    Heart,
    Shield,
    Stethoscope,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Auth, DashboardStat } from '@/types';

const iconMap: Record<string, React.ElementType> = {
    building: Building2,
    activity: Activity,
    users: Users,
    shield: Shield,
    'heart-pulse': Heart,
    stethoscope: Stethoscope,
    bed: Bed,
    calendar: Calendar,
};

function StatCard({ stat }: { stat: DashboardStat }) {
    const Icon = iconMap[stat.icon] ?? Activity;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                </CardTitle>
                <div className="rounded-md bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
        </Card>
    );
}

type Props = {
    stats: DashboardStat[];
    role: string;
};

export default function Dashboard({ stats, role }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;

    const greeting = role === 'super_admin'
        ? 'System Overview'
        : `${auth.user.tenant_id ? '' : ''}Welcome back, ${auth.user.name}`;

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
                    <p className="text-muted-foreground">
                        Hospital Management System &mdash; {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.label} stat={stat} />
                    ))}
                </div>

                {/* Quick action cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-full border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Activity className="mb-3 h-8 w-8 opacity-40" />
                            <p className="text-sm">
                                More analytics and recent activity will appear here as you add data to the system.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
