<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\InvoiceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class Invoice extends Model
{
    use CentralConnection, HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'number',
        'status',
        'subtotal',
        'tax_amount',
        'total',
        'issued_at',
        'due_at',
        'paid_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => InvoiceStatus::class,
            'subtotal' => 'integer',
            'tax_amount' => 'integer',
            'total' => 'integer',
            'issued_at' => 'date',
            'due_at' => 'date',
            'paid_at' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Invoice $invoice) {
            if (empty($invoice->id)) {
                $invoice->id = (string) Str::uuid();
            }
            if (empty($invoice->number)) {
                $invoice->number = self::generateNumber();
            }
        });
    }

    public static function generateNumber(): string
    {
        $year = date('Y');
        $count = self::whereYear('issued_at', $year)->count() + 1;

        return sprintf('INV-%s-%04d', $year, $count);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function amountDue(): int
    {
        return $this->total - $this->payments->sum('amount');
    }

    public function isFullyPaid(): bool
    {
        return $this->amountDue() <= 0;
    }

    public function formattedSubtotal(): string
    {
        return number_format($this->subtotal / 100, 2);
    }

    public function formattedTotal(): string
    {
        return number_format($this->total / 100, 2);
    }
}
