<?php
namespace App\Services;
use App\Models;
use Illuminate\Support\Facades\Auth;

class UserService
{
    public function updateProfile($data, $idUser)
    {
        $user = Models\User::find($idUser);
        $user->update($data);
    }

    public function updatePassword($oldPassword, $newPassword, $idUser)
    {
        if (!password_verify($oldPassword, Models\User::find($idUser)->password)) {
            throw new \Exception('Invalid old password');
        }
        $user = Models\User::find($idUser);
        $user->update([
            'password' => password_hash($newPassword, PASSWORD_DEFAULT)
        ]);
    }

    public function deactivate($currentPassword, $idUser, $request)
    {
        if (!password_verify($currentPassword, Models\User::find($idUser)->password)) {
            throw new \Exception('Invalid password');
        }
        $user = Models\User::find($idUser);
        $user->delete();
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
