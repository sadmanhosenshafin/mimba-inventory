@extends('layouts.report-print')

@php
    $formatCurrency = fn ($amount) => '৳ '.number_format((float) $amount, 2);
@endphp

@section('title', 'সারাংশ রিপোর্ট')

@section('breadcrumb')
    <a href="{{ url('/') }}">{{ __('Dashboard') }}</a>
    <span class="breadcrumb-separator">/</span>
    <span>রিপোর্ট</span>
    <span class="breadcrumb-separator">/</span>
    <span>সারাংশ রিপোর্ট</span>
@endsection

@section('content')
    <div class="page-header">
        <div class="page-header-row">
            <div>
                <h1 class="page-title">সারাংশ রিপোর্ট</h1>
                <div class="report-kicker">
                    <span>নির্বাচিত সময়ের ক্রয়, বিক্রি, খরচ ও লাভ এক জায়গায়।</span>
                </div>
            </div>
            <div class="no-print">
                <button onclick="window.print()" class="btn btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    রিপোর্ট প্রিন্ট করুন
                </button>
            </div>
        </div>
    </div>

    <x-print-layout title="MIMBA সারাংশ রিপোর্ট">
        <x-slot name="filterContent">
            <div>তারিখ: {{ $fromDate }} থেকে {{ $toDate }}</div>
        </x-slot>
    </x-print-layout>

    <div class="card no-print" style="margin-bottom: 1.5rem;">
        <div class="card-body">
            <form action="{{ route('report.summary') }}" method="GET">
                <div style="display: flex; gap: 1.5rem; align-items: flex-end; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px;">
                        <label for="from_date" style="display: block; margin-bottom: 0.5rem; color: var(--muted-foreground); font-size: 0.875rem;">শুরুর তারিখ</label>
                        <input type="date" name="from_date" id="from_date" class="form-input" style="width: 100%;" value="{{ $fromDate }}">
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <label for="to_date" style="display: block; margin-bottom: 0.5rem; color: var(--muted-foreground); font-size: 0.875rem;">শেষ তারিখ</label>
                        <input type="date" name="to_date" id="to_date" class="form-input" style="width: 100%;" value="{{ $toDate }}">
                    </div>
                    <div>
                        <button type="submit" class="btn btn-primary" style="height: 42px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            রিপোর্ট দেখুন
                        </button>
                        <a href="{{ route('report.summary') }}" class="btn btn-ghost" style="height: 42px;">রিসেট</a>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <div class="metrics-grid summary-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <div class="card" style="margin-bottom: 0;">
            <div class="card-body">
                <h4 class="metric-label">মোট ক্রয়</h4>
                <div class="metric-value">{{ $formatCurrency($totalPurchaseAmount) }}</div>
            </div>
        </div>
        <div class="card" style="margin-bottom: 0;">
            <div class="card-body">
                <h4 class="metric-label">মোট বিক্রি</h4>
                <div class="metric-value">{{ $formatCurrency($totalSaleAmount) }}</div>
            </div>
        </div>
        <div class="card" style="margin-bottom: 0;">
            <div class="card-body">
                <h4 class="metric-label">মোট খরচ</h4>
                <div class="metric-value">{{ $formatCurrency($totalExpenseAmount) }}</div>
            </div>
        </div>
        <div class="card" style="margin-bottom: 0;">
            <div class="card-body">
                <h4 class="metric-label">নিট লাভ</h4>
                <div class="metric-value" style="color: {{ $totalProfit >= 0 ? '#10b981' : '#ef4444' }};">
                    {{ $formatCurrency($totalProfit) }}
                </div>
            </div>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
                <h3 style="color: var(--foreground); font-size: 1.125rem;">ক্রয়কৃত পণ্য</h3>
            </div>
            @if ($purchasedProducts->count())
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>পণ্য</th>
                                <th>পরিমাণ</th>
                                <th>মোট টাকা</th>
                            </tr>
                        </thead>
                        <tbody style="color: var(--muted-foreground);">
                            @foreach ($purchasedProducts as $item)
                                <tr>
                                    <td>{{ $item->product ? $item->product->name : 'Unknown Product' }}</td>
                                    <td>{{ $item->total_qty }}</td>
                                    <td>{{ $formatCurrency($item->total_amount) }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <div class="empty-state" style="padding: 2rem;">
                    <p style="color: #94a3b8;">এই সময়ে কোনো পণ্য ক্রয় পাওয়া যায়নি।</p>
                </div>
            @endif
        </div>

        <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
                <h3 style="color: var(--foreground); font-size: 1.125rem;">বিক্রিত পণ্য</h3>
            </div>
            @if ($soldProducts->count())
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>পণ্য</th>
                                <th>পরিমাণ</th>
                                <th>মোট টাকা</th>
                            </tr>
                        </thead>
                        <tbody style="color: var(--muted-foreground);">
                            @foreach ($soldProducts as $item)
                                <tr>
                                    <td>{{ $item->product ? $item->product->name : 'Unknown Product' }}</td>
                                    <td>{{ $item->total_qty }}</td>
                                    <td>{{ $formatCurrency($item->total_amount) }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <div class="empty-state" style="padding: 2rem;">
                    <p style="color: #94a3b8;">এই সময়ে কোনো বিক্রিত পণ্য পাওয়া যায়নি।</p>
                </div>
            @endif
        </div>
    </div>

    <x-print-footer />
@endsection
