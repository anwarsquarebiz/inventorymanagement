<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\ProductCategorization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function edit(string $stock_no): Response
    {
        $stock = Stock::firstOrNew(['stock_no' => $stock_no]);
        
        // Ensure stock_no is set even if it's a new record
        if (!$stock->exists) {
            $stock->stock_no = $stock_no;
        }
        
        $productCategorizations = ProductCategorization::orderBy('name')->get();

        return Inertia::render('Stocks/Edit', [
            'stock' => $stock,
            'productCategorizations' => $productCategorizations,
        ]);
    }

    public function update(Request $request, string $stock_no)
    {
        \Log::info('Stock update request', [
            'stock_no' => $stock_no,
            'all_data' => $request->all(),
            'has_metal' => $request->has('metal'),
            'metal_value' => $request->input('metal'),
            'has_thumbnail' => $request->hasFile('thumbnail'),
        ]);

        $request->validate([
            'metal' => 'nullable|string',
            'products_used' => 'nullable|string|max:255',
            'product_categorization' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        $stock = Stock::firstOrNew(['stock_no' => $stock_no]);
        $stock->stock_no = $stock_no;

        // Handle metal field - store as JSON string
        $metalValue = $request->input('metal');
        if ($metalValue !== null && $metalValue !== '') {
            $metalValue = trim($metalValue);
            // Validate JSON if not empty
            if ($metalValue !== '') {
                $decoded = json_decode($metalValue, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    // Valid JSON, store as is
                    $stock->metal = $metalValue;
                } else {
                    // Invalid JSON, set to null
                    $stock->metal = null;
                }
            } else {
                $stock->metal = null;
            }
        } else {
            $stock->metal = null;
        }

        // Handle products_used field
        $productsUsedValue = $request->input('products_used');
        $stock->products_used = $productsUsedValue !== null && $productsUsedValue !== '' ? trim($productsUsedValue) : null;

        // Handle product_categorization field
        $productCategorizationValue = $request->input('product_categorization');
        $stock->product_categorization = $productCategorizationValue !== null && $productCategorizationValue !== '' ? trim($productCategorizationValue) : null;

        // Handle image upload
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if exists
            if ($stock->thumbnail && Storage::disk('public')->exists($stock->thumbnail)) {
                Storage::disk('public')->delete($stock->thumbnail);
            }
            
            $path = $request->file('thumbnail')->store('stocks/thumbnails', 'public');
            $stock->thumbnail = $path;
        }

        \Log::info('Stock before save', [
            'stock_no' => $stock->stock_no,
            'metal' => $stock->metal,
            'thumbnail' => $stock->thumbnail,
        ]);

        $stock->save();

        \Log::info('Stock after save', [
            'stock_no' => $stock->stock_no,
            'metal' => $stock->metal,
            'thumbnail' => $stock->thumbnail,
        ]);

        return redirect()->route('vouchers-groups.show', $stock_no)
            ->with('success', 'Stock updated successfully.');
    }
}
