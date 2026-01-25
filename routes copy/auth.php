<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/login', function () {
    return inertia('Auth/Login');
})->middleware('guest')->name('login');

Route::post('/login', function () {
    // This would typically be handled by Laravel Breeze or similar
    // For now, we'll redirect to dashboard
    return redirect()->route('dashboard');
})->middleware('guest');

Route::post('/logout', function () {
    auth()->logout();
    return redirect()->route('login');
})->middleware('auth')->name('logout');

Route::get('/register', function () {
    return inertia('Auth/Register');
})->middleware('guest')->name('register');

Route::post('/register', function () {
    // Registration logic would go here
    return redirect()->route('dashboard');
})->middleware('guest');
