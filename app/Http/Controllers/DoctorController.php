<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDoctorRequest;
use App\Http\Requests\UpdateDoctorRequest;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Stancl\Tenancy\Facades\Tenancy;

class DoctorController extends Controller
{
    public function index(Request $request): Response
    {
        $doctors = Doctor::query()
            ->with(['user', 'department', 'specialization'])
            ->when($request->search, fn ($q, $search) => $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")))
            ->when($request->department_id, fn ($q, $id) => $q->where('department_id', $id))
            ->when($request->specialization_id, fn ($q, $id) => $q->where('specialization_id', $id))
            ->paginate(20)
            ->withQueryString();

        $departments = Department::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $specializations = Specialization::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('doctors/index', [
            'doctors' => $doctors,
            'departments' => $departments,
            'specializations' => $specializations,
            'filters' => $request->only(['search', 'department_id', 'specialization_id']),
        ]);
    }

    public function create(): Response
    {
        $departments = Department::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $specializations = Specialization::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('doctors/create', [
            'departments' => $departments,
            'specializations' => $specializations,
        ]);
    }

    public function store(StoreDoctorRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $doctor = DB::transaction(function () use ($validated) {
            $user = Tenancy::central(fn () => User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'role' => 'doctor',
                'tenant_id' => auth()->user()->tenant_id,
                'is_active' => true,
            ]));

            $doctor = Doctor::create([
                'user_id' => $user->id,
                'department_id' => $validated['department_id'] ?? null,
                'specialization_id' => $validated['specialization_id'] ?? null,
                'license_number' => $validated['license_number'] ?? null,
                'consultation_fee' => $validated['consultation_fee'] ?? 0,
                'bio' => $validated['bio'] ?? null,
                'qualification' => $validated['qualification'] ?? null,
                'experience_years' => $validated['experience_years'] ?? 0,
            ]);

            if (! empty($validated['schedules'])) {
                foreach ($validated['schedules'] as $schedule) {
                    $doctor->schedules()->create($schedule);
                }
            }

            return $doctor;
        });

        return redirect()
            ->route('doctors.show', $doctor)
            ->with('success', 'Doctor profile created successfully.');
    }

    public function show(Doctor $doctor): Response
    {
        $doctor->load(['user', 'department', 'specialization', 'schedules',
            'appointments' => fn ($q) => $q->with('patient')->latest('scheduled_at')->limit(10),
        ]);

        return Inertia::render('doctors/show', [
            'doctor' => $doctor,
        ]);
    }

    public function edit(Doctor $doctor): Response
    {
        $doctor->load(['user', 'schedules']);
        $departments = Department::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $specializations = Specialization::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('doctors/edit', [
            'doctor' => $doctor,
            'departments' => $departments,
            'specializations' => $specializations,
        ]);
    }

    public function update(UpdateDoctorRequest $request, Doctor $doctor): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $doctor) {
            $doctor->user->update([
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
            ]);

            $doctor->update([
                'department_id' => $validated['department_id'] ?? null,
                'specialization_id' => $validated['specialization_id'] ?? null,
                'license_number' => $validated['license_number'] ?? null,
                'consultation_fee' => $validated['consultation_fee'] ?? $doctor->consultation_fee,
                'bio' => $validated['bio'] ?? null,
                'qualification' => $validated['qualification'] ?? null,
                'experience_years' => $validated['experience_years'] ?? $doctor->experience_years,
                'is_available' => $validated['is_available'] ?? $doctor->is_available,
            ]);

            if (isset($validated['schedules'])) {
                $doctor->schedules()->delete();
                foreach ($validated['schedules'] as $schedule) {
                    $doctor->schedules()->create($schedule);
                }
            }
        });

        return redirect()
            ->route('doctors.show', $doctor)
            ->with('success', 'Doctor profile updated successfully.');
    }

    public function destroy(Doctor $doctor): RedirectResponse
    {
        $doctor->update(['is_available' => false]);

        return redirect()
            ->route('doctors.index')
            ->with('success', 'Doctor deactivated.');
    }
}
