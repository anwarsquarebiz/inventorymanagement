import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gem, Eye, EyeOff, Shield, BarChart3, Package, ArrowLeft, Copy, Check } from 'lucide-react'

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState('');
    
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(''), 2000);
    };

    const demoAccounts = [
        { role: 'Super Admin', email: 'admin@kotharijewels.com', password: 'password123', icon: Shield, color: 'emerald' },
        { role: 'Manager', email: 'manager@kotharijewels.com', password: 'password123', icon: BarChart3, color: 'blue' },
        { role: 'Shop Staff', email: 'shop@kotharijewels.com', password: 'password123', icon: Package, color: 'orange' },
    ];

    return (
        <>
            <Head title="Login" />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-blue-900 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                
                <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <Link href="/" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 mb-6 transition-colors">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Home
                            </Link>
                            
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                    <Gem className="h-8 w-8 text-emerald-400" />
                                </div>
                            </div>
                            
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-gray-300">
                                Sign in to your Kothari Jewels account
                            </p>
                        </div>
                        
                        {/* Login Form */}
                        <Card className="p-8 bg-white/5 backdrop-blur-sm border-white/10">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <Label htmlFor="email" className="text-white">Email address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 ${errors.email ? 'border-red-500' : ''}`}
                                        placeholder="Enter your email"
                                        required
                                    />
                                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="password" className="text-white">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember"
                                            name="remember"
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-white/30 bg-white/10 rounded"
                                        />
                                        <Label htmlFor="remember" className="ml-2 block text-sm text-gray-300">
                                            Remember me
                                        </Label>
                                    </div>

                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-emerald-400 hover:text-emerald-300">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>

                                <div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-medium transition-all duration-200"
                                    >
                                        {processing ? 'Signing in...' : 'Sign in'}
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <span className="text-sm text-gray-300">
                                        Don't have an account?{' '}
                                        <Link href="/register" className="font-medium text-emerald-400 hover:text-emerald-300">
                                            Create one
                                        </Link>
                                    </span>
                                </div>
                            </form>
                        </Card>

                        {/* Demo Accounts */}
                        <Card className="p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">Try Demo Accounts</h3>
                                <p className="text-sm text-gray-300">Click to auto-fill credentials</p>
                            </div>
                            
                            <div className="space-y-3">
                                {demoAccounts.map((account) => {
                                    const Icon = account.icon;
                                    return (
                                        <div key={account.role} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Icon className={`h-5 w-5 text-${account.color}-400 mr-3`} />
                                                    <div>
                                                        <div className="text-sm font-medium text-white">{account.role}</div>
                                                        <div className="text-xs text-gray-400">{account.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setData('email', account.email);
                                                            setData('password', account.password);
                                                        }}
                                                        className="text-xs bg-emerald-600/20 text-emerald-300 px-3 py-1 rounded-full hover:bg-emerald-600/30 transition-colors"
                                                    >
                                                        Use
                                                    </button>
                                                    <button
                                                        onClick={() => copyToClipboard(account.email, `${account.role}-email`)}
                                                        className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                                                    >
                                                        {copied === `${account.role}-email` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
