<?php

namespace App\Services;

use App;

class RoleService
{
    public function getAllRole()
    {
        return App\Models\Role::with('permissions')->orderBy('id', 'asc')->get();
    }

    public function createRole($data)
    {
        return App\Models\Role::create([
            'name' => $data['name'],
            'description' => $data['description'],
        ])->permissions()->attach($data['permissions']);
    }

    public function updateRole($data, $id)
    {
        $role = App\Models\Role::find($id);
        $role->permissions()->sync($data['permissions']);
        return $role->update([
            'name' => $data['name'],
            'description' => $data['description'],
        ]);
    }

    public function deleteRole($ids)
    {
        $roles = App\Models\Role::whereIn('id', $ids)->get();

        foreach ($roles as $role) {
            // putuskan relasi role ↔ permission
            $role->permissions()->detach();

            // hapus role
            $role->delete();
        }

        return true;
    }
}
