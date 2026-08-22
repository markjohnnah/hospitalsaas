<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Wards
        Schema::create('wards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 20)->unique();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['general', 'private', 'icu', 'nicu', 'maternity', 'pediatric', 'surgical', 'psychiatric'])->default('general');
            $table->integer('total_beds')->default(0);
            $table->string('floor')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Beds within wards
        Schema::create('beds', function (Blueprint $table) {
            $table->id();
            $table->string('bed_number', 20);
            $table->foreignId('ward_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['standard', 'icu', 'isolation', 'pediatric'])->default('standard');
            $table->enum('status', ['available', 'occupied', 'maintenance', 'reserved'])->default('available');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['ward_id', 'bed_number']);
            $table->index(['ward_id', 'status']);
        });

        // Patient admissions
        Schema::create('admissions', function (Blueprint $table) {
            $table->id();
            $table->string('admission_number', 20)->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bed_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ward_id')->constrained()->cascadeOnDelete();
            $table->foreignId('admitting_doctor_id')->constrained('doctors')->cascadeOnDelete();
            $table->foreignId('medical_record_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('admitted_at')->useCurrent();
            $table->timestamp('discharged_at')->nullable();
            $table->enum('status', ['admitted', 'discharged', 'transferred'])->default('admitted');
            $table->enum('admission_type', ['emergency', 'elective', 'transfer'])->default('elective');
            $table->text('diagnosis_on_admission')->nullable();
            $table->text('discharge_summary')->nullable();
            $table->enum('discharge_condition', ['improved', 'recovered', 'referred', 'against_advice', 'deceased'])->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'status']);
            $table->index(['bed_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admissions');
        Schema::dropIfExists('beds');
        Schema::dropIfExists('wards');
    }
};
