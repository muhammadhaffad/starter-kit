<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
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

Route::get('/', function () {
    Breadcrumbs::for('home', function($trail) {
        $trail->push('Home', '/');
    });
    Breadcrumbs::for('test', function($trail) {
        $trail->parent('home');
        $trail->push('Test', '/test');
    });
    Inertia::share('breadcrumbs', Breadcrumbs::generate('test')->toArray());
    return Inertia::render('test');
});
