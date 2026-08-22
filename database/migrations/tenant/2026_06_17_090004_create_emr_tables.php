<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Visit records (EMR core)
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->string('record_number', 20)->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->date('visit_date');
            $table->enum('visit_type', ['outpatient', 'inpatient', 'emergency', 'follow_up', 'telemedicine'])->default('outpatient');
            $table->text('chief_complaint')->nullable();
            $table->text('history_of_present_illness')->nullable();
            $table->text('past_medical_history')->nullable();
            $table->text('physical_examination')->nullable();
            $table->text('assessment')->nullable();
            $table->text('plan')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['draft', 'finalized', 'amended'])->default('draft');
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'visit_date']);
            $table->index(['doctor_id', 'visit_date']);
        });

        // Vitals per record
        Schema::create('vitals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->decimal('temperature', 5, 2)->nullable()->comment('°C');
            $table->integer('pulse_rate')->nullable()->comment('bpm');
            $table->integer('respiratory_rate')->nullable()->comment('breaths/min');
            $table->integer('systolic_bp')->nullable()->comment('mmHg');
            $table->integer('diastolic_bp')->nullable()->comment('mmHg');
            $table->decimal('oxygen_saturation', 5, 2)->nullable()->comment('%');
            $table->decimal('weight', 6, 2)->nullable()->comment('kg');
            $table->decimal('height', 5, 2)->nullable()->comment('cm');
            $table->decimal('bmi', 5, 2)->nullable();
            $table->integer('blood_glucose')->nullable()->comment('mg/dL');
            $table->text('notes')->nullable();
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();
        });

        // Diagnoses per record
        Schema::create('diagnoses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('icd10_code', 20)->nullable();
            $table->string('diagnosis_name');
            $table->enum('type', ['primary', 'secondary', 'differential'])->default('primary');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'icd10_code']);
        });

        // Prescriptions per record
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->string('prescription_number', 20)->unique();
            $table->foreignId('medical_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->date('prescribed_date');
            $table->date('expiry_date')->nullable();
            $table->enum('status', ['active', 'dispensed', 'cancelled', 'expired'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'status']);
        });

        // Prescription line items
        Schema::create('prescription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained()->cascadeOnDelete();
            $table->string('medication_name');
            $table->string('generic_name')->nullable();
            $table->string('dosage');
            $table->string('frequency');
            $table->string('route')->nullable()->comment('oral, IV, IM, etc.');
            $table->integer('duration_days')->nullable();
            $table->integer('quantity')->nullable();
            $table->text('instructions')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescription_items');
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('diagnoses');
        Schema::dropIfExists('vitals');
        Schema::dropIfExists('medical_records');
    }
};
