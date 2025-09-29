<?php

namespace App\Http\Controllers;

use App;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    protected $userService;
    public function __construct(App\Services\UserService $userService)
    {
        $this->userService = $userService;
    }
    public function indexSelf()
    {
        Breadcrumbs::for('account-settings', function($trail) {
            $trail->push('Home', '/');
            $trail->push('Settings', '/account-settings');
        });
        Inertia::share('breadcrumbs', Breadcrumbs::generate('account-settings')->toArray());
        return Inertia::render('settings');
    }
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $request->user()->id,
        ]);
        $this->userService->updateProfile($request->all(), $request->user()->id);
        return redirect()->back()->with('success', 'Profile updated successfully');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);
        try {
            $this->userService->updatePassword($request->current_password, $request->password, $request->user()->id);
            return redirect()->back()->with('success', 'Password updated successfully');
        } catch(\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function deactivate(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
        ]);
        try {
            $this->userService->deactivate($request->current_password, $request->user()->id, $request);
            return redirect()->route('login')->with('success', 'User deactivated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
