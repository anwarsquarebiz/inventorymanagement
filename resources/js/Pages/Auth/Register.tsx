import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Gem, Eye, EyeOff, ArrowLeft, UserPlus, CheckCircle } from 'lucide-react'

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register.store'));
    };

    const passwordRequirements = [
        { text: 'At least 8 characters', met: data.password.length >= 8 },
        { text: 'Contains uppercase letter', met: /[A-Z]/.test(data.password) },
        { text: 'Contains lowercase letter', met: /[a-z]/.test(data.password) },
        { text: 'Contains number', met: /\d/.test(data.password) },
    ];

    const isPasswordValid = passwordRequirements.every(req => req.met);
    const isFormValid = data.name && data.email && data.password && data.password_confirmation && isPasswordValid && data.password === data.password_confirmation;

    return (
        <>
            <Head title="Register" />
            <div className="min-h-screen bg-slate-900
             bg-gradient-to-br from-slate-900 via-emerald-900 to-blue-900 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                
                <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <Link href={route('home')} className="inline-flex items-center text-emerald-400 hover:text-emerald-300 mb-6 transition-colors">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Home
                            </Link>
                            
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                    <UserPlus className="h-8 w-8 text-emerald-400" />
                                </div>
                            </div>
                            
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Join Kothari Jewels
                            </h2>
                            <p className="text-gray-300">
                                Create your account to get started
                            </p>
                        </div>
                        
                        {/* Registration Form */}
                        <Card className="p-8 bg-white/5 backdrop-blur-sm border-white/10">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <Label htmlFor="name" className="text-white">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 ${errors.name ? 'border-red-500' : ''}`}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                                </div>

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
                                            autoComplete="new-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                                            placeholder="Create a password"
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
                                    
                                    {/* Password Requirements */}
                                    {data.password && (
                                        <div className="mt-3 space-y-2">
                                            {passwordRequirements.map((requirement, index) => (
                                                <div key={index} className="flex items-center text-xs">
                                                    <CheckCircle className={`h-3 w-3 mr-2 ${requirement.met ? 'text-emerald-400' : 'text-gray-500'}`} />
                                                    <span className={requirement.met ? 'text-emerald-300' : 'text-gray-400'}>
                                                        {requirement.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation" className="text-white">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 pr-10 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                                            placeholder="Confirm your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && <p className="text-red-400 text-sm mt-1">{errors.password_confirmation}</p>}
                                    
                                    {/* Password Match Indicator */}
                                    {data.password_confirmation && (
                                        <div className="mt-2 flex items-center text-xs">
                                            <CheckCircle className={`h-3 w-3 mr-2 ${data.password === data.password_confirmation ? 'text-emerald-400' : 'text-red-400'}`} />
                                            <span className={data.password === data.password_confirmation ? 'text-emerald-300' : 'text-red-400'}>
                                                {data.password === data.password_confirmation ? 'Passwords match' : 'Passwords do not match'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Button
                                        type="submit"
                                        disabled={processing || !isFormValid}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Creating account...' : 'Create account'}
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <span className="text-sm text-gray-300">
                                        Already have an account?{' '}
                                        <Link href={route('login')} className="font-medium text-emerald-400 hover:text-emerald-300">
                                            Sign in
                                        </Link>
                                    </span>
                                </div>
                            </form>
                        </Card>

                        {/* Benefits Section */}
                        <Card className="p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center">Why Join Kothari Jewels?</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-300">
                                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-3 flex-shrink-0" />
                                    <span>Complete inventory tracking from shop to workshop</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-300">
                                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-3 flex-shrink-0" />
                                    <span>Real-time voucher management and status updates</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-300">
                                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-3 flex-shrink-0" />
                                    <span>Comprehensive audit trail for every transaction</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-300">
                                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-3 flex-shrink-0" />
                                    <span>Role-based access control and permissions</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
