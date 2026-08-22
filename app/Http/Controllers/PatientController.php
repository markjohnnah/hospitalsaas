<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        $patients = Patient::query()
            ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('mrn', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->when($request->gender, fn ($q, $gender) => $q->where('gender', $gender))
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('patients/index', [
            'patients' => $patients,
            'filters' => $request->only(['search', 'gender', 'active_only']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('patients/create');
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['mrn'] = $this->generateMrn();

        $patient = Patient::create($validated);

        return redirect()
            ->route('patients.show', $patient)
            ->with('success', "Patient {$patient->full_name} registered successfully. MRN: {$patient->mrn}");
    }

    public function show(Patient $patient): Response
    {
        $patient->load(['allergies', 'chronicDiseases', 'documents', 'appointments.doctor.user']);

        return Inertia::render('patients/show', [
            'patient' => $patient,
        ]);
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('patients/edit', [
            'patient' => $patient,
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): RedirectResponse
    {
        $patient->update($request->validated());

        return redirect()
            ->route('patients.show', $patient)
            ->with('success', 'Patient record updated successfully.');
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        $patient->delete();

        return redirect()
            ->route('patients.index')
            ->with('success', 'Patient record archived.');
    }

    private function generateMrn(): string
    {
        $prefix = 'MRN';
        $year = date('Y');
        $sequence = str_pad((string) (Patient::withTrashed()->count() + 1), 5, '0', STR_PAD_LEFT);

        return "{$prefix}-{$year}-{$sequence}";
    }
}
