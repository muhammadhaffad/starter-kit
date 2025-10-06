<?php

namespace App\Http\Middleware;

use App;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMenuAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $menu = App\Models\Menu::where('route', $request->route()->getName())->first();
        if ($menu) {
            if (auth()->user()->canAccessMenu($menu)) {
                return $next($request);
            }
        }
        abort(403, 'Unauthorized');
    }
}
