import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    BedDouble,
    Building2,
    Calendar,
    ClipboardList,
    Database,
    FileText,
    FlaskConical,
    Hospital,
    KeyRound,
    Pill,
    ReceiptText,
    ScanLine,
    ShieldCheck,
    Stethoscope,
    UserSquare2,
    Users,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        icon: UserSquare2,
        title: 'Patient Management',
        description:
            'Complete patient profiles with medical history, allergies, and chronic disease tracking.',
    },
    {
        icon: Calendar,
        title: 'Appointment Scheduling',
        description:
            'Efficiently manage doctor appointments with real-time availability and reminders.',
    },
    {
        icon: FileText,
        title: 'Electronic Medical Records',
        description:
            'Secure digital records accessible by authorized clinical staff across departments.',
    },
    {
        icon: FlaskConical,
        title: 'Laboratory Management',
        description:
            'Order lab tests, track samples, and manage results with integrated lab workflows.',
    },
    {
        icon: Pill,
        title: 'Pharmacy & Dispensing',
        description:
            'Manage prescriptions, inventory, and medication dispensing with full traceability.',
    },
    {
        icon: Stethoscope,
        title: 'Doctor & Staff Management',
        description:
            'Manage doctors, nurses, schedules, and role-based access across the hospital.',
    },
    {
        icon: Building2,
        title: 'Multi-Hospital Support',
        description:
            'Centralized platform for managing multiple hospital tenants with isolated data.',
    },
    {
        icon: Users,
        title: 'Role-Based Access Control',
        description:
            'Fine-grained permissions for super admins, hospital admins, doctors, nurses, pharmacists, and more.',
    },
];

const highlights = [
    {
        icon: Database,
        label: 'Single unified database',
        detail: 'Every module shares one secure, centralized data store.',
    },
    {
        icon: ShieldCheck,
        label: 'Secure by default',
        detail: 'Two-factor authentication, passkeys, and role-based access.',
    },
    {
        icon: Activity,
        label: 'Real-time workflows',
        detail: 'Appointments, lab, pharmacy, and admissions stay in sync.',
    },
    {
        icon: KeyRound,
        label: 'Fine-grained permissions',
        detail: 'Control exactly who can see and do what, per role.',
    },
];

const capabilities = [
    {
        icon: ReceiptText,
        title: 'Billing & Invoicing',
        description:
            'Subscription plans, automated invoicing, payment tracking, and revenue reporting per hospital.',
    },
    {
        icon: ScanLine,
        title: 'Radiology & Imaging',
        description:
            'Order X-rays, CT scans, and MRIs, track their status, and attach reports and images.',
    },
    {
        icon: BedDouble,
        title: 'Inpatient & Bed Management',
        description:
            'Manage wards, beds, and admissions with real-time occupancy and discharge workflows.',
    },
    {
        icon: ClipboardList,
        title: 'Reports & Analytics',
        description:
            'Patient demographics, appointment trends, revenue, and operational dashboards.',
    },
];

const workflow = [
    {
        step: '01',
        title: 'Create your hospital',
        description:
            'Register an account and set up your hospital profile in minutes.',
    },
    {
        step: '02',
        title: 'Invite your team',
        description:
            'Add doctors, nurses, pharmacists, and staff with role-based permissions.',
    },
    {
        step: '03',
        title: 'Start treating patients',
        description:
            'Register patients, schedule appointments, and manage care end to end.',
    },
];

