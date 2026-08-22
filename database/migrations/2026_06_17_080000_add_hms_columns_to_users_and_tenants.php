<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('slug')->nullable()->after('name');
            $table->string('address')->nullable()->after('slug');
            $table->string('phone', 20)->nullable()->after('address');
            $table->string('email')->nullable()->after('phone');
            $table->string('website')->nullable()->after('email');
            $table->string('logo')->nullable()->after('website');
            $table->boolean('is_active')->default(true)->after('logo');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('tenant_id')->nullable()->after('id')->index();
            $table->string('role', 30)->default('patient')->after('name');
            $table->string('phone', 20)->nullable()->after('email');
            $table->string('avatar')->nullable()->after('phone');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('avatar');
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->boolean('is_active')->default(true)->after('date_of_birth');

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn(['tenant_id', 'role', 'phone', 'avatar', 'gender', 'date_of_birth', 'is_active']);
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['name', 'slug', 'address', 'phone', 'email', 'website', 'logo', 'is_active']);
        });
    }
};
