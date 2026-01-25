<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductCategorization;

class ProductCategorizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'bracelet',
            'ring',
            'cufflinks',
            'buttons',
            'necklace',
            'bangle',
            'earrings',
        ];

        foreach ($categories as $category) {
            ProductCategorization::firstOrCreate([
                'name' => $category,
            ]);
        }
    }
}
