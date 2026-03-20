<?php

namespace App\Http\Controllers;

use App\Models\MetalVoucher;
use App\Models\MetalVoucherActivity;
use App\Models\MetalVoucherItem;
use App\Models\Metal;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MetalVoucherController extends Controller
{
    public function index(Request $request): Response
    {
        $query = MetalVoucher::with(['creator', 'items.metal']);

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('voucher_no', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('date_given_from') || $request->filled('date_given_to')) {
            if ($request->filled('date_given_from') && $request->filled('date_given_to')) {
                $query->whereBetween('date_given', [$request->get('date_given_from'), $request->get('date_given_to')]);
            } elseif ($request->filled('date_given_from')) {
                $query->where('date_given', '>=', $request->get('date_given_from'));
            } else {
                $query->where('date_given', '<=', $request->get('date_given_to'));
            }
        }

        $metalVouchers = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->appends($request->only(['search', 'status', 'date_given_from', 'date_given_to']));

        return Inertia::render('MetalVouchers/Index', [
            'metalVouchers' => $metalVouchers,
            'filters' => $request->only(['search', 'status', 'date_given_from', 'date_given_to']),
        ]);
    }

    public function create(): Response
    {
        $metals = Metal::orderBy('name')->get(['id', 'name']);

        return Inertia::render('MetalVouchers/Create', [
            'metals' => $metals,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date_given' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.metal_id' => 'required|exists:metals,id',
            'items.*.weight' => 'required|numeric|min:0',
            'items.*.remarks' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $metalVoucher = MetalVoucher::create([
                'date_given' => $request->date_given,
                'created_by' => auth()->id(),
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                MetalVoucherItem::create([
                    'metal_voucher_id' => $metalVoucher->id,
                    'metal_id' => $item['metal_id'],
                    'weight' => $item['weight'],
                    'remarks' => $item['remarks'] ?? null,
                ]);
            }

            MetalVoucherActivity::create([
                'metal_voucher_id' => $metalVoucher->id,
                'action' => 'created',
                'user_id' => auth()->id(),
                'description' => 'Metal voucher created with ' . count($request->items) . ' items',
                'timestamp' => now(),
            ]);

            AuditLog::log($metalVoucher, 'CREATE', auth()->id(), null, $metalVoucher->toArray());
        });

        return redirect()->route('metal-vouchers.index')
            ->with('success', 'Metal voucher created successfully.');
    }

    public function show(Request $request, MetalVoucher $metal_voucher): Response
    {
        $metal_voucher->load([
            'creator',
            'approver',
            'items.metal',
            'activities.user',
        ]);

        AuditLog::log($metal_voucher, 'VIEW', auth()->id());

        $backPage = $request->integer('page', 1);
        $backSearch = trim((string) $request->get('search', ''));

        return Inertia::render('MetalVouchers/Show', [
            'metalVoucher' => $metal_voucher,
            'backPage' => $backPage > 1 ? $backPage : null,
            'backSearch' => $backSearch !== '' ? $backSearch : null,
        ]);
    }

    public function edit(MetalVoucher $metal_voucher): Response
    {
        $metal_voucher->load('items.metal');

        $metals = Metal::orderBy('name')->get(['id', 'name']);

        return Inertia::render('MetalVouchers/Edit', [
            'metalVoucher' => $metal_voucher,
            'metals' => $metals,
        ]);
    }

    public function update(Request $request, MetalVoucher $metal_voucher)
    {
        $request->validate([
            'date_given' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.metal_id' => 'required|exists:metals,id',
            'items.*.weight' => 'required|numeric|min:0',
            'items.*.remarks' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $metal_voucher) {
            $oldValues = $metal_voucher->toArray();

            $metal_voucher->update([
                'date_given' => $request->date_given,
                'notes' => $request->notes,
            ]);

            $metal_voucher->items()->delete();

            foreach ($request->items as $item) {
                MetalVoucherItem::create([
                    'metal_voucher_id' => $metal_voucher->id,
                    'metal_id' => $item['metal_id'],
                    'weight' => $item['weight'],
                    'remarks' => $item['remarks'] ?? null,
                ]);
            }

            AuditLog::log($metal_voucher, 'UPDATE', auth()->id(), $oldValues, $metal_voucher->toArray());
        });

        return redirect()->route('metal-vouchers.show', $metal_voucher->id)
            ->with('success', 'Metal voucher updated successfully.');
    }

    public function destroy(MetalVoucher $metal_voucher)
    {
        DB::transaction(function () use ($metal_voucher) {
            AuditLog::log($metal_voucher, 'DELETE', auth()->id(), $metal_voucher->toArray());
            $metal_voucher->delete();
        });

        return redirect()->route('metal-vouchers.index')
            ->with('success', 'Metal voucher deleted successfully.');
    }

    public function verify(MetalVoucher $metal_voucher)
    {
        $metal_voucher->update(['status' => MetalVoucher::STATUS_IN_TRANSIT]);

        MetalVoucherActivity::create([
            'metal_voucher_id' => $metal_voucher->id,
            'action' => 'verified',
            'user_id' => auth()->id(),
            'description' => 'Metal voucher verified',
            'timestamp' => now(),
        ]);

        return back()->with('success', 'Metal voucher verified successfully.');
    }

    public function approve(MetalVoucher $metal_voucher)
    {
        $metal_voucher->update([
            'status' => MetalVoucher::STATUS_IN_USE,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        MetalVoucherActivity::create([
            'metal_voucher_id' => $metal_voucher->id,
            'action' => 'approved',
            'user_id' => auth()->id(),
            'description' => 'Metal voucher approved',
            'timestamp' => now(),
        ]);

        return back()->with('success', 'Metal voucher approved successfully.');
    }

    public function receive(MetalVoucher $metal_voucher)
    {
        if ($metal_voucher->status !== MetalVoucher::STATUS_IN_TRANSIT) {
            return back()->withErrors(['status' => 'Invalid status for receiving.']);
        }

        $metal_voucher->update(['status' => MetalVoucher::STATUS_UNDER_REVIEW]);

        MetalVoucherActivity::create([
            'metal_voucher_id' => $metal_voucher->id,
            'action' => 'received_at_workshop',
            'user_id' => auth()->id(),
            'description' => 'Metal received at workshop',
            'timestamp' => now(),
        ]);

        return back()->with('success', 'Metal voucher received successfully.');
    }

    public function reject(MetalVoucher $metal_voucher)
    {
        $metal_voucher->update(['status' => MetalVoucher::STATUS_REJECTED]);

        MetalVoucherActivity::create([
            'metal_voucher_id' => $metal_voucher->id,
            'action' => 'rejected',
            'user_id' => auth()->id(),
            'description' => 'Metal voucher rejected',
            'timestamp' => now(),
        ]);

        return back()->with('success', 'Metal voucher rejected successfully.');
    }

    public function complete(MetalVoucher $metal_voucher)
    {
        if ($metal_voucher->status !== MetalVoucher::STATUS_IN_USE) {
            return back()->withErrors(['status' => 'Only metal vouchers in use can be completed.']);
        }

        $metal_voucher->update(['status' => MetalVoucher::STATUS_COMPLETED]);

        MetalVoucherActivity::create([
            'metal_voucher_id' => $metal_voucher->id,
            'action' => 'completed',
            'user_id' => auth()->id(),
            'description' => 'Metal voucher completed',
            'timestamp' => now(),
        ]);

        return back()->with('success', 'Metal voucher completed successfully.');
    }
    
}
