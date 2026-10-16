<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\LikedSongController;
use App\Http\Controllers\PlaylistController;

Route::get('/search', [SearchController::class, 'search']);
Route::get('/liked', [LikedSongController::class, 'index']);
Route::post('/liked/toggle', [LikedSongController::class, 'toggle']);

Route::get('/playlists', [PlaylistController::class, 'index']);
Route::post('/playlists', [PlaylistController::class, 'store']);
Route::get('/playlists/{playlist}', [PlaylistController::class, 'show']);
Route::post('/playlists/{playlist}/songs', [PlaylistController::class, 'addSong']);
Route::delete('/playlists/{playlist}/songs/{videoId}', [PlaylistController::class, 'removeSong']);
Route::delete('/playlists/{playlist}', [PlaylistController::class, 'destroy']);