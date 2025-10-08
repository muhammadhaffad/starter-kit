<?php

namespace App\Services;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthService
{
    public function login($credentials, $remember = false)
    {
        if (Auth::attempt($credentials, $remember)) {
            return true;
        }
        return false;
    }

    public function logout(\Illuminate\Http\Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return true;
    }

    public function sendTokenForgotPassword($email) 
    {
        $status = Password::sendResetLink([
            'email' => $email
        ]);

        if ($status == Password::RESET_LINK_SENT) {
            return true;
        }

        return false;
    }

    public function resetPassword($data) 
    {
        $status = Password::reset([
            'email' => $data['email'],
            'password' => $data['password'],
            'password_confirmation' => $data['password_confirmation'],
            'token' => $data['token']
        ], function (\App\Models\User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password),
                'remember_token' => Str::random(60),
            ]);
            $user->save();
            event(new PasswordReset($user));
        });

        if ($status == Password::PASSWORD_RESET) {
            return [true, __($status)];
        }

        return [false, __($status)];
    }
}
