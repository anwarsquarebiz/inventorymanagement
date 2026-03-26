<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetalVoucherItem extends Model
{
    use HasFactory;

    protected $table = 'metal_voucher_items';

    protected $fillable = [
        'metal_voucher_id',
        'metal_id',
        'weight',
        'remarks',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
    ];

    /**
     * Get the metal voucher this item belongs to
     */
    public function metalVoucher()
    {
        return $this->belongsTo(MetalVoucher::class);
    }

    /**
     * Get the metal for this item
     */
    public function metal()
    {
        return $this->belongsTo(Metal::class);
    }
}
