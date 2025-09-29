<?php

namespace App\Http\Controllers;

use App;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function __construct(protected App\Services\RoleService $roleService)
    {}

    public function index()
    {
        $roles = $this->roleService->getAllRole();
        return Inertia::render('role/index', compact('roles'));
    }
}
