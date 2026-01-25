<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            'Diamond',
            'Emerald',
            'Ruby',
            'Pearl/Semi',
        ];

        foreach ($products as $productName) {
            Product::updateOrCreate(
                ['name' => $productName],
                [
                    'name' => $productName,
                    'created_by' => null,
                    'updated_by' => null,
                ]
            );
        }
    }
}
