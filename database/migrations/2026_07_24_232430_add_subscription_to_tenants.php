<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->foreignUuid('plan_id')->nullable()->after('is_active')->constrained()->nullOnDelete();
            $table->string('subscription_status')->default('trialing')->after('plan_id');
            $table->timestamp('trial_ends_at')->nullable()->after('subscription_status');
            $table->timestamp('subscribed_at')->nullable()->after('trial_ends_at');
            $table->timestamp('subscription_ends_at')->nullable()->after('subscribed_at');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
            $table->dropColumn(['plan_id', 'subscription_status', 'trial_ends_at', 'subscribed_at', 'subscription_ends_at']);
        });
    }
};
