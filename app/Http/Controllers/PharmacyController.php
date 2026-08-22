<?php

namespace App\Http\Controllers;

use App\Models\DispensingRecord;
use App\Models\Medication;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PharmacyController extends Controller
{
    public function index(Request $request): Response
    {
        $prescriptions = Prescription::with(['patient', 'doctor.user', 'items'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('prescribed_date')
            ->paginate(25)
            ->withQueryString();

        $medications = Medication::where('is_active', true)
            ->orderBy('brand_name')
            ->get();

        $stats = [
            'active_prescriptions' => Prescription::where('status', 'active')->count(),
            'dispensed_today' => DispensingRecord::whereDate('dispensed_at', today())->count(),
            'low_stock' => Medication::whereColumn('quantity_in_stock', '<=', 'reorder_level')->count(),
            'total_medications' => Medication::where('is_active', true)->count(),
        ];

        return Inertia::render('pharmacy/index', [
            'prescriptions' => $prescriptions,
            'medications' => $medications,
            'stats' => $stats,
            'filters' => $request->only(['status']),
        ]);
    }
}
