<?php

namespace App\Http\Controllers;

use App;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class MenuController extends Controller
{
    protected $menuService;
    public function __construct()
    {
        $this->menuService = new App\Services\MenuService();
    }
    public function index()
    {
        $menus = $this->menuService->getMenus();
        $permissions = App\Models\Permission::all();
        $routes = collect(Route::getRoutes())
            ->map(fn($route) => $route->getName())
            ->filter()
            ->values();
        Breadcrumbs::for('menus', function ($trail) {
            $trail->parent('home');
            $trail->push('Menu', route('menus.index'));
        });
        Inertia::share('breadcrumbs', Breadcrumbs::generate('menus')->toArray());
        return Inertia::render('menu/index', compact('menus', 'permissions', 'routes'));
    }

    public function updateMenuOrder(Request $request)
    {
        $request->validate([
            'menu_id' => 'required',
            'order' => 'required|numeric',
            'parent_id' => 'nullable|numeric',
        ]);
        $this->menuService->updateMenuOrder($request->menu_id, $request->order, $request->parent_id ?? null);
        return redirect()->back()->with('success', 'Menu order updated successfully');
    }

    public function storeMenu(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required',
            'icon' => 'required',
            'route' => 'nullable',
            'menu_active_pattern' => 'nullable',
            'permissions' => 'required|array',
        ]);
        try {
            $this->menuService->addMenu($validated);
            return redirect()->back()->with('success', 'Menu added successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function destroyMenu($id)
    {
        try {
            $this->menuService->deleteMenu($id);
            return redirect()->back()->with('success', 'Menu deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function updateMenu($id, Request $request)
    {
        $validated = $request->validate([
            'title' => 'required',
            'icon' => 'required',
            'route' => 'nullable',
            'menu_active_pattern' => 'nullable',
            'permissions' => 'required|array',
        ]);
        try {
            $this->menuService->updateMenu($request->id, $validated);
            return redirect()->back()->with('success', 'Menu updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function buildTree($menus, $parentId = null)
    {
        $branch = [];
        foreach ($menus as $menu) {
            if ($menu->parent_id === $parentId) {
                $children = $this->buildTree($menus, $menu->id);

                $branch[] = [
                    'id' => (string) $menu->id,
                    'title' => $menu->name,
                    'type' => $children ? 'folder' : 'file',
                    'icon' => $menu->icon,
                    'route' => $menu->route,
                    'children' => $children
                ];
            }
        }
        return $branch;
    }
}
