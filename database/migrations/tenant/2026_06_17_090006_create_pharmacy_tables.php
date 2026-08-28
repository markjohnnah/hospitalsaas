<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pharmacy medication catalog
        Schema::create('medications', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->nullable()->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->string('code', 30);
            $table->string('brand_name');
            $table->string('generic_name')->nullable();
            $table->string('category')->nullable()->comment('Antibiotic, Analgesic, etc.');
            $table->string('dosage_form')->nullable()->comment('Tablet, Capsule, Syrup, etc.');
            $table->string('strength')->nullable();
            $table->string('unit')->default('unit');
            $table->integer('quantity_in_stock')->default(0);
            $table->integer('reorder_level')->default(10);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->date('expiry_date')->nullable();
            $table->boolean('requires_prescription')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category', 'is_active']);
            $table->index('generic_name');
            $table->unique(['tenant_id', 'code']);
        });

        // Dispensing records (when pharmacy dispenses a prescription)
        Schema::create('dispensing_records', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->nullable()->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->string('dispensing_number', 20);
            $table->foreignId('prescription_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('dispensed_by')->index();
            $table->timestamp('dispensed_at')->useCurrent();
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['tenant_id', 'dispensing_number']);
        });

        // Dispensed items per dispensing record
        Schema::create('dispensed_items', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->nullable()->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreignId('dispensing_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medication_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity_dispensed');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispensed_items');
        Schema::dropIfExists('dispensing_records');
        Schema::dropIfExists('medications');
    }
};
