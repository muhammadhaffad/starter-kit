<?php

namespace App\Http\Controllers;

use App;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function __construct(protected App\Services\RoleService $roleService)
    {}

    public function index(Request $request)
    {
        $roles = $this->roleService->getAllRole($request->all());
        Breadcrumbs::for('roles', function($trail) {
            $trail->parent('home');
            $trail->push('Roles', route('roles.index'));
        });
        Inertia::share('breadcrumbs', Breadcrumbs::generate('roles')->toArray());
        $permissions = App\Models\Permission::all();
        return Inertia::render('role/index', compact('roles', 'permissions'));
    }

    public function createRole(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'description' => 'required',
            'permissions' => 'required|array',
        ]);
        $this->roleService->createRole($validated);
        return redirect()->back()->with('success', 'Role created successfully');
    }

    public function deleteRole($id)
    {
        $this->roleService->deleteRole(explode(',', $id));
        return redirect()->back()->with('success', 'Role deleted successfully');
    }

    public function updateRole(Request $request, $id) {
        $validated = $request->validate([
            'name' => 'required',
            'description' => 'required',
            'permissions' => 'required|array',
        ]);
        $this->roleService->updateRole($validated, $id);
        return redirect()->back()->with('success', 'Role updated successfully');
    }
}
