<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;

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
}
