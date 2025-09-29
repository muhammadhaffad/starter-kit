<?php 
namespace App\Services;

use App;

class RoleService
{
    public function getAllRole() {
        return App\Models\Role::with('permissions')->get();
    }

    public function createRole($data, $permissions) {
        return App\Models\Role::create([
            'name' => $data['name'],
            'description' => $data['description'],
        ])->permissions()->attach($permissions);
    }

    public function updateRole($data, $id, $permissions) {
        return App\Models\Role::find($id)->update($data)->permissions()->sync($permissions);
    }

    public function deleteRole($ids) {
        return App\Models\Role::whereIn('id', $ids)->delete();
    }
}
