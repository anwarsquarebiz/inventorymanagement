<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetalVoucherActivity extends Model
{
    use HasFactory;

    protected $table = 'metal_voucher_activities';

    protected $fillable = [
        'metal_voucher_id',
        'action',
        'user_id',
        'description',
        'metadata',
        'timestamp',
    ];

    protected $casts = [
        'metadata' => 'array',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the metal voucher this activity belongs to
     */
    public function metalVoucher()
    {
        return $this->belongsTo(MetalVoucher::class);
    }

    /**
     * Get the user who performed this activity
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for activities by action
     */
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope for activities by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
