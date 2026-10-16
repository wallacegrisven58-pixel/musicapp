<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Song extends Model
{
        protected $fillable = [
        'video_id',
        'title',
        'channel_title',
        'thumbnail_url',
        'duration_seconds',
    ];
}
