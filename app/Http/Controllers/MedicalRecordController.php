<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMedicalRecordRequest;
use App\Http\Requests\UpdateMedicalRecordRequest;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\MedicalRecord;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MedicalRecordController extends Controller
{
    public function index(Request $request): Response
    {
        $records = MedicalRecord::with(['patient', 'doctor.user'])
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->doctor_id, fn ($q, $id) => $q->where('doctor_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->visit_type, fn ($q, $t) => $q->where('visit_type', $t))
            ->orderByDesc('visit_date')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('emr/index', [
            'records' => $records,
            'filters' => $request->only(['patient_id', 'doctor_id', 'status', 'visit_type']),
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'mrn']),
            'doctors' => Doctor::with('user:id,name')->get()->map(fn ($d) => ['id' => $d->id, 'name' => $d->full_name]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('emr/create', [
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'mrn']),
            'doctors' => Doctor::with('user:id,name')->get()->map(fn ($d) => ['id' => $d->id, 'name' => $d->full_name]),
            'appointments' => Appointment::with(['patient', 'doctor.user'])
                ->where('status', 'confirmed')
                ->orderByDesc('scheduled_at')
                ->limit(100)
                ->get(),
        ]);
    }

    public function store(StoreMedicalRecordRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['record_number'] = $this->generateRecordNumber();

        $record = DB::transaction(function () use ($validated, $request) {
            $record = MedicalRecord::create($validated);

            if ($request->filled('vitals')) {
                $vitalsData = $request->input('vitals');

                if (!empty($vitalsData['weight']) && !empty($vitalsData['height'])) {
                    $heightM = (float) $vitalsData['height'] / 100;
                    $vitalsData['bmi'] = round((float) $vitalsData['weight'] / ($heightM * $heightM), 2);
                }

                $record->vitals()->create([...$vitalsData, 'patient_id' => $record->patient_id]);
            }

            foreach ($request->input('diagnoses', []) as $diagnosis) {
                $record->diagnoses()->create([...$diagnosis, 'patient_id' => $record->patient_id]);
            }

            return $record;
        });

        return redirect()->route('emr.show', $record)
            ->with('success', "Medical record {$record->record_number} created successfully.");
    }

    public function show(MedicalRecord $medical_record): Response
    {
        $medical_record->load(['patient', 'doctor.user', 'appointment', 'vitals', 'diagnoses', 'prescriptions.items']);

        return Inertia::render('emr/show', [
            'record' => $medical_record,
        ]);
    }

    public function edit(MedicalRecord $medical_record): Response
    {
        $medical_record->load(['patient', 'doctor.user', 'vitals', 'diagnoses']);

        return Inertia::render('emr/edit', [
            'record' => $medical_record,
        ]);
    }

    public function update(UpdateMedicalRecordRequest $request, MedicalRecord $medical_record): RedirectResponse
    {
        $medical_record->update($request->validated());

        return redirect()->route('emr.show', $medical_record)
            ->with('success', 'Medical record updated successfully.');
    }

    public function destroy(MedicalRecord $medical_record): RedirectResponse
    {
        $medical_record->delete();

        return redirect()->route('emr.index')
            ->with('success', 'Medical record deleted.');
    }

    private function generateRecordNumber(): string
    {
        $year = date('Y');
        $sequence = str_pad((string) (MedicalRecord::withTrashed()->count() + 1), 5, '0', STR_PAD_LEFT);

        return "REC-{$year}-{$sequence}";
    }
}
