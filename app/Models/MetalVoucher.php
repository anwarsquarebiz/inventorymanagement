<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MetalVoucher extends Model
{
    use HasFactory, SoftDeletes;

    // Status constants (same as Voucher for metal transactions)
    const STATUS_PENDING_APPROVAL = 'pending_approval';
    const STATUS_PENDING_VERIFICATION = 'pending_verification';
    const STATUS_IN_TRANSIT = 'in_transit';
    const STATUS_UNDER_REVIEW = 'under_review';
    const STATUS_IN_USE = 'in_use';
    const STATUS_REJECTED = 'rejected';
    const STATUS_COMPLETED = 'completed';

    protected $table = 'metal_vouchers';

    protected $attributes = [
        'status' => self::STATUS_PENDING_APPROVAL,
    ];

    protected $fillable = [
        'voucher_no',
        'date_given',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
        'notes',
    ];

    protected $casts = [
        'date_given' => 'date',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who created this metal voucher
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved this metal voucher
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get metal voucher items
     */
    public function items()
    {
        return $this->hasMany(MetalVoucherItem::class);
    }

    /**
     * Get metal voucher activities
     */
    public function activities()
    {
        return $this->hasMany(MetalVoucherActivity::class)->orderBy('timestamp', 'desc');
    }

    /**
     * Get total weight in this metal voucher
     */
    public function getTotalWeightAttribute()
    {
        return $this->items()->sum('weight');
    }

    /**
     * Scope for metal vouchers by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for metal vouchers by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date_given', [$startDate, $endDate]);
    }

    /**
     * Get all available statuses
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING_APPROVAL => 'Pending Approval',
            self::STATUS_PENDING_VERIFICATION => 'Pending Verification',
            self::STATUS_IN_TRANSIT => 'In Transit',
            self::STATUS_UNDER_REVIEW => 'Under Review',
            self::STATUS_IN_USE => 'In Use',
            self::STATUS_REJECTED => 'Rejected',
            self::STATUS_COMPLETED => 'Completed',
        ];
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return self::getStatuses()[$this->status] ?? $this->status;
    }

    /**
     * Boot method to generate metal voucher number (MV-YYYY-NNN)
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($metalVoucher) {
            if (empty($metalVoucher->voucher_no)) {
                $year = date('Y');

                $lastVoucher = self::withTrashed()
                    ->where('voucher_no', 'like', "MV-{$year}-%")
                    ->orderBy('voucher_no', 'desc')
                    ->first();

                $nextNumber = 1;
                if ($lastVoucher) {
                    $lastNumber = (int) substr($lastVoucher->voucher_no, -3);
                    $nextNumber = $lastNumber + 1;
                }

                $metalVoucher->voucher_no = sprintf('MV-%s-%03d', $year, $nextNumber);

                while (self::withTrashed()->where('voucher_no', $metalVoucher->voucher_no)->exists()) {
                    $nextNumber++;
                    $metalVoucher->voucher_no = sprintf('MV-%s-%03d', $year, $nextNumber);
                }
            }
        });
    }
}
