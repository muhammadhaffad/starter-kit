<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function permissions()
    {
        return $this->roles()->with('permissions')->get()
            ->pluck('permissions')->flatten()->unique('id');
    }

    public function canAccessMenu(Menu $menu): bool
    {
        $userPermissions = $this->permissions()->pluck('id')->toArray();
        $menuPermissions = $menu->permissions()->pluck('id')->toArray();

        // Jika ada intersection, berarti user punya akses
        return count(array_intersect($userPermissions, $menuPermissions)) > 0;
    }

    public function canAccessRoute($route): bool
    {
        $userPermissions = $this->permissions()->pluck('id')->toArray();
        $menuPermissions = DB::table('menu_permission')->where('route', $route)->pluck('permission_id')->toArray();

        // Jika ada intersection, berarti user punya akses
        return count(array_intersect($userPermissions, $menuPermissions)) > 0;
    }
}
