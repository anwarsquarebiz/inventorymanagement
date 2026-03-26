<?php

namespace Database\Seeders;

use App\Models\Metal;
use Illuminate\Database\Seeder;

class MetalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $metals = [
            'White Gold (WG)',
            'Yellow Gold (YG)',
            'Platinum',
            '9kt',
        ];

        foreach ($metals as $name) {
            Metal::updateOrCreate(
                ['name' => $name],
                [
                    'name' => $name,
                    'created_by' => null,
                    'updated_by' => null,
                ]
            );
        }
    }
}
