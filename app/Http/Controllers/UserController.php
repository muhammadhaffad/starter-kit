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
            $trail->push('Home', route('dashboard.index'));
            $trail->push('Settings', '/account-settings');
        });
        Inertia::share('breadcrumbs', Breadcrumbs::generate('account-settings')->toArray());
        return Inertia::render('settings');
    }

    public function index()
    {
        Breadcrumbs::for('users', function($trail) {
            $trail->push('Home', route('dashboard.index'));
            $trail->push('Users', '/users');
        });
        Inertia::share('breadcrumbs', Breadcrumbs::generate('users')->toArray());
        return Inertia::render('user/index', [
            'users' => $this->userService->getAllUser(),
        ]);
    }

    public function detailUser($idUser)
    {
        Breadcrumbs::for('user-detail', function($trail) use ($idUser) {
            $trail->push('Home', route('dashboard.index'));
            $trail->push('Users', route('users.index'));
            $trail->push('User Detail', route('users.detail', $idUser));
        });
        Inertia::share('breadcrumbs', Breadcrumbs::generate('user-detail')->toArray());
        Inertia::share('menuActive', \App\Models\Menu::where('route', 'users.index')->first()->id);
        return Inertia::render('user/detail/index', [
            'user' => $this->userService->getUserById($idUser),
            'roles' => \App\Models\Role::all(),
        ]);
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
            if (!password_verify($request->current_password, App\Models\User::find($request->user()->id)->password)) {
                throw new \Exception('Invalid old password');
            }
            $this->userService->updatePassword($request->password, $request->user()->id);
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
            if (!password_verify($request->current_password, App\Models\User::find($request->user()->id)->password)) {
                throw new \Exception('Invalid password');
            }
            $this->userService->deactivate($request->user()->id, $request);
            return redirect()->route('login')->with('success', 'User deactivated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function updateUserProfile(Request $request, $idUser)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $idUser,
        ]);
        try {
            $this->userService->updateProfile($request->all(), $idUser);
            return redirect()->back()->with('success', 'Profile updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function updateUserPassword(Request $request, $idUser)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);
        try {
            $this->userService->updatePassword($request->password, $idUser);
            return redirect()->back()->with('success', 'Password updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function deactivateUser(Request $request, $idUser)
    {
        try {
            $this->userService->deactivate($idUser, $request, false);
            return redirect()->back()->with('success', 'User deactivated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function reactivateUser(Request $request, $idUser)
    {
        try {
            $this->userService->reactivate($idUser);
            return redirect()->back()->with('success', 'User reactivated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function changeRole(Request $request, $idUser)
    {
        $request->validate([
            'role' => 'required|exists:roles,id',
        ]);
        try {
            $this->userService->changeRole($idUser, $request->role);
            return redirect()->back()->with('success', 'Role changed successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
