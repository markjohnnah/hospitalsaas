<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdmissionRequest;
use App\Http\Requests\UpdateAdmissionRequest;
use App\Models\Admission;
use App\Models\Bed;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Ward;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $admissions = Admission::with(['patient', 'admittingDoctor.user', 'bed', 'ward'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->ward_id, fn ($q, $id) => $q->where('ward_id', $id))
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->orderByDesc('admitted_at')
            ->paginate(25)
            ->withQueryString();

        $stats = [
            'admitted' => Admission::where('status', 'admitted')->count(),
            'discharged_today' => Admission::where('status', 'discharged')->whereDate('discharged_at', today())->count(),
            'available_beds' => Bed::where('status', 'available')->where('is_active', true)->count(),
            'total_beds' => Bed::where('is_active', true)->count(),
        ];

        return Inertia::render('inpatient/index', [
            'admissions' => $admissions,
            'stats' => $stats,
            'filters' => $request->only(['status', 'ward_id', 'patient_id']),
            'wards' => Ward::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'type']),
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'mrn']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('inpatient/create', [
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'mrn']),
            'doctors' => Doctor::with('user:id,name')->get()->map(fn ($d) => ['id' => $d->id, 'name' => $d->full_name]),
            'wards' => Ward::with(['availableBeds'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(StoreAdmissionRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['admission_number'] = $this->generateAdmissionNumber();

        $admission = DB::transaction(function () use ($validated) {
            $admission = Admission::create($validated);
            Bed::findOrFail($validated['bed_id'])->update(['status' => 'occupied']);

            return $admission;
        });

        return redirect()->route('inpatient.show', $admission)
            ->with('success', "Patient admitted. Admission #: {$admission->admission_number}");
    }

    public function show(Admission $admission): Response
    {
        $admission->load(['patient', 'admittingDoctor.user', 'bed', 'ward', 'medicalRecord']);

        return Inertia::render('inpatient/show', [
            'admission' => $admission,
        ]);
    }

    public function update(UpdateAdmissionRequest $request, Admission $admission): RedirectResponse
    {
        DB::transaction(function () use ($request, $admission) {
            $previousStatus = $admission->status;
            $admission->update($request->validated());

            if ($previousStatus === 'admitted' && $request->status !== 'admitted') {
                $admission->bed->update(['status' => 'available']);
            }
        });

        return redirect()->route('inpatient.show', $admission)
            ->with('success', 'Admission updated successfully.');
    }

    public function destroy(Admission $admission): RedirectResponse
    {
        return redirect()->route('inpatient.index')
            ->with('info', 'Admissions cannot be deleted. Update the status to discharge instead.');
    }

    private function generateAdmissionNumber(): string
    {
        $year = date('Y');
        $sequence = str_pad((string) (Admission::count() + 1), 5, '0', STR_PAD_LEFT);

        return "ADM-{$year}-{$sequence}";
    }
}
