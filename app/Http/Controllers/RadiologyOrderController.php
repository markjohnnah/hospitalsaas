<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRadiologyOrderRequest;
use App\Http\Requests\UpdateRadiologyOrderRequest;
use App\Models\Doctor;
use App\Models\ImagingType;
use App\Models\Patient;
use App\Models\RadiologyOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RadiologyOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = RadiologyOrder::with(['patient', 'doctor.user', 'imagingType'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->priority, fn ($q, $p) => $q->where('priority', $p))
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->orderByDesc('ordered_date')
            ->paginate(25)
            ->withQueryString();

        $stats = [
            'total' => RadiologyOrder::count(),
            'ordered' => RadiologyOrder::where('status', 'ordered')->count(),
            'in_progress' => RadiologyOrder::whereIn('status', ['scheduled', 'in_progress'])->count(),
            'completed' => RadiologyOrder::where('status', 'completed')->count(),
        ];

        return Inertia::render('radiology/index', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['status', 'priority', 'patient_id']),
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'mrn']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('radiology/create', [
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'mrn']),
            'doctors' => Doctor::with('user:id,name')->get()->map(fn ($d) => ['id' => $d->id, 'name' => $d->full_name]),
            'imaging_types' => ImagingType::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(StoreRadiologyOrderRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['order_number'] = $this->generateOrderNumber();

        $order = RadiologyOrder::create($validated);

        return redirect()->route('radiology.show', $order)
            ->with('success', "Radiology order {$order->order_number} created successfully.");
    }

    public function show(RadiologyOrder $radiology_order): Response
    {
        $radiology_order->load(['patient', 'doctor.user', 'imagingType']);

        return Inertia::render('radiology/show', [
            'order' => $radiology_order,
        ]);
    }

    public function update(UpdateRadiologyOrderRequest $request, RadiologyOrder $radiology_order): RedirectResponse
    {
        $radiology_order->update($request->validated());

        return redirect()->route('radiology.show', $radiology_order)
            ->with('success', 'Radiology order updated successfully.');
    }

    public function destroy(RadiologyOrder $radiology_order): RedirectResponse
    {
        $radiology_order->update(['status' => 'cancelled']);

        return redirect()->route('radiology.index')
            ->with('success', 'Radiology order cancelled.');
    }

    private function generateOrderNumber(): string
    {
        $date = date('Ymd');
        $sequence = str_pad((string) (RadiologyOrder::count() + 1), 4, '0', STR_PAD_LEFT);

        return "RAD-{$date}-{$sequence}";
    }
}
