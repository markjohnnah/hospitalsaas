<?php

namespace App\Providers;

use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\InitializeTenancyByUser;
use Carbon\CarbonImmutable;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerMiddlewareAliases();
    }

    protected function registerMiddlewareAliases(): void
    {
        /** @var Router $router */
        $router = $this->app['router'];

        $router->aliasMiddleware('tenant', InitializeTenancyByUser::class);
        $router->aliasMiddleware('role', EnsureUserHasRole::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
