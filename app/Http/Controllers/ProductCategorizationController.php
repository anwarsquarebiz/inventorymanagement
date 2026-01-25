<?php

namespace App\Http\Controllers;

use App\Models\ProductCategorization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategorizationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $productCategorizations = ProductCategorization::orderBy('name', 'asc')->get();

        return Inertia::render('ProductCategorizations/Index', [
            'productCategorizations' => $productCategorizations,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('ProductCategorizations/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:product_categorizations,name',
        ]);

        ProductCategorization::create([
            'name' => $request->name,
        ]);

        return redirect()->route('product-categorizations.index')
            ->with('success', 'Product categorization created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductCategorization $productCategorization): Response
    {
        return Inertia::render('ProductCategorizations/Show', [
            'productCategorization' => [
                'id' => $productCategorization->id,
                'name' => $productCategorization->name,
                'created_at' => $productCategorization->created_at->format('M d, Y'),
                'updated_at' => $productCategorization->updated_at->format('M d, Y'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductCategorization $productCategorization): Response
    {
        return Inertia::render('ProductCategorizations/Edit', [
            'productCategorization' => [
                'id' => $productCategorization->id,
                'name' => $productCategorization->name,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductCategorization $productCategorization)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', \Illuminate\Validation\Rule::unique('product_categorizations')->ignore($productCategorization->id)],
        ]);

        $productCategorization->update([
            'name' => $request->name,
        ]);

        return redirect()->route('product-categorizations.index')
            ->with('success', 'Product categorization updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductCategorization $productCategorization)
    {
        $productCategorization->delete();

        return redirect()->route('product-categorizations.index')
            ->with('success', 'Product categorization deleted successfully.');
    }
}
