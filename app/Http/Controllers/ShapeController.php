<?php

namespace App\Http\Controllers;

use App\Models\Shape;
use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ShapeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Shape::with('product');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->get('search') . '%');
        }

        $shapes = $query->orderBy('name')->paginate(15)->appends($request->only(['search']));

        return Inertia::render('Shapes/Index', [
            'shapes' => $shapes,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $products = Product::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Shapes/Create', [
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('shapes')->where(function ($query) use ($request) {
                    return $query->where('product_id', $request->product_id);
                }),
            ],
            'product_id' => 'nullable|exists:products,id',
        ]);

        $shape = Shape::create([
            'name' => $request->name,
            'product_id' => $request->product_id,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        AuditLog::log($shape, 'CREATE', auth()->id(), null, $shape->toArray());

        return redirect()->route('shapes.index')->with('success', 'Shape created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Shape $shape): Response
    {
        $shape->load('product');

        return Inertia::render('Shapes/Show', [
            'shape' => $shape,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Shape $shape): Response
    {
        $products = Product::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Shapes/Edit', [
            'shape' => $shape,
            'products' => $products,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Shape $shape)
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('shapes')->where(function ($query) use ($request) {
                    return $query->where('product_id', $request->product_id);
                })->ignore($shape->id),
            ],
            'product_id' => 'nullable|exists:products,id',
        ]);

        $old = $shape->toArray();
        $shape->update([
            'name' => $request->name,
            'product_id' => $request->product_id,
            'updated_by' => auth()->id(),
        ]);

        AuditLog::log($shape, 'UPDATE', auth()->id(), $old, $shape->toArray());

        return redirect()->route('shapes.index')->with('success', 'Shape updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Shape $shape)
    {
        AuditLog::log($shape, 'DELETE', auth()->id(), $shape->toArray());
        $shape->delete();
        return redirect()->route('shapes.index')->with('success', 'Shape deleted successfully.');
    }
}
