<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = InventoryItem::with('creator');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhere('stock_no', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('shape', 'like', "%{$search}%");
            });
        }

        if ($request->filled('location')) {
            $query->where('location', $request->get('location'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('shape')) {
            $query->where('shape', $request->get('shape'));
        }

        $items = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get filter options
        $locations = InventoryItem::distinct('location')->pluck('location')->sort()->values();
        $statuses = InventoryItem::distinct('status')->pluck('status')->sort()->values();
        $shapes = InventoryItem::distinct('shape')->pluck('shape')->sort()->values();

        // Get summary statistics
        $summary = [
            'total_items' => InventoryItem::count(),
            'by_location' => InventoryItem::getCountByLocation(),
            'by_status' => InventoryItem::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'total_weight' => InventoryItem::sum('weight'),
        ];

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'locations' => $locations,
            'statuses' => $statuses,
            'shapes' => $shapes,
            'summary' => $summary,
            'filters' => $request->only(['search', 'location', 'status', 'shape']),
        ]);
    }

    public function create(): Response
    {
        $shapes = InventoryItem::distinct('shape')
            ->whereNotNull('shape')
            ->pluck('shape')
            ->sort()
            ->values();

        return Inertia::render('Inventory/Create', [
            'shapes' => $shapes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'sku' => 'required|string|max:255|unique:inventory_items',
            'stock_no' => 'required|string|max:255|unique:inventory_items',
            'shape' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'weight' => 'nullable|numeric|min:0',
            'color' => 'nullable|string|max:255',
            'clarity' => 'nullable|string|max:255',
            'cut' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'status' => 'required|in:available,reserved,in_transit,in_workshop,returned,sold',
            'location' => 'required|in:shop,transit,workshop,returned',
        ]);

        $item = InventoryItem::create([
            'sku' => $request->sku,
            'stock_no' => $request->stock_no,
            'shape' => $request->shape,
            'description' => $request->description,
            'weight' => $request->weight,
            'color' => $request->color,
            'clarity' => $request->clarity,
            'cut' => $request->cut,
            'code' => $request->code,
            'remarks' => $request->remarks,
            'status' => $request->status,
            'location' => $request->location,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('inventory.index')
            ->with('success', 'Inventory item created successfully.');
    }

    public function show(InventoryItem $item): Response
    {
        $item->load('creator', 'voucherItems.voucher');

        return Inertia::render('Inventory/Show', [
            'item' => $item,
        ]);
    }

    public function edit(InventoryItem $item): Response
    {
        $shapes = InventoryItem::distinct('shape')
            ->whereNotNull('shape')
            ->pluck('shape')
            ->sort()
            ->values();

        return Inertia::render('Inventory/Edit', [
            'item' => $item,
            'shapes' => $shapes,
        ]);
    }

    public function update(Request $request, InventoryItem $item)
    {
        $request->validate([
            'sku' => 'required|string|max:255|unique:inventory_items,sku,' . $item->id,
            'stock_no' => 'required|string|max:255|unique:inventory_items,stock_no,' . $item->id,
            'shape' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'weight' => 'nullable|numeric|min:0',
            'color' => 'nullable|string|max:255',
            'clarity' => 'nullable|string|max:255',
            'cut' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'status' => 'required|in:available,reserved,in_transit,in_workshop,returned,sold',
            'location' => 'required|in:shop,transit,workshop,returned',
        ]);

        $oldData = $item->toArray();
        $item->update($request->only([
            'sku', 'stock_no', 'shape', 'description', 'weight',
            'color', 'clarity', 'cut', 'code', 'remarks', 'status', 'location'
        ]));

        return redirect()->route('inventory.index')
            ->with('success', 'Inventory item updated successfully.');
    }

    public function destroy(InventoryItem $item)
    {
        // Check if item is in any vouchers
        if ($item->voucherItems()->exists()) {
            return back()->withErrors(['item' => 'Cannot delete item that is part of a voucher.']);
        }

        $item->delete();

        return redirect()->route('inventory.index')
            ->with('success', 'Inventory item deleted successfully.');
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'item_ids' => 'required|array',
            'item_ids.*' => 'exists:inventory_items,id',
            'status' => 'nullable|in:available,reserved,in_transit,in_workshop,returned,sold',
            'location' => 'nullable|in:shop,transit,workshop,returned',
        ]);

        $updateData = [];
        if ($request->filled('status')) {
            $updateData['status'] = $request->status;
        }
        if ($request->filled('location')) {
            $updateData['location'] = $request->location;
        }

        if (!empty($updateData)) {
            InventoryItem::whereIn('id', $request->item_ids)->update($updateData);
        }

        return back()->with('success', 'Items updated successfully.');
    }
}
