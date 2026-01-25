import React, { useState } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import { 
    LayoutDashboard, 
    FileText, 
    Plus, 
    GitMerge, 
    Users,
    Gem,
    LogOut,
    Package,
    Settings as SettingsIcon,
    Shapes as ShapesIcon,
    ListOrdered,
    Wrench,
    ChevronDown,
    ChevronRight,
    Shield,
    Key,
    Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MenuItem {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    route: string
    permission?: string // Optional permission required to see this item
}

export default function Sidebar() {
    const { url, props } = usePage() as any;
    const user = props?.auth?.user;
    const permissions: string[] = user?.permissions || [];
    
    // Helper function to check if user has permission
    const hasPermission = (permission?: string): boolean => {
        if (!permission) return true; // No permission required
        return permissions.includes(permission);
    };

    const isSettingsActive = url.startsWith('/products') || url.startsWith('/shapes') || 
                            url.startsWith('/roles') || url.startsWith('/permissions') ||
                            url.startsWith('/product-categorizations');
    const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

    // Define all menu items with their required permissions
    const allMenuItems: MenuItem[] = [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: LayoutDashboard, 
            route: '/dashboard',
            permission: 'view dashboard'
        },
        { 
            id: 'vouchers', 
            label: 'Vouchers', 
            icon: FileText, 
            route: '/vouchers',
            permission: 'view vouchers'
        },
        { 
            id: 'create-voucher', 
            label: 'Create Voucher', 
            icon: Plus, 
            route: '/vouchers/create',
            permission: 'create vouchers'
        },
        { 
            id: 'vouchers-groups', 
            label: 'Vouchers by Stock', 
            icon: ListOrdered, 
            route: '/vouchers-groups',
            permission: 'view vouchers'
        },
        // { 
        //     id: 'reconciliation', 
        //     label: 'Reconciliation', 
        //     icon: GitMerge, 
        //     route: '/reconciliation/by-stock',
        //     permission: 'view reconciliation'
        // },
        { 
            id: 'workshop-requests', 
            label: 'Workshop Requests', 
            icon: Wrench, 
            route: '/workshop-requests',
            permission: 'view vouchers' // Adjust based on your permission structure
        },
        { 
            id: 'users', 
            label: 'Users & Roles', 
            icon: Users, 
            route: '/users',
            permission: 'view users'
        },        
    ];

    // Filter menu items based on permissions
    const menuItems = allMenuItems.filter(item => hasPermission(item.permission));

    // Settings submenu items with permissions
    const settingsItems: MenuItem[] = [
        {
            id: 'products',
            label: 'Products',
            icon: Package,
            route: '/products',
            permission: 'view settings'
        },
        {
            id: 'shapes',
            label: 'Shapes',
            icon: ShapesIcon,
            route: '/shapes',
            permission: 'view settings'
        },
        {
            id: 'product-categorizations',
            label: 'Product Categorizations',
            icon: Tag,
            route: '/product-categorizations',
            permission: 'view settings'
        },
        {
            id: 'roles',
            label: 'Roles',
            icon: Shield,
            route: '/roles',
            permission: 'view users' // Only users who can view users can see roles
        },
        {
            id: 'permissions',
            label: 'Permissions',
            icon: Key,
            route: '/permissions',
            permission: 'view users' // Only users who can view users can see permissions
        },
    ];

    // Filter settings items based on permissions
    const visibleSettingsItems = settingsItems.filter(item => hasPermission(item.permission));

    const isActive = (route: string) => {
        return url.startsWith(route.replace(/\/$/, ''));
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    {/* <Gem className="h-8 w-8 text-emerald-600" /> */}
                    <div>
                        <img src="/logo.webp" alt="Logo" className="h-20" />
                    </div>
                </div>
            </div>
            
            <nav className="p-4 flex-1">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.route);
                        
                        return (
                            <li key={item.id}>
                                <Link
                                    href={item.route}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                        active
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}

                    {/* Settings group - only show if user has at least one settings permission */}
                    {visibleSettingsItems.length > 0 && (
                        <li>
                            <button
                                type="button"
                                onClick={() => setSettingsOpen((o: boolean) => !o)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                    isSettingsActive
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span className="flex items-center space-x-3">
                                    <SettingsIcon className="h-5 w-5" />
                                    <span>Settings</span>
                                </span>
                                {(settingsOpen || isSettingsActive) ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                            {(settingsOpen || isSettingsActive) && (
                                <ul className="mt-2 ml-8 space-y-2">
                                    {visibleSettingsItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <li key={item.id}>
                                                <Link
                                                    href={item.route}
                                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                                        url.startsWith(item.route)
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    )}
                </ul>
            </nav>
            
            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </Button>
            </div>
        </div>
    )
}
