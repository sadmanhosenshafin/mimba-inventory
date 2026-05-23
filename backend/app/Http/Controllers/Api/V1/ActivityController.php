<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $activities = ActivityLog::query()
            ->latest()
            ->paginate($request->integer('per_page', 12));

        return $this->successResponse('সাম্প্রতিক কার্যক্রম পাওয়া গেছে।', $activities);
    }
}
