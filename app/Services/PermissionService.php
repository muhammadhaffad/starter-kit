<?php
namespace App\Services;

use App;

class PermissionService
{
    public function getAllPermission($data) {
        $perPage = (int)($data['perPage'] ?? 10);
        $column = in_array($data['column'] ?? null, ['name', 'description']) ? $data['column'] : 'id';
        $data['direction'] = str_replace(['ascending', 'descending'], ['asc', 'desc'], $data['direction'] ?? null);
        $direction = in_array($data['direction'] ?? null, ['asc', 'desc']) ? $data['direction'] : 'desc';
        return App\Models\Permission::where(function ($query) use ($data) {
            if (isset($data['search'])) {
                $query->where('name', 'like', '%' . $data['search'] . '%')
                    ->orWhere('description', 'like', '%' . $data['search'] . '%');
            }
        })->orderBy($column, $direction)->paginate($perPage)->withQueryString();
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