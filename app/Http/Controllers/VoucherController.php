<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Shape;
use App\Models\Product;
use App\Models\Voucher;
use App\Models\VoucherActivity;
use App\Models\VoucherItem;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Dompdf\Dompdf;
use Dompdf\Options;

class VoucherController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Voucher::with(['personInCharge', 'creator', 'items.product']);

        if ($request->user()->hasRole('workshop_staff')) {
            $query->where('status', 'in_transit');
        }

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('voucher_no', 'like', "%{$search}%")
                  ->orWhere('stock_no', 'like', "%{$search}%")
                  ->orWhereHas('personInCharge', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('person_in_charge')) {
            $query->where('person_in_charge', $request->get('person_in_charge'));
        }

        // Date Range Filters - Apply OR logic: show vouchers where EITHER date_given OR date_delivery falls within their respective ranges
        $hasDateGivenFilter = $request->filled('date_given_from') || $request->filled('date_given_to');
        $hasDateDeliveryFilter = $request->filled('date_delivery_from') || $request->filled('date_delivery_to');

        if ($hasDateGivenFilter || $hasDateDeliveryFilter) {
            $query->where(function ($q) use ($request, $hasDateGivenFilter, $hasDateDeliveryFilter) {
                $hasFirstCondition = false;

                // Date Given Range
                if ($hasDateGivenFilter) {
                    if ($request->filled('date_given_from') && $request->filled('date_given_to')) {
                        $q->whereBetween('date_given', [$request->get('date_given_from'), $request->get('date_given_to')]);
                    } elseif ($request->filled('date_given_from')) {
                        $q->where('date_given', '>=', $request->get('date_given_from'));
                    } elseif ($request->filled('date_given_to')) {
                        $q->where('date_given', '<=', $request->get('date_given_to'));
                    }
                    $hasFirstCondition = true;
                }

                // Date Delivery Range (OR condition if both filters are set)
                if ($hasDateDeliveryFilter) {
                    if ($hasFirstCondition) {
                        // Use OR if both filters are set
                        if ($request->filled('date_delivery_from') && $request->filled('date_delivery_to')) {
                            $q->orWhereBetween('date_delivery', [$request->get('date_delivery_from'), $request->get('date_delivery_to')]);
                        } elseif ($request->filled('date_delivery_from')) {
                            $q->orWhere('date_delivery', '>=', $request->get('date_delivery_from'));
                        } elseif ($request->filled('date_delivery_to')) {
                            $q->orWhere('date_delivery', '<=', $request->get('date_delivery_to'));
                        }
                    } else {
                        // Use WHERE if only this filter is set
                        if ($request->filled('date_delivery_from') && $request->filled('date_delivery_to')) {
                            $q->whereBetween('date_delivery', [$request->get('date_delivery_from'), $request->get('date_delivery_to')]);
                        } elseif ($request->filled('date_delivery_from')) {
                            $q->where('date_delivery', '>=', $request->get('date_delivery_from'));
                        } elseif ($request->filled('date_delivery_to')) {
                            $q->where('date_delivery', '<=', $request->get('date_delivery_to'));
                        }
                    }
                }
            });
        }

        $vouchers = $query->orderBy('created_at', 'desc')->paginate(15)->appends($request->only(['search', 'status', 'person_in_charge', 'date_given_from', 'date_given_to', 'date_delivery_from', 'date_delivery_to']));

        // Get users for filter dropdown
        $users = \App\Models\User::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);        

        return Inertia::render('Vouchers/Index', [
            'vouchers' => $vouchers,
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'person_in_charge', 'date_given_from', 'date_given_to', 'date_delivery_from', 'date_delivery_to']),
        ]);
    }

    public function create(): Response
    {
        $users = \App\Models\User::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $shapes = Shape::with('product')
            ->orderBy('name')
            ->get()
            ->map(function ($shape) {
                return [
                    'id' => (int) $shape->id,
                    'name' => (string) $shape->name,
                    'product_id' => $shape->product_id ? (int) $shape->product_id : null,
                ];
            })
            ->values()
            ->toArray();

        $products = Product::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Vouchers/Create', [
            'users' => $users,
            'shapes' => $shapes,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'stock_no' => 'required|string|max:255',
            'date_given' => 'required|date',
            'date_delivery' => 'required|date',
            'person_in_charge' => 'required|exists:users,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.shape' => 'required|string',
            'items.*.pcs' => 'required|integer|min:1',
            'items.*.weight' => 'required|numeric|min:0',
            'items.*.code' => 'nullable|string',
            'items.*.remarks' => 'nullable|string',
            'items.*.temporary_return' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($request) {
            // Create voucher
            $voucher = Voucher::create([
                'stock_no' => $request->stock_no,
                'date_given' => $request->date_given,
                'date_delivery' => $request->date_delivery,
                'person_in_charge' => $request->person_in_charge,
                'created_by' => auth()->id(),
                'notes' => $request->notes,
            ]);

            // Create voucher items
            foreach ($request->items as $item) {
                // Try to find inventory item by code if provided
                $inventoryItemId = null;
                if (!empty($item['code'])) {
                    $inventoryItem = InventoryItem::where('code', $item['code'])->first();
                    if ($inventoryItem) {
                        $inventoryItemId = $inventoryItem->id;
                    }
                }

                VoucherItem::create([
                    'voucher_id' => $voucher->id,
                    'inventory_item_id' => $inventoryItemId,
                    'product_id' => $item['product_id'] ?? null,
                    'shape' => $item['shape'],
                    'pcs' => $item['pcs'],
                    'weight' => $item['weight'],
                    'code' => $item['code'] ?? null,
                    'remarks' => $item['remarks'] ?? null,
                    'temporary_return' => $item['temporary_return'] ?? false,
                ]);
            }

            // Log activity
            VoucherActivity::create([
                'voucher_id' => $voucher->id,
                'action' => 'created',
                'user_id' => auth()->id(),
                'description' => 'Voucher created with ' . count($request->items) . ' items',
                'timestamp' => now(),
            ]);

            // Log audit
            AuditLog::log($voucher, 'CREATE', auth()->id(), null, $voucher->toArray());
        });

        return redirect()->route('vouchers.index')
            ->with('success', 'Voucher created successfully.');
    }

    public function edit(Voucher $voucher): Response
    {
        $this->authorize('update', $voucher);

        $voucher->load([
            'items.product',
            'personInCharge',
        ]);

        $users = \App\Models\User::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $shapes = Shape::with('product')
            ->orderBy('name')
            ->get()
            ->map(function ($shape) {
                return [
                    'id' => (int) $shape->id,
                    'name' => (string) $shape->name,
                    'product_id' => $shape->product_id ? (int) $shape->product_id : null,
                ];
            })
            ->values()
            ->toArray();

        $products = Product::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Vouchers/Edit', [
            'voucher' => $voucher,
            'users' => $users,
            'shapes' => $shapes,
            'products' => $products,
        ]);
    }

    public function update(Request $request, Voucher $voucher)
    {
        $this->authorize('update', $voucher);

        $request->validate([
            'stock_no' => 'required|string|max:255',
            'date_given' => 'required|date',
            'date_delivery' => 'required|date',
            'person_in_charge' => 'required|exists:users,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.shape' => 'required|string',
            'items.*.pcs' => 'required|integer|min:1',
            'items.*.weight' => 'required|numeric|min:0',
            'items.*.code' => 'nullable|string',
            'items.*.remarks' => 'nullable|string',
            'items.*.temporary_return' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($request, $voucher) {
            $oldValues = $voucher->toArray();

            // Update voucher header
            $voucher->update([
                'stock_no' => $request->stock_no,
                'date_given' => $request->date_given,
                'date_delivery' => $request->date_delivery,
                'person_in_charge' => $request->person_in_charge,
                'notes' => $request->notes,
            ]);

            // Replace items (simple and safe approach)
            $voucher->items()->delete();

            foreach ($request->items as $item) {
                $inventoryItemId = null;
                if (!empty($item['code'])) {
                    $inventoryItem = InventoryItem::where('code', $item['code'])->first();
                    if ($inventoryItem) {
                        $inventoryItemId = $inventoryItem->id;
                    }
                }

                VoucherItem::create([
                    'voucher_id' => $voucher->id,
                    'inventory_item_id' => $inventoryItemId,
                    'product_id' => $item['product_id'] ?? null,
                    'shape' => $item['shape'],
                    'pcs' => $item['pcs'],
                    'weight' => $item['weight'],
                    'code' => $item['code'] ?? null,
                    'remarks' => $item['remarks'] ?? null,
                    'temporary_return' => $item['temporary_return'] ?? false,
                ]);
            }

            // Log audit
            AuditLog::log($voucher, 'UPDATE', auth()->id(), $oldValues, $voucher->toArray());
        });

        return redirect()->route('vouchers.show', $voucher->id)
            ->with('success', 'Voucher updated successfully.');
    }

    public function show(Voucher $voucher): Response
    {
        $voucher->load([
            'personInCharge',
            'creator',
            'approver',
            'items.product',
            'activities.user'
        ]);

        // Log view
        AuditLog::log($voucher, 'VIEW', auth()->id());

        return Inertia::render('Vouchers/Show', [
            'voucher' => $voucher,
        ]);
    }

    public function approve(Voucher $voucher)
    {
        $this->authorize('approve', $voucher);

        $voucher->update([
            'status' => 'in_transit',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        // Log activity
        VoucherActivity::create([
            'voucher_id' => $voucher->id,
            'action' => 'approved',
            'user_id' => auth()->id(),
            'description' => 'Voucher approved for workshop processing',
            'timestamp' => now(),
        ]);

        // Log audit
        AuditLog::log($voucher, 'APPROVE', auth()->id(), ['status' => 'pending'], ['status' => 'approved']);

        return back()->with('success', 'Voucher approved successfully.');
    }

    public function sendToWorkshop(Voucher $voucher)
    {
        $this->authorize('update', $voucher);

        if ($voucher->status !== 'approved') {
            return back()->withErrors(['status' => 'Only approved vouchers can be sent to workshop.']);
        }

        DB::transaction(function () use ($voucher) {
            $voucher->update(['status' => 'in_transit']);

            // Update inventory items location to transit
            foreach ($voucher->items as $item) {
                // In a real system, you'd update actual inventory items
                // For now, we'll just log the activity
            }

            // Log activity
            VoucherActivity::create([
                'voucher_id' => $voucher->id,
                'action' => 'sent_to_workshop',
                'user_id' => auth()->id(),
                'description' => 'Stones sent to workshop for processing',
                'timestamp' => now(),
            ]);

            // Log audit
            AuditLog::log($voucher, 'UPDATE', auth()->id(), ['status' => 'approved'], ['status' => 'in_transit']);
        });

        return back()->with('success', 'Voucher sent to workshop successfully.');
    }

    public function receive(Voucher $voucher)
    {
        $this->authorize('update', $voucher);

        if (!in_array($voucher->status, ['in_transit', 'approved'])) {
            return back()->withErrors(['status' => 'Invalid status for receiving.']);
        }

        DB::transaction(function () use ($voucher) {
            $voucher->update(['status' => 'received']);

            // Log activity
            VoucherActivity::create([
                'voucher_id' => $voucher->id,
                'action' => 'received_at_workshop',
                'user_id' => auth()->id(),
                'description' => 'Stones received at workshop',
                'timestamp' => now(),
            ]);

            // Log audit
            AuditLog::log($voucher, 'UPDATE', auth()->id(), ['status' => $voucher->status], ['status' => 'received']);
        });

        return back()->with('success', 'Voucher received successfully.');
    }

    public function return(Voucher $voucher)
    {
        $this->authorize('update', $voucher);

        if ($voucher->status !== 'received') {
            return back()->withErrors(['status' => 'Only received vouchers can be returned.']);
        }

        DB::transaction(function () use ($voucher) {
            $voucher->update(['status' => 'returned']);

            // Update inventory items location back to shop
            foreach ($voucher->items as $item) {
                // In a real system, you'd update actual inventory items
                // For now, we'll just log the activity
            }

            // Log activity
            VoucherActivity::create([
                'voucher_id' => $voucher->id,
                'action' => 'returned',
                'user_id' => auth()->id(),
                'description' => 'Stones returned from workshop',
                'timestamp' => now(),
            ]);

            // Log audit
            AuditLog::log($voucher, 'UPDATE', auth()->id(), ['status' => 'received'], ['status' => 'returned']);
        });

        return back()->with('success', 'Voucher returned successfully.');
    }

    public function destroy(Voucher $voucher, Request $request)    
    {
        $this->authorize('delete', $voucher);

        // if (!in_array($voucher->status, ['pending'])) {
        //     return back()->withErrors(['status' => 'Only pending vouchers can be deleted.']);
        // }

        DB::transaction(function () use ($voucher) {
            // Log audit before deletion
            AuditLog::log($voucher, 'DELETE', auth()->id(), $voucher->toArray());

            $voucher->delete();
        });

        return redirect()->route('vouchers.index')
            ->with('success', 'Voucher deleted successfully.');
    }

    public function print(Voucher $voucher)
    {
        $voucher->load([
            'personInCharge',
            'creator',
            'approver',
            'items.product',
            'activities.user'
        ]);

        return view('vouchers.print', compact('voucher'));
    }

    public function exportPdf(Voucher $voucher)
    {
        $voucher->load([
            'personInCharge',
            'creator',
            'approver',
            'items.product',
            'activities.user'
        ]);

        // Configure Dompdf
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $options->set('defaultFont', 'Arial');

        $dompdf = new Dompdf($options);

        // Generate HTML for PDF
        $html = view('vouchers.pdf', compact('voucher'))->render();

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        // Log audit
        AuditLog::log($voucher, 'EXPORT_PDF', auth()->id());

        return response()->streamDownload(function () use ($dompdf) {
            echo $dompdf->output();
        }, "voucher-{$voucher->voucher_no}.pdf", [
            'Content-Type' => 'application/pdf',
        ]);
    }
}
