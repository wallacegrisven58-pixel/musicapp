<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('playlist_songs', function (Blueprint $table) {
        $table->id();
        $table->foreignId('playlist_id')->constrained()->cascadeOnDelete();
        $table->string('video_id');
        $table->string('title');
        $table->string('channel_title');
        $table->string('thumbnail_url')->nullable();
        $table->unsignedInteger('duration_seconds');
        $table->timestamps();

        $table->unique(['playlist_id', 'video_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('playlist_songs');
    }
};
