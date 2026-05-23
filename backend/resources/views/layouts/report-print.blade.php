<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'MIMBA Report')</title>
    <style>
        :root {
            --background: #f8fafc;
            --foreground: #0f172a;
            --muted-foreground: #64748b;
            --border: #e2e8f0;
            --primary: #15803d;
            --report-font: "Kohinoor Bangla", "Bangla MN", "Bangla Sangam MN", "Noto Sans Bengali", "Anek Bangla", Arial, sans-serif;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            background: var(--background);
            color: var(--foreground);
            font-family: var(--report-font);
        }

        .report-page {
            width: min(1120px, calc(100% - 32px));
            margin: 0 auto;
            padding: 32px 0;
        }

        .breadcrumb {
            display: flex;
            gap: 8px;
            align-items: center;
            color: var(--muted-foreground);
            font-size: 0.875rem;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .breadcrumb a {
            color: inherit;
            text-decoration: none;
        }

        .page-header {
            margin-bottom: 1.5rem;
        }

        .page-header-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .page-title {
            font-size: clamp(1.5rem, 4vw, 2rem);
            line-height: 1.2;
            margin: 0;
        }

        .report-kicker {
            color: var(--muted-foreground);
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }

        .metric-label {
            color: var(--muted-foreground);
            font-size: 0.875rem;
            margin: 0 0 0.5rem;
            font-weight: 500;
        }

        .metric-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--foreground);
            letter-spacing: 0;
        }

        .btn {
            min-height: 42px;
            border: 1px solid transparent;
            border-radius: 8px;
            padding: 0 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
        }

        .btn-primary {
            background: var(--primary);
            color: #ffffff;
        }

        .btn-ghost {
            background: transparent;
            border-color: var(--border);
            color: var(--foreground);
        }

        .card {
            background: #ffffff;
            border: 1px solid var(--border);
            border-radius: 8px;
            box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
            margin-bottom: 1rem;
            overflow: hidden;
        }

        .card-header,
        .card-body {
            padding: 1.25rem;
        }

        .card-header {
            border-bottom: 1px solid var(--border);
        }

        .form-input {
            min-height: 42px;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 0 12px;
            background: #ffffff;
            color: var(--foreground);
        }

        .table-container {
            overflow-x: auto;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
        }

        .table th,
        .table td {
            text-align: left;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border);
            white-space: nowrap;
        }

        .table th {
            color: var(--foreground);
            font-size: 0.875rem;
        }

        .table td {
            color: var(--muted-foreground);
        }

        .print-header,
        .print-footer {
            display: none;
        }

        @media print {
            .no-print,
            .breadcrumb,
            .sidebar,
            .navbar,
            .navigation,
            nav,
            aside,
            button {
                display: none !important;
            }

            body {
                background: white !important;
            }

            .report-page {
                width: 100%;
                padding: 0;
            }

            .card {
                box-shadow: none !important;
                border: 1px solid #e5e7eb !important;
                break-inside: avoid;
            }

            .summary-cards {
                gap: 10px !important;
            }

            .table-container {
                overflow: visible !important;
            }

            .table th,
            .table td {
                white-space: normal;
            }

            .print-header,
            .print-footer {
                display: block;
            }
        }
    </style>
</head>
<body>
    <main class="report-page">
        @hasSection('breadcrumb')
            <div class="breadcrumb">
                @yield('breadcrumb')
            </div>
        @endif

        @yield('content')
    </main>
</body>
</html>
