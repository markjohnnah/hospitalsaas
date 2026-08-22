<?php

declare(strict_types=1);

namespace App\Enums;

enum SubscriptionStatus: string
{
    case Trialing = 'trialing';
    case Active = 'active';
    case PastDue = 'past_due';
    case Canceled = 'canceled';
    case Expired = 'expired';

    public function label(): string
    {
        return match ($this) {
            self::Trialing => 'Trialing',
            self::Active => 'Active',
            self::PastDue => 'Past Due',
            self::Canceled => 'Canceled',
            self::Expired => 'Expired',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Trialing => 'blue',
            self::Active => 'green',
            self::PastDue => 'orange',
            self::Canceled => 'gray',
            self::Expired => 'red',
        };
    }
}
