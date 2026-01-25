<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'voucher_no',
        'stock_no',
        'date_given',
        'date_delivery',
        'status',
        'person_in_charge',
        'created_by',
        'approved_by',
        'approved_at',
        'notes',
    ];

    protected $casts = [
        'date_given' => 'date',
        'date_delivery' => 'date',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the person in charge of this voucher
     */
    public function personInCharge()
    {
        return $this->belongsTo(User::class, 'person_in_charge');
    }

    /**
     * Get the user who created this voucher
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved this voucher
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get voucher items
     */
    public function items()
    {
        return $this->hasMany(VoucherItem::class);
    }

    /**
     * Get voucher activities
     */
    public function activities()
    {
        return $this->hasMany(VoucherActivity::class)->orderBy('timestamp', 'desc');
    }

    /**
     * Get the stock for this voucher
     */
    public function stock()
    {
        return $this->belongsTo(Stock::class, 'stock_no', 'stock_no');
    }

    /**
     * Get total pieces in this voucher
     */
    public function getTotalPiecesAttribute()
    {
        return $this->items()->sum('pcs');
    }

    /**
     * Get total weight in this voucher
     */
    public function getTotalWeightAttribute()
    {
        return $this->items()->sum('weight');
    }

    /**
     * Scope for vouchers by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for vouchers by person in charge
     */
    public function scopeByPersonInCharge($query, $userId)
    {
        return $query->where('person_in_charge', $userId);
    }

    /**
     * Scope for vouchers by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date_given', [$startDate, $endDate]);
    }

    /**
     * Boot method to generate voucher number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($voucher) {
            if (empty($voucher->voucher_no)) {
                $year = date('Y');
                $lastVoucher = self::where('voucher_no', 'like', "VOC-{$year}-%")
                    ->orderBy('voucher_no', 'desc')
                    ->first();
                
                $nextNumber = 1;
                if ($lastVoucher) {
                    $lastNumber = (int) substr($lastVoucher->voucher_no, -3);
                    $nextNumber = $lastNumber + 1;
                }
                
                $voucher->voucher_no = sprintf('VOC-%s-%03d', $year, $nextNumber);
            }
        });
    }
}
