<?php

namespace App\Services;

use App;

class RoleService
{
    public function getAllRole($data)
    {
        $perPage = (int)($data['perPage'] ?? 10);
        $column = in_array($data['column'] ?? null, ['name', 'description']) ? $data['column'] : 'id';
        $data['direction'] = str_replace(['ascending', 'descending'], ['asc', 'desc'], $data['direction'] ?? null);
        $direction = in_array($data['direction'] ?? null, ['asc', 'desc']) ? $data['direction'] : 'desc';
        return App\Models\Role::with('permissions')->where(function ($query) use ($data) {
            if (isset($data['search'])) {
                $query->where('name', 'like', '%' . $data['search'] . '%')
                    ->orWhere('description', 'like', '%' . $data['search'] . '%');
            }
        })->orderBy($column, $direction)->paginate($perPage)->withQueryString();
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
