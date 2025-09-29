<?php
namespace App\Services;

use App;

class PermissionService
{
    public function getAllPermission() {
        return App\Models\Permission::all();
    }

    public function createPermission($data) {
        return App\Models\Permission::create($data);
    }

    public function updatePermission($data, $id) {
        return App\Models\Permission::find($id)->update($data);
    }

    public function deletePermission($ids) {
        return App\Models\Permission::whereIn('id', $ids)->delete();
    }
}