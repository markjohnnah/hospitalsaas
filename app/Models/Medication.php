<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Medication extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'code',
        'brand_name',
        'generic_name',
        'category',
        'dosage_form',
        'strength',
        'unit',
        'quantity_in_stock',
        'reorder_level',
        'unit_price',
        'expiry_date',
        'requires_prescription',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'quantity_in_stock' => 'integer',
            'reorder_level' => 'integer',
            'expiry_date' => 'date',
            'requires_prescription' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function isLowStock(): bool
    {
        return $this->quantity_in_stock <= $this->reorder_level;
    }
}
