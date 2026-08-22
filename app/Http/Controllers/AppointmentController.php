<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        $appointments = Appointment::query()
            ->with(['patient', 'doctor.user', 'department'])
            ->when($request->search, function ($q, $search) {
                $q->whereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%"))
                    ->orWhere('appointment_number', 'like', "%{$search}%");
            })
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->doctor_id, fn ($q, $id) => $q->where('doctor_id', $id))
            ->when($request->date, fn ($q, $date) => $q->whereDate('scheduled_at', $date))
            ->orderBy('scheduled_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        $doctors = Doctor::with('user')->get()->map(fn ($d) => [
            'id' => $d->id,
            'name' => $d->full_name,
        ]);

        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
            'doctors' => $doctors,
            'filters' => $request->only(['search', 'status', 'doctor_id', 'date']),
            'stats' => [
                'today' => Appointment::whereDate('scheduled_at', today())->count(),
                'pending' => Appointment::where('status', 'pending')->count(),
                'confirmed' => Appointment::where('status', 'confirmed')->count(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $patients = Patient::where('is_active', true)
            ->orderBy('last_name')
            ->get(['id', 'mrn', 'first_name', 'last_name']);

        $doctors = Doctor::with(['user', 'specialization', 'schedules'])
            ->where('is_available', true)
            ->get();

        return Inertia::render('appointments/create', [
            'patients' => $patients,
            'doctors' => $doctors,
            'defaultPatientId' => $request->integer('patient_id') ?: null,
            'defaultDoctorId' => $request->integer('doctor_id') ?: null,
        ]);
    }

    public function store(StoreAppointmentRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['appointment_number'] = $this->generateAppointmentNumber();
        $validated['booked_by'] = auth()->id();
        $validated['status'] = 'pending';

        $appointment = Appointment::create($validated);
        $appointment->load(['patient', 'doctor.user']);

        return redirect()
            ->route('appointments.show', $appointment)
            ->with('success', "Appointment {$appointment->appointment_number} booked successfully.");
    }

    public function show(Appointment $appointment): Response
    {
        $appointment->load(['patient', 'doctor.user', 'doctor.specialization', 'department', 'bookedBy']);

        return Inertia::render('appointments/show', [
            'appointment' => $appointment,
        ]);
    }

    public function edit(Appointment $appointment): Response
    {
        $appointment->load(['patient', 'doctor', 'department']);

        return Inertia::render('appointments/edit', [
            'appointment' => $appointment,
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): RedirectResponse
    {
        $validated = $request->validated();

        if (isset($validated['status'])) {
            if ($validated['status'] === 'confirmed' && $appointment->isPending()) {
                $validated['confirmed_at'] = now();
            }
            if ($validated['status'] === 'cancelled') {
                $validated['cancelled_at'] = now();
            }
        }

        $appointment->update($validated);

        return redirect()
            ->route('appointments.show', $appointment)
            ->with('success', 'Appointment updated.');
    }

    public function destroy(Appointment $appointment): RedirectResponse
    {
        $appointment->update([
            'status' => 'cancelled',
            'cancellation_reason' => 'Cancelled by staff.',
            'cancelled_at' => now(),
        ]);

        return redirect()
            ->route('appointments.index')
            ->with('success', 'Appointment cancelled.');
    }

    private function generateAppointmentNumber(): string
    {
        $prefix = 'APT';
        $date = date('Ymd');
        $sequence = str_pad((string) (Appointment::whereDate('created_at', today())->count() + 1), 4, '0', STR_PAD_LEFT);

        return "{$prefix}-{$date}-{$sequence}";
    }
}
