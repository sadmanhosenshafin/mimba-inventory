<?php

namespace App\Support;

use App\Models\ActivityLog;

trait RecordsActivity
{
    protected function recordActivity(
        string $type,
        string $title,
        ?string $description = null,
        ?string $subjectType = null,
        int|string|null $subjectId = null,
        ?string $subjectName = null
    ): void {
        ActivityLog::create([
            'type' => $type,
            'title' => $title,
            'description' => $description,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'subject_name' => $subjectName,
        ]);
    }
}
