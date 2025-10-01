<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $menuQuery = "SELECT DISTINCT mt.*
            FROM menu_tree mt
            JOIN menu_permission mp ON mp.menu_id = mt.id
            JOIN permission_role pr ON pr.permission_id = mp.permission_id
            JOIN role_user ru ON ru.role_id = pr.role_id
            WHERE pr.role_id = 1
            ORDER BY mt.path_order";
        $menus = \App\Models\Menu::hydrate(DB::select($menuQuery));
        $menuActive = $menus->where('route', $request->route()->getName())->first();
        $menuExpanded = json_decode(str_replace(['{', '}'], ['[', ']'], $menuActive?->path_order));
        return array_merge([
            'currentPath' => $request->path(),
            'user' => auth()->user() ?? null,
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
                'info'    => fn() => $request->session()->get('info'),
            ],
            'menus' => $this->buildTree($menus),
            'menusFlatten' => $menus,
            'menuExpanded' => $menuExpanded,
            'menuActive' => $menuActive?->id
        ], parent::share($request));
    }

    public function buildTree($menus, $parentId = null) {
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
