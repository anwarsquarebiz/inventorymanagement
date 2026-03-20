<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Voucher;
use Illuminate\Auth\Access\HandlesAuthorization;

class VoucherPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability)
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }
    }

    /**
     * Determine whether the user can view any vouchers.
     */
    public function viewAny(User $user): bool
    {
        return true; // Allow all authenticated users to view vouchers
    }

    /**
     * Determine whether the user can view the voucher.
     */
    public function view(User $user, Voucher $voucher): bool
    {
        return true; // Allow all authenticated users to view any voucher
    }

    /**
     * Determine whether the user can create vouchers.
     */
    public function create(User $user): bool
    {
        return true; // Allow all authenticated users to create vouchers
    }

    /**
     * Determine whether the user can update the voucher.
     */
    public function update(User $user, Voucher $voucher): bool
    {
        // Allow users to update vouchers they created or are assigned to
        return $user->id === $voucher->created_by ||
            $user->id === $voucher->person_in_charge ||
            $user->hasRole(['admin', 'manager']); // Allow admins and managers
    }

    /**
     * Determine whether the user can delete the voucher.
     */
    public function delete(User $user, Voucher $voucher): bool
    {
        // Only allow creators or admins to delete vouchers
        return $user->id === $voucher->created_by ||
            $user->hasRole(['admin']);
    }

    /**
     * Determine whether the user can approve the voucher.
     */
    public function approve(User $user, Voucher $voucher): bool
    {
        // Allow managers and admins to approve vouchers
        return $user->hasRole(['admin', 'manager']) ||
            $user->id === $voucher->person_in_charge; // Person in charge can also approve
    }

    /**
     * Determine whether the user can verify the voucher.
     */
    public function verify(User $user, Voucher $voucher): bool
    {
        // Allow managers and admins to verify vouchers
        return $user->hasRole(['admin', 'manager']) ||
            $user->id === $voucher->person_in_charge; // Person in charge can also verify
    }

    /**
     * Determine whether the user can restore the voucher.
     */
    public function restore(User $user, Voucher $voucher): bool
    {
        return $user->hasRole(['admin']);
    }

    /**
     * Determine whether the user can permanently delete the voucher.
     */
    public function forceDelete(User $user, Voucher $voucher): bool
    {
        return $user->hasRole(['admin']);
    }
}
