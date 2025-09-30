<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/login', function () {
    return Inertia::render('login');
})->middleware('guest')->name('login');
Route::post('/login', [App\Http\Controllers\AuthController::class, 'auth'])->middleware('guest')->name('login.auth');
Route::post('/logout', [App\Http\Controllers\AuthController::class, 'deauth'])->middleware('auth')->name('logout');

Breadcrumbs::for('home', function($trail) {
    $trail->push('Home', '/dashboard');
});
Route::get('/dashboard', function () {
    Breadcrumbs::for('test', function($trail) {
        $trail->parent('home');
        $trail->push('Test', '/test');
    });
    Inertia::share('breadcrumbs', Breadcrumbs::generate('test')->toArray());
    return Inertia::render('test');
})->middleware('auth')->name('dashboard.index');

Route::prefix('/account-settings')->middleware('auth')->group(function () {
    Route::get('/', [App\Http\Controllers\UserController::class, 'indexSelf'])->name('account-settings.index');
    Route::post('/update-profile', [App\Http\Controllers\UserController::class, 'updateProfile'])->name('account-settings.update-profile');
    Route::post('/change-password', [App\Http\Controllers\UserController::class, 'updatePassword'])->name('account-settings.change-password');
    Route::post('/deactivate', [App\Http\Controllers\UserController::class, 'deactivate'])->name('account-settings.deactivate');
});

Route::get('/users', function () {
    return Inertia::render('test');
})->middleware('auth')->name('users.index');
Route::prefix('permissions')->group(function () {
    Route::get('/', [App\Http\Controllers\PermissionController::class, 'index'])->name('permissions.index');
    Route::post('/', [App\Http\Controllers\PermissionController::class, 'createPermission'])->name('permissions.create');
    Route::put('/{id}', [App\Http\Controllers\PermissionController::class, 'updatePermission'])->name('permissions.update');
    Route::delete('/{id}', [App\Http\Controllers\PermissionController::class, 'deletePermission'])->name('permissions.delete');
})->middleware('auth');
Route::prefix('roles')->group(function () {
    Route::get('/', [App\Http\Controllers\RoleController::class, 'index'])->name('roles.index');
    Route::post('/', [App\Http\Controllers\RoleController::class, 'createRole'])->name('roles.create');
    Route::put('/{id}', [App\Http\Controllers\RoleController::class, 'updateRole'])->name('roles.update');
    Route::delete('/{id}', [App\Http\Controllers\RoleController::class, 'deleteRole'])->name('roles.delete');
})->middleware('auth');
Route::get('/menus', function () {
    return Inertia::render('test');
})->middleware('auth')->name('menus.index');
Route::get('/test-a', function () {
    return Inertia::render('test');
})->middleware('auth')->name('test-a.index');
Route::get('/test-b', function () {
    return Inertia::render('test');
})->middleware('auth')->name('test-b.index');
