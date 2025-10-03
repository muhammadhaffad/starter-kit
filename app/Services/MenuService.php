<?php
namespace App\Services;

use App;
use Illuminate\Support\Facades\DB;

class MenuService
{
    public function getMenus() {
        $query = "SELECT DISTINCT mt.*
            FROM menu_tree mt
            ORDER BY mt.path_order";
        $menus = App\Models\Menu::with('permissions')->hydrate(DB::select($query));
        return $this->buildTree($menus);
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
                    'children' => $children,
                    'permissions' => $menu->permissions->toArray()
                ];
            }
        }
        return $branch;
    }
}