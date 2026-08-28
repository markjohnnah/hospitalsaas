<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class LabResult extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'lab_order_id',
        'lab_test_id',
        'result_value',
        'unit',
        'normal_range',
        'flag',
        'notes',
        'resulted_at',
    ];

    protected function casts(): array
    {
        return [
            'resulted_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<LabOrder, $this> */
    public function labOrder(): BelongsTo
    {
        return $this->belongsTo(LabOrder::class);
    }

    /** @return BelongsTo<LabTest, $this> */
    public function labTest(): BelongsTo
    {
        return $this->belongsTo(LabTest::class);
    }

    public function isCritical(): bool
    {
        return in_array($this->flag, ['critical_low', 'critical_high']);
    }
}
