<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkshopRequest;
use Inertia\Inertia;
use Inertia\Response;

class WorkshopRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = WorkshopRequest::query();
        if ($request->filled('search')) {
            $q = $request->get('search');
            $query->where(function ($sub) use ($q) {
                $sub->where('description', 'like', "%{$q}%")
                    ->orWhere('status', 'like', "%{$q}%");
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }
        $requests = $query->orderByDesc('created_at')->paginate(15)->withQueryString();
        return Inertia::render('WorkshopRequests/Index', [
            'requests' => $requests,
            'filters' => $request->only(['search','status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('WorkshopRequests/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => 'required|string|max:5000',
            'status' => 'required|in:pending,processed,cancelled',
        ]);
        $wr = WorkshopRequest::create($data);
        return redirect()->route('workshop-requests.index')
            ->with('success', 'Workshop request created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(WorkshopRequest $workshop_request): Response
    {
        return Inertia::render('WorkshopRequests/Show', [
            'request' => $workshop_request,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(WorkshopRequest $workshop_request): Response
    {
        return Inertia::render('WorkshopRequests/Edit', [
            'request' => $workshop_request,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WorkshopRequest $workshop_request)
    {
        $data = $request->validate([
            'description' => 'required|string|max:5000',
            'status' => 'required|in:pending,processed,cancelled',
        ]);
        $workshop_request->update($data);
        return redirect()->route('workshop-requests.show', $workshop_request)
            ->with('success', 'Workshop request updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WorkshopRequest $workshop_request)
    {
        $workshop_request->delete();
        return redirect()->route('workshop-requests.index')
            ->with('success', 'Workshop request deleted.');
    }
}
