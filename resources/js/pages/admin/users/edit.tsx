import { Head, router } from '@inertiajs/react';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type HospitalAdmin = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
};

type Props = { user: HospitalAdmin };

export default function UsersEdit({ user }: Props) {
    const [profile, setProfile] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        is_active: user.is_active,
    });
    const [password, setPassword] = useState({
        password: '',
        password_confirmation: '',
    });
    const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
        {},
    );
    const [passwordErrors, setPasswordErrors] = useState<
        Record<string, string>
    >({});
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPassword((prev) => ({ ...prev, [name]: value }));
    };

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setProfileErrors({});
        router.put(`/admin/users/${user.id}`, profile, {
            onSuccess: () => setLoading(false),
            onError: (err) => {
                setProfileErrors(err as Record<string, string>);
                setLoading(false);
            },
        });
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordErrors({});
        router.patch(`/admin/users/${user.id}/password`, password, {
            onSuccess: () => {
                setPassword({ password: '', password_confirmation: '' });
                setPasswordLoading(false);
            },
            onError: (err) => {
                setPasswordErrors(err as Record<string, string>);
                setPasswordLoading(false);
            },
        });
    };

    return (
        <>
            <Head title={`Edit ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit {user.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Manage this hospital admin account
                        </p>
                    </div>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <form onSubmit={submitProfile} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleProfileChange}
                                    required
                                />
                                {profileErrors.name && (
                                    <p className="text-sm text-destructive">
                                        {profileErrors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={profile.email}
                                    onChange={handleProfileChange}
                                    required
                                />
                                {profileErrors.email && (
                                    <p className="text-sm text-destructive">
                                        {profileErrors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleProfileChange}
                                    placeholder="+675 7XXX XXXX"
                                />
                                {profileErrors.phone && (
                                    <p className="text-sm text-destructive">
                                        {profileErrors.phone}
                                    </p>
                                )}
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={profile.is_active}
                                    onChange={handleProfileChange}
                                    className="h-4 w-4 rounded border-input"
                                />
                                Account is active
                            </label>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>

                <form onSubmit={submitPassword} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4 text-muted-foreground" />
                                Reset Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password.password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                                {passwordErrors.password && (
                                    <p className="text-sm text-destructive">
                                        {passwordErrors.password}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    value={password.password_confirmation}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            variant="secondary"
                            disabled={passwordLoading}
                        >
                            {passwordLoading
                                ? 'Resetting...'
                                : 'Reset Password'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

UsersEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hospital Admins', href: '/admin/users' },
        { title: 'Edit Admin', href: '' },
    ],
};
