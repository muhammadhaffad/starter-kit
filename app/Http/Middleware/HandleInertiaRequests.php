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
            WHERE ru.user_id = ?
            ORDER BY mt.path_order_index";
        $menus = \App\Models\Menu::hydrate(DB::select($menuQuery, [auth()->user()?->id]));
        $currentRoute = $request->route()->getName();

        $menuActive = $menus->first(function ($menu) use ($currentRoute) {
            // Cek cocok persis
            if ($menu->route === $currentRoute) {
                return true;
            }

            // Cek cocok pattern (contoh: products.*)
            if (!empty($menu->menu_active_pattern)) {
                return \Illuminate\Support\Str::is($menu->menu_active_pattern, $currentRoute);
            }

            return false;
        });
        $menuExpanded = json_decode(str_replace(['{', '}'], ['[', ']'], $menuActive?->path_order));
        return array_merge([
            'app_name' => config('app.name'),
            'app_logo' => config('app.logo'),
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
                    'menu_active_pattern' => $menu->menu_active_pattern,
                    'children' => $children
                ];
            }
        }
        return $branch;
    }
}
