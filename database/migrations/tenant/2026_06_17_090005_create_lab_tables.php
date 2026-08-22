<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Lab test catalog
        Schema::create('lab_tests', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name');
            $table->string('category')->nullable()->comment('Hematology, Biochemistry, Microbiology, etc.');
            $table->string('unit')->nullable();
            $table->string('normal_range')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('turnaround_hours')->default(24);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category', 'is_active']);
        });

        // Lab orders (requests)
        Schema::create('lab_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 20)->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medical_record_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('priority', ['routine', 'urgent', 'stat'])->default('routine');
            $table->enum('status', ['ordered', 'sample_collected', 'processing', 'completed', 'cancelled'])->default('ordered');
            $table->date('ordered_date');
            $table->timestamp('sample_collected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('clinical_notes')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'status']);
            $table->index(['status', 'ordered_date']);
        });

        // Individual test results within an order
        Schema::create('lab_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lab_test_id')->constrained()->cascadeOnDelete();
            $table->string('result_value')->nullable();
            $table->string('unit')->nullable();
            $table->string('normal_range')->nullable();
            $table->enum('flag', ['normal', 'low', 'high', 'critical_low', 'critical_high'])->default('normal');
            $table->text('notes')->nullable();
            $table->timestamp('resulted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_results');
        Schema::dropIfExists('lab_orders');
        Schema::dropIfExists('lab_tests');
    }
};
