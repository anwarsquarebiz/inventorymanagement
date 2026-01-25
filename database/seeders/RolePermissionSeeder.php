<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',
            
            // Inventory management
            'view inventory',
            'create inventory',
            'edit inventory',
            'delete inventory',
            'bulk update inventory',
            
            // Voucher management
            'view vouchers',
            'create vouchers',
            'edit vouchers',
            'delete vouchers',
            'approve vouchers',
            'send to workshop',
            'receive from workshop',
            'return vouchers',
            
            // Reconciliation
            'view reconciliation',
            'generate reconciliation reports',
            'refresh reconciliation data',
            
            // Dashboard
            'view dashboard',
            
            // Settings
            'view settings',
            'edit settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles
        $roles = [
            'super_admin' => [
                'view users', 'create users', 'edit users', 'delete users',
                'view inventory', 'create inventory', 'edit inventory', 'delete inventory', 'bulk update inventory',
                'view vouchers', 'create vouchers', 'edit vouchers', 'delete vouchers', 'approve vouchers',
                'send to workshop', 'receive from workshop', 'return vouchers',
                'view reconciliation', 'generate reconciliation reports', 'refresh reconciliation data',
                'view dashboard', 'view settings', 'edit settings',
            ],
            'manager' => [
                'view users', 'create users', 'edit users',
                'view inventory', 'create inventory', 'edit inventory',
                'view vouchers', 'create vouchers', 'edit vouchers', 'approve vouchers',
                'send to workshop', 'receive from workshop', 'return vouchers',
                'view reconciliation', 'generate reconciliation reports',
                'view dashboard', 'view settings',
            ],
            'shop_staff' => [
                'view inventory', 'create inventory', 'edit inventory',
                'view vouchers', 'create vouchers', 'edit vouchers',
                'send to workshop', 'receive from workshop',
                'view dashboard',
            ],
            'workshop_staff' => [
                'view inventory',
                'view vouchers', 'edit vouchers',
                'receive from workshop', 'return vouchers',
                'view dashboard',
            ],
            'viewer' => [
                'view inventory', 'view vouchers', 'view reconciliation', 'view dashboard',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($rolePermissions);
        }
    }
}