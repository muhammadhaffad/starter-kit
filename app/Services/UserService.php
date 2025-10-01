<?php
namespace App\Services;
use App\Models;
use Illuminate\Support\Facades\Auth;

class UserService
{
    public function getAllUser()
    {
        return Models\User::withTrashed()->with('roles')->get();
    }

    public function getUserById($idUser)
    {
        return Models\User::withTrashed()->with('roles')->find($idUser);
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
