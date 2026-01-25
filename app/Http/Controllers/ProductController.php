<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['creator', 'updater']);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $products = $query->orderBy('name', 'asc')->paginate(15);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Products/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:products,name',
        ]);

        $product = Product::create([
            'name' => $request->name,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        // Log audit
        AuditLog::log($product, 'CREATE', auth()->id(), null, $product->toArray());

        return redirect()->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): Response
    {
        $product->load(['creator', 'updater']);

        // Log view
        AuditLog::log($product, 'VIEW', auth()->id());

        return Inertia::render('Products/Show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product): Response
    {
        return Inertia::render('Products/Edit', [
            'product' => $product,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:products,name,' . $product->id,
        ]);

        $oldValues = $product->toArray();

        $product->update([
            'name' => $request->name,
            'updated_by' => auth()->id(),
        ]);

        // Log audit
        AuditLog::log($product, 'UPDATE', auth()->id(), $oldValues, $product->toArray());

        return redirect()->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Log audit before deletion
        AuditLog::log($product, 'DELETE', auth()->id(), $product->toArray());

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
