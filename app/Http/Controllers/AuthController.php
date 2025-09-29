<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AuthService;
use Inertia\Inertia;

class AuthController extends Controller
{
    protected $authService;
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }
    public function login()
    {
        return Inertia::render('login');
    }
    
    public function auth(Request $request)
    {
        $credentials = $request->only('email', 'password');
        $remember = $request->has('remember');

        if ($this->authService->login($credentials, $remember)) {
            return redirect()->intended('/dashboard')->with('success', 'You have successfully logged in');
        }
        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->with('error', 'Oops! Something went wrong');
    }

    public function deauth(Request $request)
    {
        $this->authService->logout($request);
        return redirect()->to('/login')->with('success', 'You have successfully logged out');
    }
}
