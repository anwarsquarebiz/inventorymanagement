<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shape extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'product_id',
        'created_by',
        'updated_by',
    ];

    /**
     * Get the product that this shape belongs to
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
