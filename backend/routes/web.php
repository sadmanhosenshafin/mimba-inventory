<?php

use App\Http\Controllers\SummaryReportPrintController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'success' => true,
        'message' => 'MIMBA REST API চালু আছে।',
        'data' => [
            'api' => '/api',
        ],
    ]);
});

Route::get('/reports/summary', SummaryReportPrintController::class)->name('report.summary');
