<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

/**
 * @property string $id
 * @property string $name
 * @property string|null $slug
 * @property string|null $address
 * @property string|null $phone
 * @property string|null $email
 * @property string|null $website
 * @property string|null $logo
 * @property bool $is_active
 * @property string|null $plan_id
 * @property SubscriptionStatus $subscription_status
 * @property Carbon|null $trial_ends_at
 * @property Carbon|null $subscribed_at
 * @property Carbon|null $subscription_ends_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, HasFactory;

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'slug',
            'address',
            'phone',
            'email',
            'website',
            'logo',
            'is_active',
            'plan_id',
            'subscription_status',
            'trial_ends_at',
            'subscribed_at',
            'subscription_ends_at',
        ];
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'subscription_status' => SubscriptionStatus::class,
            'trial_ends_at' => 'datetime',
            'subscribed_at' => 'datetime',
            'subscription_ends_at' => 'datetime',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function onTrial(): bool
    {
        return $this->subscription_status === SubscriptionStatus::Trialing
            && $this->trial_ends_at
            && $this->trial_ends_at->isFuture();
    }

    public function isSubscribed(): bool
    {
        return $this->subscription_status === SubscriptionStatus::Active;
    }
}
