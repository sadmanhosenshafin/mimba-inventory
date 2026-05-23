<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->createOverdueNotifications();

        $notifications = AppNotification::query()
            ->with('customer:id,shop_name,owner_name,phone,total_due')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->successResponse('নোটিফিকেশন পাওয়া গেছে।', $notifications);
    }

    public function markAsRead(AppNotification $notification): JsonResponse
    {
        $notification->update(['is_read' => true]);

        return $this->successResponse('নোটিফিকেশন পড়া হয়েছে।', [
            'notification' => $notification->refresh(),
        ]);
    }

    private function createOverdueNotifications(): void
    {
        Sale::query()
            ->with('customer:id,shop_name')
            ->where('due_amount', '>', 0)
            ->whereDate('date', '<', now()->subDays(3)->toDateString())
            ->get()
            ->each(function (Sale $sale): void {
                $alreadyExists = AppNotification::query()
                    ->where('customer_id', $sale->customer_id)
                    ->where('type', 'due_overdue')
                    ->where('is_read', false)
                    ->exists();

                if (! $alreadyExists) {
                    AppNotification::create([
                        'customer_id' => $sale->customer_id,
                        'type' => 'due_overdue',
                        'message' => $sale->customer?->shop_name.' এর বাকি টাকা ৩ দিনের বেশি বাকি আছে।',
                    ]);
                }
            });
    }
}
