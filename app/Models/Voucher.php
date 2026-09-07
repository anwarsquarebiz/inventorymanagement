<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    use HasFactory, SoftDeletes;

    // Status constants
    const STATUS_PENDING_VERIFICATION = 'pending_verification';
    const STATUS_IN_TRANSIT = 'in_transit';
    const STATUS_UNDER_REVIEW = 'under_review';
    const STATUS_IN_USE = 'in_use';
    const STATUS_REJECTED = 'rejected';
    const STATUS_COMPLETED = 'completed';

    const STAMPING_18K = '18 K';
    const STAMPING_14K = '14 K';
    const STAMPING_9K = '9 K';
    const STAMPING_PT950 = 'PT-950';

    protected $fillable = [
        'voucher_no',
        'stock_no',
        'date_given',
        'date_delivery',
        'stamping',
        'hallmark_certificate',
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
     * Get all available statuses
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING_VERIFICATION => 'Pending Verification',
            self::STATUS_IN_TRANSIT => 'In Transit',
            self::STATUS_UNDER_REVIEW => 'Under Review',
            self::STATUS_IN_USE => 'In Use',
            self::STATUS_REJECTED => 'Rejected',
            self::STATUS_COMPLETED => 'Completed',
        ];
    }

    /**
     * Get available stamping options
     */
    public static function getStampingOptions(): array
    {
        return [
            self::STAMPING_18K,
            self::STAMPING_14K,
            self::STAMPING_9K,
            self::STAMPING_PT950,
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
     * Boot method to generate voucher number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($voucher) {
            if (empty($voucher->voucher_no)) {
                $year = date('Y');
                
                // Get the last voucher number including soft-deleted records
                // to ensure we continue from the highest number
                $lastVoucher = self::withTrashed()
                    ->where('voucher_no', 'like', "VOC-{$year}-%")
                    ->orderBy('voucher_no', 'desc')
                    ->first();
                
                $nextNumber = 1;
                if ($lastVoucher) {
                    $lastNumber = (int) substr($lastVoucher->voucher_no, -3);
                    $nextNumber = $lastNumber + 1;
                }
                
                // Generate the voucher number
                $voucher->voucher_no = sprintf('VOC-%s-%03d', $year, $nextNumber);
                
                // Ensure uniqueness by checking if the number already exists (including soft-deleted)
                // If it exists, increment until we find an available number
                while (self::withTrashed()->where('voucher_no', $voucher->voucher_no)->exists()) {
                    $nextNumber++;
                    $voucher->voucher_no = sprintf('VOC-%s-%03d', $year, $nextNumber);
                }
            }
        });
    }
}
