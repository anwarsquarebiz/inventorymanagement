<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Custom logout route since we're using Fortify for login
Route::middleware('auth')->group(function () {
    Route::post('logout', function () {
        auth()->logout();
        return redirect()->route('login');
    })->name('logout');
});
