<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use App\Models\User;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shapes = ['Round', 'Princess', 'Emerald', 'Asscher', 'Marquise', 'Oval', 'Radiant', 'Pear', 'Heart', 'Cushion'];
        $colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
        $clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2'];
        $cuts = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
        $statuses = ['available', 'reserved', 'in_transit', 'in_workshop', 'returned', 'sold'];
        $locations = ['shop', 'transit', 'workshop', 'returned'];

        $admin = User::where('email', 'admin@kotharijewels.com')->first();

        // Create 50 inventory items
        for ($i = 1; $i <= 50; $i++) {
            $shape = $shapes[array_rand($shapes)];
            $weight = rand(50, 500) / 100; // 0.50 to 5.00 carats
            
            InventoryItem::create([
                'sku' => 'REG-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'stock_no' => 'STK-REG-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'shape' => $shape,
                'description' => $shape . ' Diamond ' . $weight . 'ct',
                'weight' => $weight,
                'color' => $colors[array_rand($colors)],
                'clarity' => $clarities[array_rand($clarities)],
                'cut' => $cuts[array_rand($cuts)],
                'code' => 'CODE-' . $i,
                'remarks' => 'Premium quality ' . $shape . ' diamond',
                'status' => $statuses[array_rand($statuses)],
                'location' => $locations[array_rand($locations)],
                'created_by' => $admin->id,
            ]);
        }

        // Create some specific high-value items
        $highValueItems = [
            [
                'sku' => 'RD-HIGH-001',
                'stock_no' => 'STK-HIGH-001',
                'shape' => 'Round',
                'description' => 'Round Diamond 2.50ct D-FL Excellent',
                'weight' => 2.50,
                'color' => 'D',
                'clarity' => 'FL',
                'cut' => 'Excellent',
                'code' => 'PREMIUM-001',
                'remarks' => 'Premium investment grade diamond',
                'status' => 'available',
                'location' => 'shop',
            ],
            [
                'sku' => 'PR-HIGH-002',
                'stock_no' => 'STK-HIGH-002',
                'shape' => 'Princess',
                'description' => 'Princess Diamond 3.25ct E-VVS1 Excellent',
                'weight' => 3.25,
                'color' => 'E',
                'clarity' => 'VVS1',
                'cut' => 'Excellent',
                'code' => 'PREMIUM-002',
                'remarks' => 'Exceptional princess cut diamond',
                'status' => 'reserved',
                'location' => 'shop',
            ],
            [
                'sku' => 'OV-HIGH-003',
                'stock_no' => 'STK-HIGH-003',
                'shape' => 'Oval',
                'description' => 'Oval Diamond 1.75ct F-VS1 Very Good',
                'weight' => 1.75,
                'color' => 'F',
                'clarity' => 'VS1',
                'cut' => 'Very Good',
                'code' => 'PREMIUM-003',
                'remarks' => 'Beautiful oval diamond for engagement ring',
                'status' => 'in_workshop',
                'location' => 'workshop',
            ],
        ];

        foreach ($highValueItems as $item) {
            InventoryItem::create(array_merge($item, ['created_by' => $admin->id]));
        }
    }
}