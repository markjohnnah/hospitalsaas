<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

/**
 * @property string $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property int $price_monthly
 * @property int $price_yearly
 * @property int|null $max_users
 * @property int|null $max_patients
 * @property array|null $features
 * @property int $sort_order
 * @property bool $is_active
 */
class Plan extends Model
{
    use CentralConnection, HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_monthly',
        'price_yearly',
        'max_users',
        'max_patients',
        'features',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'is_active' => 'boolean',
            'price_monthly' => 'integer',
            'price_yearly' => 'integer',
            'max_users' => 'integer',
            'max_patients' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Plan $plan) {
            if (empty($plan->id)) {
                $plan->id = (string) Str::uuid();
            }
        });
    }

    public function hasFeature(string $feature): bool
    {
        if ($this->features === null) {
            return false;
        }

        return in_array($feature, $this->features, true);
    }

    public function priceMonthlyFormatted(): string
    {
        return number_format($this->price_monthly / 100, 2);
    }

    public function priceYearlyFormatted(): string
    {
        return number_format($this->price_yearly / 100, 2);
    }

    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class);
    }
}
