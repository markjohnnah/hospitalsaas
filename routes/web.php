<?php

use App\Enums\Role;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\TenantController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\LabOrderController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\RadiologyOrderController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\TenantBillingController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Super Admin: hospital management (no tenancy initialization needed)
Route::middleware(['auth', 'verified', 'role:'.Role::SuperAdmin->value])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('tenants', TenantController::class);
        Route::resource('users', AdminUserController::class)->only(['index', 'destroy']);

        // Billing
        Route::prefix('billing')->name('billing.')->group(function () {
            Route::resource('plans', PlanController::class);
            Route::resource('invoices', InvoiceController::class);
            Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment'])->name('invoices.payments.store');
            Route::patch('invoices/{invoice}/status', [InvoiceController::class, 'updateStatus'])->name('invoices.status');
            Route::resource('subscriptions', SubscriptionController::class)->only(['index', 'update']);
            Route::post('subscriptions/{tenant}/extend-trial', [SubscriptionController::class, 'extendTrial'])->name('subscriptions.extend-trial');
        });
    });

// All authenticated users: dashboard and tenant-scoped HMS modules
Route::middleware(['auth', 'verified', 'tenant'])
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Phase 2: Patient, Doctor, Appointment management
        Route::resource('patients', PatientController::class);
        Route::resource('doctors', DoctorController::class);
        Route::resource('appointments', AppointmentController::class);

        // Staff management (hospital admin only)
        Route::resource('staff', StaffController::class);

        // Tenant billing
        Route::get('/billing', [TenantBillingController::class, 'index'])->name('billing.dashboard');
        Route::get('/billing/{invoice}', [TenantBillingController::class, 'show'])->name('billing.show');

        // Reports
        Route::get('/reports', [ReportsController::class, 'index'])->name('reports.index');

        // Phase 3: EMR, Lab, Pharmacy, Radiology, Inpatient
        Route::resource('emr', MedicalRecordController::class)
            ->parameters(['emr' => 'medical_record']);
        Route::resource('lab', LabOrderController::class)
            ->parameters(['lab' => 'lab_order']);
        Route::resource('radiology', RadiologyOrderController::class)
            ->parameters(['radiology' => 'radiology_order']);
        Route::resource('inpatient', AdmissionController::class)
            ->parameters(['inpatient' => 'admission']);
        Route::get('/pharmacy', [PharmacyController::class, 'index'])->name('pharmacy.index');
    });

require __DIR__.'/settings.php';
