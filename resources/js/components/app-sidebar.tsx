import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Bed,
    Building2,
    Calendar,
    ClipboardList,
    CreditCard,
    FileText,
    FlaskConical,
    Heart,
    LayoutGrid,
    Package,
    Pill,
    RadioTower,
    Receipt,
    Settings,
    Shield,
    Stethoscope,
    Users,
    UserSquare2,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import * as adminUsersRoutes from '@/routes/admin/users';
import type { Auth, NavItem } from '@/types';

function useNavItems(): NavItem[] {
    const { auth } = usePage<{ auth: Auth }>().props;
    const role = auth.user.role;

    if (role === 'super_admin') {
        return [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
            { title: 'Hospitals', href: '/admin/tenants', icon: Building2 },
            { title: 'System Users', href: adminUsersRoutes.index.url(), icon: Shield },
            { title: 'Billing', href: '/admin/billing/plans', icon: Receipt },
        ];
    }

    const items: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    ];

    // Receptionist, Hospital Admin, Doctor, Nurse see patients
    if (['hospital_admin', 'doctor', 'nurse', 'receptionist'].includes(role)) {
        items.push({ title: 'Patients', href: '/patients', icon: UserSquare2 });
        items.push({ title: 'Appointments', href: '/appointments', icon: Calendar });
    }

    // Doctor and Hospital Admin see doctors list
    if (['hospital_admin', 'doctor'].includes(role)) {
        items.push({ title: 'Doctors', href: '/doctors', icon: Stethoscope });
    }

    // Clinical staff see EMR
    if (['doctor', 'nurse', 'hospital_admin'].includes(role)) {
        items.push({ title: 'Medical Records', href: '/emr', icon: FileText });
    }

    // Lab staff
    if (['lab_staff', 'doctor', 'hospital_admin'].includes(role)) {
        items.push({ title: 'Laboratory', href: '/lab', icon: FlaskConical });
    }

    // Pharmacy
    if (['pharmacist', 'doctor', 'hospital_admin'].includes(role)) {
        items.push({ title: 'Pharmacy', href: '/pharmacy', icon: Pill });
    }

    // Radiology
    if (['radiologist', 'doctor', 'hospital_admin'].includes(role)) {
        items.push({ title: 'Radiology', href: '/radiology', icon: RadioTower });
    }

    // Inpatient
    if (['hospital_admin', 'doctor', 'nurse'].includes(role)) {
        items.push({ title: 'Inpatient', href: '/inpatient', icon: Bed });
    }

    // Billing & Accounting
    if (['accountant', 'receptionist', 'hospital_admin'].includes(role)) {
        items.push({ title: 'Billing', href: '/billing', icon: CreditCard });
    }

    // HR & Inventory
    if (role === 'hospital_admin') {
        items.push({ title: 'Staff', href: '/staff', icon: Users });
        items.push({ title: 'Reports', href: '/reports', icon: BarChart3 });
    }

    // Patient portal
    if (role === 'patient') {
        items.push({ title: 'My Appointments', href: '/my/appointments', icon: Calendar });
        items.push({ title: 'My Records', href: '/my/records', icon: ClipboardList });
        items.push({ title: 'My Prescriptions', href: '/my/prescriptions', icon: Pill });
        items.push({ title: 'My Bills', href: '/my/billing', icon: CreditCard });
    }

    return items;
}

export function AppSidebar() {
    const navItems = useNavItems();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter
                    items={[{ title: 'Settings', href: '/settings/profile', icon: Settings }]}
                    className="mt-auto"
                />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

