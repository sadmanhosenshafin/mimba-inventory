<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ActivityController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SaleController;
use App\Http\Controllers\Api\V1\SalesReturnController;
use App\Http\Controllers\Api\V1\StockController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    Route::get('/activities', [ActivityController::class, 'index']);
    Route::apiResource('customers', CustomerController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::get('/expenses/summary', [ExpenseController::class, 'summary']);
    Route::apiResource('expenses', ExpenseController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('products', ProductController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::apiResource('sales', SaleController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::apiResource('returns', SalesReturnController::class)->only(['index', 'store', 'destroy']);

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);

    Route::post('/stock/in', [StockController::class, 'stockIn']);
    Route::post('/stock/out', [StockController::class, 'stockOut']);
    Route::get('/stock/history', [StockController::class, 'history']);
    Route::get('/stock/history/{stockEntry}', [StockController::class, 'show']);
    Route::put('/stock/history/{stockEntry}', [StockController::class, 'update']);
    Route::delete('/stock/history/{stockEntry}', [StockController::class, 'destroy']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/daily', [ReportController::class, 'daily']);
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
    Route::get('/reports/products', [ReportController::class, 'products']);
    Route::get('/reports/customers', [ReportController::class, 'customers']);
    Route::get('/reports/profit', [ReportController::class, 'profit']);
    Route::get('/reports/due-customers', [ReportController::class, 'dueCustomers']);
    Route::get('/reports/export/pdf', [ReportController::class, 'exportPdf']);
});

Route::prefix('v1')->middleware('auth:sanctum')->group(function (): void {
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::apiResource('customers', CustomerController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::get('/expenses/summary', [ExpenseController::class, 'summary']);
    Route::apiResource('expenses', ExpenseController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('products', ProductController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::apiResource('sales', SaleController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::apiResource('returns', SalesReturnController::class)->only(['index', 'store', 'destroy']);

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);

    Route::post('/stock/in', [StockController::class, 'stockIn']);
    Route::post('/stock/out', [StockController::class, 'stockOut']);
    Route::get('/stock/history', [StockController::class, 'history']);
    Route::get('/stock/history/{stockEntry}', [StockController::class, 'show']);
    Route::put('/stock/history/{stockEntry}', [StockController::class, 'update']);
    Route::delete('/stock/history/{stockEntry}', [StockController::class, 'destroy']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/daily', [ReportController::class, 'daily']);
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
    Route::get('/reports/products', [ReportController::class, 'products']);
    Route::get('/reports/customers', [ReportController::class, 'customers']);
    Route::get('/reports/profit', [ReportController::class, 'profit']);
    Route::get('/reports/due-customers', [ReportController::class, 'dueCustomers']);
    Route::get('/reports/export/pdf', [ReportController::class, 'exportPdf']);
});
