<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/dashboard');

    // Settings routes will be added later when controllers are created
    Route::get('settings/profile', function () {
        return Inertia::render('Settings/Profile');
    })->name('profile.edit');

    Route::get('settings/password', function () {
        return Inertia::render('Settings/Password');
    })->name('password.edit');

    Route::get('settings/appearance', function () {
        return Inertia::render('Settings/Appearance');
    })->name('appearance.edit');
});
