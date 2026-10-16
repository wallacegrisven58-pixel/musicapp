<?php

namespace App\Http\Controllers;

use App\Models\LikedSong;
use Illuminate\Http\Request;

class LikedSongController extends Controller
{
    public function index()
    {
        return response()->json([
            'songs' => LikedSong::latest()->get(),
        ]);
    }

    public function toggle(Request $request)
    {
        $data = $request->validate([
            'video_id' => 'required|string',
            'title' => 'required|string',
            'channel_title' => 'required|string',
            'thumbnail_url' => 'nullable|string',
            'duration_seconds' => 'required|integer',
        ]);

        $existing = LikedSong::where('video_id', $data['video_id'])->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['liked' => false]);
        }

        LikedSong::create($data);
        return response()->json(['liked' => true]);
    }
}