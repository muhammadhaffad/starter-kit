<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'route',
        'menu_active_pattern',
        'parent_id',
        'order_index',
    ];

    public function permissions()
    {
        return $this->belongsToMany(Permission::class)->withPivot('route');
    }
}
