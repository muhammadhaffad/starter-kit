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

    public function getMenu($id) {
        return App\Models\Menu::with('permissions')->find($id);
    }

    public function updateMenuOrder($id, $order, $parentId) {
        $menu = App\Models\Menu::find($id);
        $menu->order_index = $order;
        $menu->parent_id = $parentId;
        $menu->save();
    }

    public function addMenu($data) {
        DB::beginTransaction();
        $data['name'] = $data['title'];
        $data['slug'] = Str::slug($data['name']);
        unset($data['title']);
        $menu = App\Models\Menu::create($data);
        $pivotData = [];
        foreach ($data['permissions'] as $item) {
            $pivotData[$item['permission_id']] = ['route' => $item['route']];
        }
        $menu->permissions()->attach($pivotData);
        DB::commit();
        return $menu;
    }

    public function deleteMenu($id) {
        $menu = App\Models\Menu::find($id);
        $menu->delete();
    }

    public function updateMenu($id, $data) {
        DB::beginTransaction();
        $menu = App\Models\Menu::find($id);
        $data['name'] = $data['title'];
        $data['slug'] = Str::slug($data['name']);
        unset($data['title']);
        $menu->update($data);
        $menu->permissions()->detach();
        $pivotData = array_map(function ($permission) use ($menu) {
            return [
                'menu_id' => $menu->id,
                'permission_id' => $permission['permission_id'],
                'route' => $permission['route']
            ];
        }, $data['permissions']);
        DB::table('menu_permission')->insert($pivotData);
        DB::commit();
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