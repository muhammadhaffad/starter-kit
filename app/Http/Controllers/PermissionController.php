<?php

namespace App\Http\Controllers;

use App;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function __construct(protected App\Services\PermissionService $permissionService)
    {}

    public function index()
    {
        $permissions = $this->permissionService->getAllPermission();
        Breadcrumbs::for('permission', function($trail) {
            $trail->parent('home');
            $trail->push('Permission', route('permissions.index'));
        });
        Inertia::share('breadcrumbs', Breadcrumbs::generate('permission')->toArray());
        return Inertia::render('permission/index', compact('permissions'));
    }

    public function createPermission(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'description' => 'required',
        ]);
        $this->permissionService->createPermission($request->all());
        return redirect()->route('permissions.index')->with('success', 'Permission created successfully');
    }

    public function updatePermission(Request $request, $id)
    {
        $request->validate([
            'name' => 'required',
            'description' => 'required',
        ]);
        $this->permissionService->updatePermission($request->all(), $id);
        return redirect()->route('permissions.index')->with('success', 'Permission updated successfully');
    }

    public function deletePermission($id)
    {
        $ids = explode(',', $id);
        $this->permissionService->deletePermission($ids);
        return redirect()->route('permissions.index')->with('success', 'Permission deleted successfully');
    }
}
