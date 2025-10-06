<?php
namespace App\Services;

use App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MenuService
{
    public function getMenus() {
        $query = "SELECT DISTINCT mt.*
            FROM menu_tree mt
            ORDER BY mt.path_order_index";
        $menus = App\Models\Menu::with('permissions')->hydrate(DB::select($query));
        return $this->buildTree($menus);
    }

    public function updateMenuOrder($id, $order, $parentId) {
        $menu = App\Models\Menu::find($id);
        $menu->order_index = $order;
        $menu->parent_id = $parentId;
        $menu->save();
    }

    public function addMenu($data) {
        $data['name'] = $data['title'];
        $data['slug'] = Str::slug($data['name']);
        unset($data['title']);
        $menu = App\Models\Menu::create($data);
        $menu->permissions()->attach($data['permissions']);
        return $menu;
    }

    public function deleteMenu($id) {
        $menu = App\Models\Menu::find($id);
        $menu->delete();
    }

    public function updateMenu($id, $data) {
        $menu = App\Models\Menu::find($id);
        $data['name'] = $data['title'];
        $data['slug'] = Str::slug($data['name']);
        unset($data['title']);
        $menu->update($data);
        $menu->permissions()->sync($data['permissions']);
        return $menu;
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
                    'menu_active_pattern' => $menu->menu_active_pattern,
                    'children' => $children,
                    'permissions' => $menu->permissions->toArray()
                ];
            }
        }
        return $branch;
    }
}