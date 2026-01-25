import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gem, Package, Truck, Wrench, RotateCcw, Shield, BarChart3, Clock, CheckCircle2, Star, ArrowRight } from 'lucide-react'

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div 
                className="min-h-screen relative overflow-hidden" 
                style={{
                    background: 'linear-gradient(to bottom right, #0f172a, #064e3b, #1e3a8a)',
                    backgroundColor: '#0f172a', // Fallback for Safari
                    // minHeight: '100vh',
                    minHeight: '-webkit-fill-available' // iOS Safari fix
                }}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                
                <div className="relative z-10">
                    {/* Navigation */}
                    <nav className="flex justify-between items-center px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <Gem className="h-8 w-8 text-emerald-400" />
                            <span className="text-xl font-bold text-white">Kothari Jewels</span>
                        </div>
                        <div className="flex space-x-4">
                            <Link href={route('login')}>
                                <Button variant="ghost" className="text-white hover:bg-white/10 cursor-pointer hover:text-white">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href={route('register')}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </nav>

                    <div className="container mx-auto px-4 py-16">
                        {/* Hero Section */}
                        <div className="text-center mb-20">
                            <Badge className="mb-6 text-emerald-300 border-emerald-500/30">
                                <Star className="h-3 w-3 mr-1" />
                                Premium Inventory Management
                            </Badge>
                            
                            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                Track Every
                                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"> Gem</span>
                            </h1>
                            
                            <h2 className="text-2xl md:text-3xl text-emerald-100 mb-8 font-light">
                                From Shop to Workshop & Back
                            </h2>
                            
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                                Complete traceability for precious stones. Manage inventory, track vouchers, 
                                monitor workshop processing, and ensure every gem's journey is documented.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                <Link href={route('login')}>
                                    <Button size="lg" className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg group cursor-pointer align-center">
                                        Sign In to Dashboard
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button size="lg" variant="outline" className="flex items-center justify-center bg-transparent border-white/30 text-white group hover:bg-white/10 hover:text-white px-8 py-4 text-lg cursor-pointer align-center">
                                        Create Account
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                            <Card className="p-8 text-center bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Package className="h-8 w-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">Shop Inventory</h3>
                                <p className="text-gray-300">Manage precious stones in shop storage with real-time tracking</p>
                            </Card>
                            
                            <Card className="p-8 text-center bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Truck className="h-8 w-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">Transit Tracking</h3>
                                <p className="text-gray-300">Monitor stones during transportation with GPS updates</p>
                            </Card>
                            
                            <Card className="p-8 text-center bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Wrench className="h-8 w-8 text-orange-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">Workshop Processing</h3>
                                <p className="text-gray-300">Track stones being processed with detailed work logs</p>
                            </Card>
                            
                            <Card className="p-8 text-center bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <RotateCcw className="h-8 w-8 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">Return Process</h3>
                                <p className="text-gray-300">Manage stones returning to shop with quality checks</p>
                            </Card>
                        </div>

                        {/* Workflow Section */}
                        <Card className="p-12 bg-white/5 backdrop-blur-sm border-white/10 mb-20">
                            <div className="text-center mb-12">
                                <h3 className="text-3xl font-bold text-white mb-4">Complete Voucher Workflow</h3>
                                <p className="text-gray-300 text-lg">Track every step of your precious stones' journey</p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
                                <div className="text-center group">
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border-2 border-emerald-500/30">
                                        <span className="text-emerald-400 font-bold text-xl">1</span>
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Create Voucher</h4>
                                    <p className="text-gray-300 text-sm">Document stones leaving shop</p>
                                </div>
                                
                                <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
                                
                                <div className="text-center group">
                                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border-2 border-blue-500/30">
                                        <span className="text-blue-400 font-bold text-xl">2</span>
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Send to Workshop</h4>
                                    <p className="text-gray-300 text-sm">Track transit to workshop</p>
                                </div>
                                
                                <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
                                
                                <div className="text-center group">
                                    <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border-2 border-orange-500/30">
                                        <span className="text-orange-400 font-bold text-xl">3</span>
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Process</h4>
                                    <p className="text-gray-300 text-sm">Monitor workshop work</p>
                                </div>
                                
                                <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
                                
                                <div className="text-center group">
                                    <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border-2 border-purple-500/30">
                                        <span className="text-purple-400 font-bold text-xl">4</span>
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Return to Shop</h4>
                                    <p className="text-gray-300 text-sm">Complete the cycle</p>
                                </div>
                            </div>
                        </Card>

                        {/* Footer */}
                        <div className="text-center text-gray-400">
                            <div className="flex justify-center items-center space-x-4">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm">Secure & Reliable</span>
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm">Real-time Tracking</span>
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm">Complete Audit Trail</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
