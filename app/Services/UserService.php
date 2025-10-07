<?php
namespace App\Services;
use App\Models;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function getAllUser($data)
    {
        $perPage = (int)($data['perPage'] ?? 10);
        $column = in_array($data['column'] ?? null, ['name', 'email', 'is_active']) ? $data['column'] : 'id';
        $data['direction'] = str_replace(['ascending', 'descending'], ['asc', 'desc'], $data['direction'] ?? null);
        $direction = in_array($data['direction'] ?? null, ['asc', 'desc']) ? $data['direction'] : 'desc';
        if ($column == 'is_active') {
            $column = 'deleted_at';
        }

        // hitung total data
        $users = Models\User::withTrashed()->where(function ($query) use ($data) {
            if (isset($data['search'])) {
                $query->where('name', 'like', '%' . $data['search'] . '%')
                    ->orWhere('email', 'like', '%' . $data['search'] . '%');
            }
        })->orderBy($column, $direction)->with('roles')->paginate($perPage)->withQueryString();
        return $users;
    }

    public function getUserById($idUser)
    {
        return Models\User::withTrashed()->with('roles')->find($idUser);
    }

    public function storeUser($data)
    {
        $user = Models\User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
        $user->roles()->sync($data['role']);
        return $user;
    }

    public function updateProfile($data, $idUser)
    {
        $user = Models\User::find($idUser);
        $user->update($data);
    }

    public function updatePassword($newPassword, $idUser)
    {
        $user = Models\User::find($idUser);
        $user->update([
            'password' => password_hash($newPassword, PASSWORD_DEFAULT)
        ]);
    }

    public function deactivate($idUser, $request, $needLogout = true)
    {
        $user = Models\User::find($idUser);
        $user->delete();
        if ($needLogout) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }

    public function reactivate($idUser)
    {
        $user = Models\User::withTrashed()->find($idUser);
        $user->restore();
    }
    
    public function changeRole($idUser, $role)
    {
        $user = Models\User::find($idUser);
        $user->roles()->sync($role);
        return $user;
    }
}
