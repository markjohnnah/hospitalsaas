import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function TenantsCreate() {
    return (
        <>
            <Head title="Add Hospital" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add Hospital</h1>
                    <p className="text-muted-foreground">
                        Create a new hospital tenant. A separate database will be provisioned automatically.
                    </p>
                </div>

                <Form
                    method="post"
                    action="/admin/tenants"
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Hospital details */}
                            <fieldset className="space-y-4 rounded-lg border p-4">
                                <legend className="px-1 text-sm font-medium">Hospital Details</legend>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Hospital Name *</Label>
                                        <Input id="name" name="name" required placeholder="City General Hospital" />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="slug">Slug / Identifier *</Label>
                                        <Input id="slug" name="slug" required placeholder="city-general" />
                                        <InputError message={errors.slug} />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" placeholder="info@hospital.com" />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" name="phone" placeholder="+1 234 567 8900" />
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" placeholder="123 Medical Drive, City, State" />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input id="website" name="website" type="url" placeholder="https://hospital.com" />
                                    <InputError message={errors.website} />
                                </div>
                            </fieldset>

                            {/* Hospital Admin account */}
                            <fieldset className="space-y-4 rounded-lg border p-4">
                                <legend className="px-1 text-sm font-medium">Hospital Admin Account</legend>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="admin_name">Admin Name *</Label>
                                        <Input id="admin_name" name="admin_name" required placeholder="John Doe" />
                                        <InputError message={errors.admin_name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="admin_email">Admin Email *</Label>
                                        <Input id="admin_email" name="admin_email" type="email" required placeholder="admin@hospital.com" />
                                        <InputError message={errors.admin_email} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="admin_password">Admin Password *</Label>
                                    <Input id="admin_password" name="admin_password" type="password" required placeholder="Min. 8 characters" />
                                    <InputError message={errors.admin_password} />
                                </div>
                            </fieldset>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Create Hospital
                                </Button>
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

TenantsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hospitals', href: '/admin/tenants' },
        { title: 'Add Hospital', href: '/admin/tenants/create' },
    ],
};
