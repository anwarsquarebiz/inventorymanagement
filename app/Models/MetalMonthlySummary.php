<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetalMonthlySummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'metal_id',
        'opening_balance',
        'total_issue',
        'total_usage',
        'loss_adjustment',
        'closing_balance',
        'month',
        'year',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'total_issue' => 'decimal:2',
        'total_usage' => 'decimal:2',
        'loss_adjustment' => 'decimal:2',
        'closing_balance' => 'decimal:2',
        'month' => 'integer',
        'year' => 'integer',
    ];

    public function metal(): BelongsTo
    {
        return $this->belongsTo(Metal::class);
    }
}
