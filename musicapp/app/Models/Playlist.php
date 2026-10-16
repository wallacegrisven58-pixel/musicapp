<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    protected $fillable = ['name'];

    public function songs()
    {
        return $this->hasMany(PlaylistSong::class);
    }
}