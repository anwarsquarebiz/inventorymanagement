<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $primaryKey = 'stock_no';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'stock_no',
        'thumbnail',
        'metal',
        'products_used',
        'product_categorization',
    ];

    /**
     * Get vouchers for this stock
     */
    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'stock_no', 'stock_no');
    }
}
