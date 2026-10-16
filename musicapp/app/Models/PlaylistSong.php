<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlaylistSong extends Model
{
    protected $fillable = [
        'playlist_id', 'video_id', 'title', 'channel_title', 'thumbnail_url', 'duration_seconds',
    ];
}