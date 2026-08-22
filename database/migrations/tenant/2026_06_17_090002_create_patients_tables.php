<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('mrn', 20)->unique(); // Medical Record Number
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('blood_type', 5)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('country', 100)->nullable()->default('Kenya');
            $table->string('nationality', 100)->nullable();
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            $table->string('occupation')->nullable();
            // Emergency contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            // Insurance
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_policy_number')->nullable();
            $table->date('insurance_expiry')->nullable();
            // Portal access
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['last_name', 'first_name']);
            $table->index('phone');
        });

        Schema::create('patient_allergies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('allergen');
            $table->string('reaction')->nullable();
            $table->enum('severity', ['mild', 'moderate', 'severe'])->default('mild');
            $table->timestamps();
        });

        Schema::create('patient_chronic_diseases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('condition_name');
            $table->string('icd10_code', 10)->nullable();
            $table->date('diagnosed_at')->nullable();
            $table->string('managing_doctor')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('patient_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('document_type'); // id_card, insurance_card, referral_letter, etc.
            $table->string('file_path');
            $table->string('file_name');
            $table->string('description')->nullable();
            $table->unsignedBigInteger('uploaded_by')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_documents');
        Schema::dropIfExists('patient_chronic_diseases');
        Schema::dropIfExists('patient_allergies');
        Schema::dropIfExists('patients');
    }
};