const roles = [
    'Super Admin',
    'Hospital Admin',
    'Doctor',
    'Nurse',
    'Receptionist',
    'Pharmacist',
    'Lab Staff',
    'Radiologist',
    'Accountant',
    'Patient',
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Hospital Management System" />
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-5xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-primary bg-primary px-5 py-1.5 text-sm leading-normal text-primary-foreground hover:bg-primary/90"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-block rounded-sm border border-primary bg-primary px-5 py-1.5 text-sm leading-normal text-primary-foreground hover:bg-primary/90"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col lg:max-w-5xl">
                        {/* Hero Section */}
                        <div className="mb-12 text-center lg:mb-16">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                                <Hospital className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="mb-3 text-3xl font-semibold tracking-tight lg:text-4xl">
                                Hospital Management System
                            </h1>
                            <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                A comprehensive, multi-tenant platform for
                                managing every aspect of hospital operations —
                                from patient registration to billing, laboratory
                                to pharmacy, all in one integrated system.
                            </p>
                            <div className="mt-6 flex justify-center gap-3">
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 rounded-md border border-[#19140035] px-6 py-2.5 text-sm font-medium hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {highlights.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-lg border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]"
                                >
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <item.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-1 text-sm font-semibold">
                                        {item.label}
                                    </h3>
                                    <p className="text-[13px] leading-[20px] text-[#706f6c] dark:text-[#A1A09A]">
                                        {item.detail}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Feature Grid */}
                        <h2 className="mb-6 text-center text-xl font-semibold tracking-tight lg:text-2xl">
                            Everything your hospital needs
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-lg border border-[#e3e3e0] bg-white p-5 transition-shadow hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615]"
                                >
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <feature.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-1 text-sm font-semibold">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[13px] leading-[20px] text-[#706f6c] dark:text-[#A1A09A]">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Clinical Capabilities */}
                        <h2 className="mt-16 mb-6 text-center text-xl font-semibold tracking-tight lg:text-2xl">
                            Extend your clinical operations
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                            {capabilities.map((capability) => (
                                <div
                                    key={capability.title}
                                    className="rounded-lg border border-[#e3e3e0] bg-white p-5 transition-shadow hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615]"
                                >
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <capability.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-1 text-sm font-semibold">
                                        {capability.title}
                                    </h3>
                                    <p className="text-[13px] leading-[20px] text-[#706f6c] dark:text-[#A1A09A]">
                                        {capability.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* How it works */}
                        <h2 className="mt-16 mb-6 text-center text-xl font-semibold tracking-tight lg:text-2xl">
                            How it works
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-3 lg:gap-6">
                            {workflow.map((step) => (
                                <div
                                    key={step.step}
                                    className="rounded-lg border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]"
                                >
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                        {step.step}
                                    </div>
                                    <h3 className="mb-1 text-sm font-semibold">
                                        {step.title}
                                    </h3>
                                    <p className="text-[13px] leading-[20px] text-[#706f6c] dark:text-[#A1A09A]">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Roles */}
                        <h2 className="mt-16 mb-6 text-center text-xl font-semibold tracking-tight lg:text-2xl">
                            Built for every role
                        </h2>
                        <div className="flex flex-wrap justify-center gap-2">
                            {roles.map((role) => (
                                <span
                                    key={role}
                                    className="rounded-full border border-[#e3e3e0] bg-white px-4 py-1.5 text-[13px] text-[#706f6c] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#A1A09A]"
                                >
                                    {role}
                                </span>
                            ))}
                        </div>

                        {/* Call to action */}
                        <div className="mt-16 rounded-xl border border-[#e3e3e0] bg-white p-8 text-center dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <h2 className="mb-2 text-2xl font-semibold tracking-tight">
                                Ready to modernize your hospital?
                            </h2>
                            <p className="mx-auto mb-6 max-w-xl text-[15px] leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                Join hospitals using a single, unified platform
                                for patient care, operations, and billing.
                            </p>
                            <div className="flex justify-center gap-3">
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Get Started{' '}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 rounded-md border border-[#19140035] px-6 py-2.5 text-sm font-medium hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>

                        {/* Footer */}
                        <p className="mt-12 text-center text-[13px] text-[#706f6c] dark:text-[#A1A09A]">
                            &copy; {new Date().getFullYear()} Hospital
                            Management System. All rights reserved.
                        </p>
                    </main>
                </div>
            </div>
        </>
    );
}
