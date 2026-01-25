<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create users with different roles
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@kotharijewels.com',
                'password' => 'password123',
                'employee_id' => 'EMP001',
                'phone' => '+1-555-0101',
                'department' => 'IT',
                'role' => 'super_admin',
            ],
            [
                'name' => 'John Manager',
                'email' => 'manager@kotharijewels.com',
                'password' => 'password123',
                'employee_id' => 'EMP002',
                'phone' => '+1-555-0102',
                'department' => 'Operations',
                'role' => 'manager',
            ],
            [
                'name' => 'Sarah Shop Staff',
                'email' => 'shop@kotharijewels.com',
                'password' => 'password123',
                'employee_id' => 'EMP003',
                'phone' => '+1-555-0103',
                'department' => 'Shop',
                'role' => 'shop_staff',
            ],
            [
                'name' => 'Mike Workshop Staff',
                'email' => 'workshop@kotharijewels.com',
                'password' => 'password123',
                'employee_id' => 'EMP004',
                'phone' => '+1-555-0104',
                'department' => 'Workshop',
                'role' => 'workshop_staff',
            ],
            [
                'name' => 'Lisa Viewer',
                'email' => 'viewer@kotharijewels.com',
                'password' => 'password123',
                'employee_id' => 'EMP005',
                'phone' => '+1-555-0105',
                'department' => 'Finance',
                'role' => 'viewer',
            ],
            [
                'name' => 'David Shop Assistant',
                'email' => 'shop2@kotharijewels.com',
                'password' => 'password123',
                'employee_id' => 'EMP006',
                'phone' => '+1-555-0106',
                'department' => 'Shop',
                'role' => 'shop_staff',
            ],
            [
                'name' => 'Emma Workshop Assistant',
                'email' => 'workshop2@kotharijewels.com',
                'password' => 'password123',
                'employee_id' => 'EMP007',
                'phone' => '+1-555-0107',
                'department' => 'Workshop',
                'role' => 'workshop_staff',
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);
            
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                    'employee_id' => $userData['employee_id'],
                    'phone' => $userData['phone'],
                    'department' => $userData['department'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
            
            // Assign role
            $user->assignRole($role);
        }
    }
}