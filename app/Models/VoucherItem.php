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
        'weight',
        'code',
        'remarks',
        'temporary_return',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'pcs' => 'integer',
        'temporary_return' => 'boolean',
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
