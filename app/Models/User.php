<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'employee_id',
        'phone',
        'department',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    /**
     * Get vouchers created by this user
     */
    public function createdVouchers()
    {
        return $this->hasMany(Voucher::class, 'created_by');
    }

    /**
     * Get vouchers assigned to this user
     */
    public function assignedVouchers()
    {
        return $this->hasMany(Voucher::class, 'person_in_charge');
    }

    /**
     * Get vouchers approved by this user
     */
    public function approvedVouchers()
    {
        return $this->hasMany(Voucher::class, 'approved_by');
    }

    /**
     * Get audit logs for this user
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get reconciliation reports created by this user
     */
    public function reconciliationReports()
    {
        return $this->hasMany(ReconciliationReport::class, 'created_by');
    }
}
