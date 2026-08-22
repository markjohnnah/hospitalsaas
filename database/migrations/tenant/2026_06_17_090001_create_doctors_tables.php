<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 20)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('specializations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('specialization_id')->nullable()->constrained()->nullOnDelete();
            $table->string('license_number', 50)->nullable()->unique();
            $table->decimal('consultation_fee', 10, 2)->default(0);
            $table->text('bio')->nullable();
            $table->string('qualification')->nullable();
            $table->integer('experience_years')->default(0);
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->index('user_id');
        });

        Schema::create('doctor_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('day_of_week'); // 0=Sunday … 6=Saturday
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('slot_duration_minutes')->default(30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['doctor_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_schedules');
        Schema::dropIfExists('doctors');
        Schema::dropIfExists('specializations');
        Schema::dropIfExists('departments');
    }
};
