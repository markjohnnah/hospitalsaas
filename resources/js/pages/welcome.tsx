import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import {
    Building2,
    Calendar,
    FileText,
    FlaskConical,
    Hospital,
    Pill,
    Stethoscope,
    UserSquare2,
    Users,
} from 'lucide-react';

const features = [
    {
        icon: UserSquare2,
        title: 'Patient Management',
        description: 'Complete patient profiles with medical history, allergies, and chronic disease tracking.',
    },
    {
        icon: Calendar,
        title: 'Appointment Scheduling',
        description: 'Efficiently manage doctor appointments with real-time availability and reminders.',
    },
    {
        icon: FileText,
        title: 'Electronic Medical Records',
        description: 'Secure digital records accessible by authorized clinical staff across departments.',
    },
    {
        icon: FlaskConical,
        title: 'Laboratory Management',
        description: 'Order lab tests, track samples, and manage results with integrated lab workflows.',
    },
    {
        icon: Pill,
        title: 'Pharmacy & Dispensing',
        description: 'Manage prescriptions, inventory, and medication dispensing with full traceability.',
    },
    {
        icon: Stethoscope,
        title: 'Doctor & Staff Management',
        description: 'Manage doctors, nurses, schedules, and role-based access across the hospital.',
    },
    {
        icon: Building2,
        title: 'Multi-Hospital Support',
        description: 'Centralized platform for managing multiple hospital tenants with isolated data.',
    },
    {
        icon: Users,
        title: 'Role-Based Access Control',
        description: 'Fine-grained permissions for super admins, hospital admins, doctors, nurses, pharmacists, and more.',
    },
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
                                A comprehensive, multi-tenant platform for managing every aspect of hospital operations —
                                from patient registration to billing, laboratory to pharmacy, all in one integrated system.
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

                        {/* Feature Grid */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-lg border border-[#e3e3e0] bg-white p-5 transition-shadow hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615]"
                                >
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <feature.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-1 text-sm font-semibold">{feature.title}</h3>
                                    <p className="text-[13px] leading-[20px] text-[#706f6c] dark:text-[#A1A09A]">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <p className="mt-12 text-center text-[13px] text-[#706f6c] dark:text-[#A1A09A]">
                            &copy; {new Date().getFullYear()} Hospital Management System. All rights reserved.
                        </p>
                    </main>
                </div>
            </div>
        </>
    );
}
