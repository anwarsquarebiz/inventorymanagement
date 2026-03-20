<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VoucherItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'voucher_id',
        'inventory_item_id',
        'product_id',
        'shape',
        'pcs',
        'pcs_used',
        'pcs_returned',
        'weight',
        'weight_used',
        'weight_returned',
        'code',
        'remarks',
        'temporary_return',
        'reviewed',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'weight_used' => 'decimal:2',
        'weight_returned' => 'decimal:2',
        'pcs' => 'integer',
        'pcs_used' => 'integer',
        'pcs_returned' => 'integer',
        'temporary_return' => 'boolean',
        'reviewed' => 'boolean',
    ];

    /**
     * Get the voucher this item belongs to
     */
    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    /**
     * Get the inventory item this voucher item references
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the product for this voucher item
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
