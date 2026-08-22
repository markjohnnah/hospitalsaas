<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLabOrderRequest;
use App\Http\Requests\UpdateLabOrderRequest;
use App\Models\Doctor;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LabOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = LabOrder::with(['patient', 'doctor.user'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->priority, fn ($q, $p) => $q->where('priority', $p))
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->orderByDesc('ordered_date')
            ->paginate(25)
            ->withQueryString();

        $stats = [
            'total' => LabOrder::count(),
            'ordered' => LabOrder::where('status', 'ordered')->count(),
            'processing' => LabOrder::whereIn('status', ['sample_collected', 'processing'])->count(),
            'completed' => LabOrder::where('status', 'completed')->count(),
        ];

        return Inertia::render('lab/index', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['status', 'priority', 'patient_id']),
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'mrn']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('lab/create', [
            'patients' => Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'mrn']),
            'doctors' => Doctor::with('user:id,name')->get()->map(fn ($d) => ['id' => $d->id, 'name' => $d->full_name]),
            'lab_tests' => LabTest::where('is_active', true)->orderBy('category')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreLabOrderRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['order_number'] = $this->generateOrderNumber();

        $order = DB::transaction(function () use ($validated, $request) {
            $order = LabOrder::create($validated);

            foreach ($request->input('tests', []) as $testId) {
                LabResult::create([
                    'lab_order_id' => $order->id,
                    'lab_test_id' => $testId,
                ]);
            }

            return $order;
        });

        return redirect()->route('lab.show', $order)
            ->with('success', "Lab order {$order->order_number} created successfully.");
    }

    public function show(LabOrder $lab_order): Response
    {
        $lab_order->load(['patient', 'doctor.user', 'results.labTest']);

        return Inertia::render('lab/show', [
            'order' => $lab_order,
        ]);
    }

    public function update(UpdateLabOrderRequest $request, LabOrder $lab_order): RedirectResponse
    {
        DB::transaction(function () use ($request, $lab_order) {
            $lab_order->update($request->safe()->except('results'));

            foreach ($request->input('results', []) as $resultData) {
                if (!empty($resultData['lab_result_id'])) {
                    LabResult::where('id', $resultData['lab_result_id'])
                        ->update([
                            'result_value' => $resultData['result_value'] ?? null,
                            'flag' => $resultData['flag'] ?? 'normal',
                            'notes' => $resultData['notes'] ?? null,
                            'resulted_at' => now(),
                        ]);
                }
            }
        });

        return redirect()->route('lab.show', $lab_order)
            ->with('success', 'Lab order updated successfully.');
    }

    public function destroy(LabOrder $lab_order): RedirectResponse
    {
        $lab_order->update(['status' => 'cancelled']);

        return redirect()->route('lab.index')
            ->with('success', 'Lab order cancelled.');
    }

    private function generateOrderNumber(): string
    {
        $date = date('Ymd');
        $sequence = str_pad((string) (LabOrder::count() + 1), 4, '0', STR_PAD_LEFT);

        return "LAB-{$date}-{$sequence}";
    }
}
