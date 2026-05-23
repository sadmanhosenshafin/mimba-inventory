@props(['title' => 'REPORT'])

<div class="print-header">
    <h2 style="margin: 0 0 0.5rem;">{{ $title }}</h2>
    <div style="color: #64748b; font-size: 0.875rem;">
        {{ $filterContent ?? '' }}
    </div>
</div>
