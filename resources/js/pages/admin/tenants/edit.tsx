import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { Tenant } from '@/types';

type Props = {
    tenant: Tenant;
};

export default function TenantsEdit({ tenant }: Props) {
    return (
        <>
            <Head title={`Edit ${tenant.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Hospital</h1>
                    <p className="text-muted-foreground">{tenant.name}</p>
                </div>

                <Form
                    method="put"
                    action={`/admin/tenants/${tenant.id}`}
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <fieldset className="space-y-4 rounded-lg border p-4">
                                <legend className="px-1 text-sm font-medium">Hospital Details</legend>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Hospital Name *</Label>
                                        <Input id="name" name="name" required defaultValue={tenant.name} />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="slug">Slug / Identifier *</Label>
                                        <Input id="slug" name="slug" required defaultValue={tenant.slug ?? ''} />
                                        <InputError message={errors.slug} />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" defaultValue={tenant.email ?? ''} />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" name="phone" defaultValue={tenant.phone ?? ''} />
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" defaultValue={tenant.address ?? ''} />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input id="website" name="website" type="url" defaultValue={tenant.website ?? ''} />
                                    <InputError message={errors.website} />
                                </div>
                            </fieldset>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Save Changes
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

TenantsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hospitals', href: '/admin/tenants' },
        { title: 'Edit Hospital', href: '#' },
    ],
};
