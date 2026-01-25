<?php

namespace Database\Seeders;

use App\Models\Shape;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShapesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create products
        $diamonds = Product::firstOrCreate(['name' => 'Diamonds'], [
            'name' => 'Diamond',
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        $rubies = Product::firstOrCreate(['name' => 'Rubies'], [
            'name' => 'Ruby',
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        $emeralds = Product::firstOrCreate(['name' => 'Emeralds'], [
            'name' => 'Emerald',
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        // Define shapes with their product assignments
        // Format: [['name' => 'Shape Name', 'product_id' => productId], ...]
        // This allows the same shape name for different products
        $shapesData = [
            // Diamonds shapes
            ['name' => 'Round Brilliant', 'product_id' => $diamonds->id],
            ['name' => 'Old Mine Cut', 'product_id' => $diamonds->id],
            ['name' => 'Old European Cut', 'product_id' => $diamonds->id],
            ['name' => 'Rose Cut', 'product_id' => $diamonds->id],
            ['name' => 'Cushion (Modern)', 'product_id' => $diamonds->id],
            ['name' => 'Cushion (Old Mine / Antique)', 'product_id' => $diamonds->id],
            ['name' => 'Emerald Cut', 'product_id' => $diamonds->id],
            ['name' => 'Asscher Cut', 'product_id' => $diamonds->id],
            ['name' => 'Baguette (Straight)', 'product_id' => $diamonds->id],
            ['name' => 'Baguette (Tapered)', 'product_id' => $diamonds->id],
            ['name' => 'Carré', 'product_id' => $diamonds->id],
            ['name' => 'Oval', 'product_id' => $diamonds->id],
            ['name' => 'Pear', 'product_id' => $diamonds->id],
            ['name' => 'Marquise', 'product_id' => $diamonds->id],
            ['name' => 'Heart', 'product_id' => $diamonds->id],
            ['name' => 'Trilliant', 'product_id' => $diamonds->id],
            ['name' => 'Princess', 'product_id' => $diamonds->id],
            ['name' => 'Radiant', 'product_id' => $diamonds->id],
            ['name' => 'Briolette', 'product_id' => $diamonds->id],
            ['name' => 'Shield Cut', 'product_id' => $diamonds->id],
            ['name' => 'Half-Moon', 'product_id' => $diamonds->id],
            ['name' => 'Bullet', 'product_id' => $diamonds->id],
            ['name' => 'Lozenge', 'product_id' => $diamonds->id],
            ['name' => 'Kite', 'product_id' => $diamonds->id],
            
            // Rubies shapes
            ['name' => 'Oval', 'product_id' => $rubies->id],
            ['name' => 'Pear', 'product_id' => $rubies->id],
            ['name' => 'Round', 'product_id' => $rubies->id],
            ['name' => 'Cushion', 'product_id' => $rubies->id],
            ['name' => 'Emerald Cut', 'product_id' => $rubies->id],
            ['name' => 'Square', 'product_id' => $rubies->id],
            ['name' => 'Baguette', 'product_id' => $rubies->id],
            ['name' => 'Oval Cabochon', 'product_id' => $rubies->id],
            ['name' => 'Round Cabochon', 'product_id' => $rubies->id],
            ['name' => 'Pear Cabochon', 'product_id' => $rubies->id],
            ['name' => 'Cushion Cabochon', 'product_id' => $rubies->id],
            ['name' => 'Plain Beads (Round)', 'product_id' => $rubies->id],
            ['name' => 'Faceted Beads', 'product_id' => $rubies->id],
            ['name' => 'Barrel Beads', 'product_id' => $rubies->id],
            ['name' => 'Rondelle Beads', 'product_id' => $rubies->id],
            ['name' => 'Carved Beads', 'product_id' => $rubies->id],
            ['name' => 'Graduated Beads', 'product_id' => $rubies->id],
            ['name' => 'Plain Drops', 'product_id' => $rubies->id],
            ['name' => 'Faceted Drops', 'product_id' => $rubies->id],
            ['name' => 'Briolette Drops', 'product_id' => $rubies->id],
            ['name' => 'Carved Drops', 'product_id' => $rubies->id],
            ['name' => 'Tumbled Drops', 'product_id' => $rubies->id],
            ['name' => 'Carved Floral', 'product_id' => $rubies->id],
            ['name' => 'Carved Mughal Motif', 'product_id' => $rubies->id],
            ['name' => 'Intaglio', 'product_id' => $rubies->id],
            ['name' => 'Relief Carving', 'product_id' => $rubies->id],
            
            // Emeralds shapes (same as Rubies)
            ['name' => 'Oval', 'product_id' => $emeralds->id],
            ['name' => 'Pear', 'product_id' => $emeralds->id],
            ['name' => 'Round', 'product_id' => $emeralds->id],
            ['name' => 'Cushion', 'product_id' => $emeralds->id],
            ['name' => 'Emerald Cut', 'product_id' => $emeralds->id],
            ['name' => 'Square', 'product_id' => $emeralds->id],
            ['name' => 'Baguette', 'product_id' => $emeralds->id],
            ['name' => 'Oval Cabochon', 'product_id' => $emeralds->id],
            ['name' => 'Round Cabochon', 'product_id' => $emeralds->id],
            ['name' => 'Pear Cabochon', 'product_id' => $emeralds->id],
            ['name' => 'Cushion Cabochon', 'product_id' => $emeralds->id],
            ['name' => 'Plain Beads (Round)', 'product_id' => $emeralds->id],
            ['name' => 'Faceted Beads', 'product_id' => $emeralds->id],
            ['name' => 'Barrel Beads', 'product_id' => $emeralds->id],
            ['name' => 'Rondelle Beads', 'product_id' => $emeralds->id],
            ['name' => 'Carved Beads', 'product_id' => $emeralds->id],
            ['name' => 'Graduated Beads', 'product_id' => $emeralds->id],
            ['name' => 'Plain Drops', 'product_id' => $emeralds->id],
            ['name' => 'Faceted Drops', 'product_id' => $emeralds->id],
            ['name' => 'Briolette Drops', 'product_id' => $emeralds->id],
            ['name' => 'Carved Drops', 'product_id' => $emeralds->id],
            ['name' => 'Tumbled Drops', 'product_id' => $emeralds->id],
            ['name' => 'Carved Floral', 'product_id' => $emeralds->id],
            ['name' => 'Carved Mughal Motif', 'product_id' => $emeralds->id],
            ['name' => 'Intaglio', 'product_id' => $emeralds->id],
            ['name' => 'Relief Carving', 'product_id' => $emeralds->id],
        ];

        // Create or update shapes
        // Uses composite unique constraint on name + product_id
        foreach ($shapesData as $shapeData) {
            Shape::updateOrCreate(
                [
                    'name' => $shapeData['name'],
                    'product_id' => $shapeData['product_id'],
                ],
                [
                    'name' => $shapeData['name'],
                    'product_id' => $shapeData['product_id'],
                    'created_by' => 1,
                    'updated_by' => 1,
                ]
            );
        }
    }
}
