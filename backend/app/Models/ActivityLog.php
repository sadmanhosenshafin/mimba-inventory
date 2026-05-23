<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'type',
    'title',
    'description',
    'subject_type',
    'subject_id',
    'subject_name',
])]
class ActivityLog extends Model
{
    use HasFactory;
}
