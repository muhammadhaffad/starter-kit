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
    Breadcrumbs::for('dashboard', function($trail) {
        $trail->parent('home');
        $trail->push('Dashboard', '/dashboard');
    });
    Inertia::share('breadcrumbs', Breadcrumbs::generate('dashboard')->toArray());
    return Inertia::render('dashboard/index');
})->middleware(['auth', 'check-menu-access'])->name('dashboard.index');

Route::prefix('/account-settings')->middleware(['auth', 'check-menu-access'])->group(function () {
    Route::get('/', [App\Http\Controllers\UserController::class, 'indexSelf'])->name('account-settings.index');
    Route::post('/update-profile', [App\Http\Controllers\UserController::class, 'updateProfile'])->name('account-settings.update-profile');
    Route::post('/upload-profile-picture', [App\Http\Controllers\UserController::class, 'uploadProfilePicture'])->name('account-settings.upload-profile-picture');
    Route::post('/change-password', [App\Http\Controllers\UserController::class, 'updatePassword'])->name('account-settings.change-password');
    Route::post('/deactivate', [App\Http\Controllers\UserController::class, 'deactivate'])->name('account-settings.deactivate');
});

Route::prefix('/users')->middleware(['auth', 'check-menu-access'])->group(function () {
    Route::get('/', [App\Http\Controllers\UserController::class, 'index'])->name('users.index');
    Route::get('/create', [App\Http\Controllers\UserController::class, 'createUser'])->name('users.create');
    Route::post('/store', [App\Http\Controllers\UserController::class, 'storeUser'])->name('users.store');
    Route::get('/detail/{idUser}', [App\Http\Controllers\UserController::class, 'detailUser'])->name('users.detail');
    Route::put('/detail/{idUser}', [App\Http\Controllers\UserController::class, 'updateUserProfile'])->name('users.detail.update-profile');
    Route::put('/detail/{idUser}/change-password', [App\Http\Controllers\UserController::class, 'updateUserPassword'])->name('users.detail.change-password');
    Route::put('/detail/{idUser}/change-role', [App\Http\Controllers\UserController::class, 'changeRole'])->name('users.detail.change-role');
    Route::put('/detail/{idUser}/deactivate', [App\Http\Controllers\UserController::class, 'deactivateUser'])->name('users.detail.deactivate');
    Route::put('/detail/{idUser}/reactivate', [App\Http\Controllers\UserController::class, 'reactivateUser'])->name('users.detail.reactivate');
});

Route::prefix('permissions')->middleware(['auth', 'check-menu-access'])->group(function () {
    Route::get('/', [App\Http\Controllers\PermissionController::class, 'index'])->name('permissions.index');
    Route::post('/', [App\Http\Controllers\PermissionController::class, 'createPermission'])->name('permissions.create');
    Route::put('/{id}', [App\Http\Controllers\PermissionController::class, 'updatePermission'])->name('permissions.update');
    Route::delete('/{id}', [App\Http\Controllers\PermissionController::class, 'deletePermission'])->name('permissions.delete');
});
Route::prefix('roles')->middleware(['auth', 'check-menu-access'])->group(function () {
    Route::get('/', [App\Http\Controllers\RoleController::class, 'index'])->name('roles.index');
    Route::post('/', [App\Http\Controllers\RoleController::class, 'createRole'])->name('roles.create');
    Route::put('/{id}', [App\Http\Controllers\RoleController::class, 'updateRole'])->name('roles.update');
    Route::delete('/{id}', [App\Http\Controllers\RoleController::class, 'deleteRole'])->name('roles.delete');
});
Route::prefix('menus')->middleware(['auth', 'check-menu-access'])->group(function () {
    Route::get('/', [App\Http\Controllers\MenuController::class, 'index'])->name('menus.index');
    Route::get('/detail/{id}', [App\Http\Controllers\MenuController::class, 'detailMenu'])->name('menus.detail');
    Route::get('/create', [App\Http\Controllers\MenuController::class, 'createMenu'])->name('menus.create');
    Route::put('/update-order', [App\Http\Controllers\MenuController::class, 'updateMenuOrder'])->name('menus.update-order');
    Route::post('/add', [App\Http\Controllers\MenuController::class, 'storeMenu'])->name('menus.add');
    Route::delete('/{id}', [App\Http\Controllers\MenuController::class, 'destroyMenu'])->name('menus.destroy');
    Route::put('/{id}', [App\Http\Controllers\MenuController::class, 'updateMenu'])->name('menus.update');
});
