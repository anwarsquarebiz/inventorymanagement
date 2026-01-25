<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReconciliationReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_no',
        'report_date',
        'created_by',
        'status',
        'shop_data',
        'transit_data',
        'workshop_data',
        'returned_data',
        'notes',
    ];

    protected $casts = [
        'report_date' => 'date',
        'shop_data' => 'array',
        'transit_data' => 'array',
        'workshop_data' => 'array',
        'returned_data' => 'array',
    ];

    /**
     * Get the user who created this report
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for reports by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for reports by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('report_date', [$startDate, $endDate]);
    }

    /**
     * Boot method to generate report number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($report) {
            if (empty($report->report_no)) {
                $year = date('Y');
                $month = date('m');
                $lastReport = self::where('report_no', 'like', "RPT-{$year}{$month}-%")
                    ->orderBy('report_no', 'desc')
                    ->first();
                
                $nextNumber = 1;
                if ($lastReport) {
                    $lastNumber = (int) substr($lastReport->report_no, -3);
                    $nextNumber = $lastNumber + 1;
                }
                
                $report->report_no = sprintf('RPT-%s%s-%03d', $year, $month, $nextNumber);
            }
        });
    }
}
