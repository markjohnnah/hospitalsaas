<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Tenancy;
use Symfony\Component\HttpFoundation\Response;

class InitializeTenancyByUser
{
    public function __construct(protected Tenancy $tenancy) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->tenant_id) {
            $tenant = Tenant::find($user->tenant_id);

            if ($tenant) {
                $this->tenancy->initialize($tenant);
            }
        }

        return $next($request);
    }

    public function terminate(mixed $request, mixed $response): void
    {
        if ($this->tenancy->initialized) {
            $this->tenancy->end();
        }
    }
}
