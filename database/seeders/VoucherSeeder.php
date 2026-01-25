<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Voucher;
use App\Models\VoucherItem;
use App\Models\VoucherActivity;
use App\Models\InventoryItem;
use App\Models\User;

class VoucherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $shopStaff = $users->where('department', 'Shop')->first();
        $workshopStaff = $users->where('department', 'Workshop')->first();
        $manager = $users->filter(function($user) {
            return $user->hasRole('manager');
        })->first();
        $admin = $users->filter(function($user) {
            return $user->hasRole('super_admin');
        })->first();

        $inventoryItems = InventoryItem::where('status', 'available')->take(20)->get();

        $voucherStatuses = ['pending', 'approved', 'in_transit', 'received', 'returned'];

        // Create 15 vouchers with different statuses
        for ($i = 1; $i <= 15; $i++) {
            $status = $voucherStatuses[array_rand($voucherStatuses)];
            $dateGiven = now()->subDays(rand(1, 30));
            $dateDelivery = $dateGiven->copy()->addDays(rand(1, 7));

            $voucher = Voucher::create([
                'stock_no' => 'STK-VOUCHER-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'date_given' => $dateGiven->format('Y-m-d'),
                'date_delivery' => $dateDelivery->format('Y-m-d'),
                'status' => $status,
                'person_in_charge' => $workshopStaff->id,
                'created_by' => $shopStaff->id,
                'approved_by' => $status !== 'pending' ? $manager->id : null,
                'approved_at' => $status !== 'pending' ? now()->subDays(rand(1, 20)) : null,
                'notes' => 'Voucher for workshop processing - Batch ' . $i,
            ]);

            // Create voucher items (1-3 items per voucher)
            $itemCount = rand(1, 3);
            $selectedItems = $inventoryItems->random($itemCount);

            foreach ($selectedItems as $index => $item) {
                VoucherItem::create([
                    'voucher_id' => $voucher->id,
                    'inventory_item_id' => $item->id,
                    'shape' => $item->shape,
                    'pcs' => 1,
                    'weight' => $item->weight,
                    'code' => $item->code,
                    'remarks' => 'Item ' . ($index + 1) . ' for processing',
                ]);
            }

            // Create voucher activities based on status
            $activities = [];
            
            // Always create "created" activity
            $activities[] = [
                'voucher_id' => $voucher->id,
                'action' => 'created',
                'user_id' => $shopStaff->id,
                'description' => 'Voucher created with ' . $itemCount . ' items',
                'timestamp' => $voucher->created_at,
            ];

            // Add activities based on status
            if ($status !== 'pending') {
                $activities[] = [
                    'voucher_id' => $voucher->id,
                    'action' => 'approved',
                    'user_id' => $manager->id,
                    'description' => 'Voucher approved for workshop processing',
                    'timestamp' => $voucher->approved_at,
                ];
            }

            if (in_array($status, ['in_transit', 'received', 'returned'])) {
                $activities[] = [
                    'voucher_id' => $voucher->id,
                    'action' => 'sent_to_workshop',
                    'user_id' => $shopStaff->id,
                    'description' => 'Stones sent to workshop for processing',
                    'timestamp' => $voucher->approved_at->addMinutes(30),
                ];
            }

            if (in_array($status, ['received', 'returned'])) {
                $activities[] = [
                    'voucher_id' => $voucher->id,
                    'action' => 'received_at_workshop',
                    'user_id' => $workshopStaff->id,
                    'description' => 'Stones received at workshop',
                    'timestamp' => $voucher->approved_at->addHours(2),
                ];
            }

            if ($status === 'returned') {
                $activities[] = [
                    'voucher_id' => $voucher->id,
                    'action' => 'returned',
                    'user_id' => $workshopStaff->id,
                    'description' => 'Stones returned from workshop after processing',
                    'timestamp' => $voucher->approved_at->addDays(3),
                ];
            }

            // Insert all activities
            foreach ($activities as $activity) {
                VoucherActivity::create($activity);
            }
        }

        // Create a reconciliation report
        \App\Models\ReconciliationReport::create([
            'report_date' => now()->subDays(7)->format('Y-m-d'),
            'created_by' => $manager ? $manager->id : $admin->id,
            'status' => 'completed',
            'shop_data' => [
                ['sku' => 'RD-0001', 'description' => 'Round Diamond', 'expected' => 25, 'actual' => 25, 'difference' => 0],
                ['sku' => 'PR-0002', 'description' => 'Princess Diamond', 'expected' => 18, 'actual' => 17, 'difference' => -1],
                ['sku' => 'OV-0003', 'description' => 'Oval Diamond', 'expected' => 12, 'actual' => 12, 'difference' => 0],
            ],
            'transit_data' => [
                ['sku' => 'RD-0001', 'description' => 'Round Diamond', 'expected' => 5, 'actual' => 4, 'difference' => -1],
                ['sku' => 'PR-0002', 'description' => 'Princess Diamond', 'expected' => 3, 'actual' => 3, 'difference' => 0],
                ['sku' => 'OV-0003', 'description' => 'Oval Diamond', 'expected' => 2, 'actual' => 2, 'difference' => 0],
            ],
            'workshop_data' => [
                ['sku' => 'RD-0001', 'description' => 'Round Diamond', 'expected' => 8, 'actual' => 8, 'difference' => 0],
                ['sku' => 'PR-0002', 'description' => 'Princess Diamond', 'expected' => 6, 'actual' => 6, 'difference' => 0],
                ['sku' => 'OV-0003', 'description' => 'Oval Diamond', 'expected' => 4, 'actual' => 5, 'difference' => 1],
            ],
            'returned_data' => [
                ['sku' => 'RD-0001', 'description' => 'Round Diamond', 'expected' => 3, 'actual' => 3, 'difference' => 0],
                ['sku' => 'PR-0002', 'description' => 'Princess Diamond', 'expected' => 2, 'actual' => 2, 'difference' => 0],
                ['sku' => 'OV-0003', 'description' => 'Oval Diamond', 'expected' => 1, 'actual' => 1, 'difference' => 0],
            ],
            'notes' => 'Weekly reconciliation report - Minor discrepancies noted in transit and workshop',
        ]);
    }
}