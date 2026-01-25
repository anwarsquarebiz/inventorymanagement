<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku',
        'stock_no',
        'shape',
        'description',
        'weight',
        'color',
        'clarity',
        'cut',
        'code',
        'remarks',
        'status',
        'location',
        'created_by',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who created this item
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get voucher items that include this inventory item
     */
    public function voucherItems()
    {
        return $this->hasMany(VoucherItem::class);
    }

    /**
     * Scope for items by location
     */
    public function scopeByLocation($query, $location)
    {
        return $query->where('location', $location);
    }

    /**
     * Scope for items by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for items by shape
     */
    public function scopeByShape($query, $shape)
    {
        return $query->where('shape', $shape);
    }

    /**
     * Get total count by location
     */
    public static function getCountByLocation()
    {
        return self::selectRaw('location, COUNT(*) as count')
            ->groupBy('location')
            ->pluck('count', 'location');
    }

    /**
     * Get total weight by location
     */
    public static function getWeightByLocation()
    {
        return self::selectRaw('location, SUM(weight) as total_weight')
            ->groupBy('location')
            ->pluck('total_weight', 'location');
    }
}
