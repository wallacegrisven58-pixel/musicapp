<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Models\PlaylistSong;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    public function index()
    {
        return response()->json([
            'playlists' => Playlist::withCount('songs')->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100']);
        $playlist = Playlist::create($data);
        return response()->json(['playlist' => $playlist], 201);
    }

    public function show(Playlist $playlist)
    {
        return response()->json([
            'playlist' => $playlist,
            'songs' => $playlist->songs()->get(),
        ]);
    }

    public function addSong(Request $request, Playlist $playlist)
    {
        $data = $request->validate([
            'video_id' => 'required|string',
            'title' => 'required|string',
            'channel_title' => 'required|string',
            'thumbnail_url' => 'nullable|string',
            'duration_seconds' => 'required|integer',
        ]);

        $exists = $playlist->songs()->where('video_id', $data['video_id'])->exists();
        if ($exists) {
            return response()->json(['message' => 'Lagu sudah ada di playlist ini.'], 409);
        }

        $data['playlist_id'] = $playlist->id;
        PlaylistSong::create($data);

        return response()->json(['message' => 'Lagu ditambahkan.'], 201);
    }

    public function removeSong(Playlist $playlist, string $videoId)
    {
        $playlist->songs()->where('video_id', $videoId)->delete();
        return response()->json(['message' => 'Lagu dihapus dari playlist.']);
    }

    public function destroy(Playlist $playlist)
    {
        $playlist->delete();
        return response()->json(['message' => 'Playlist dihapus.']);
    }
}