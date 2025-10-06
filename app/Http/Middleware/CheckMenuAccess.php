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
        $isHasAdminRole = auth()->user()->roles()->pluck('name')->contains('admin');
        $isIdIsOne = auth()->user()->id === 1;
        if ($isHasAdminRole or $isIdIsOne) {
            return $next($request);
        }
        if (auth()->user()->canAccessRoute($request->route()->getName())) {
            return $next($request);
        }
        abort(403, 'Unauthorized');
    }
}
