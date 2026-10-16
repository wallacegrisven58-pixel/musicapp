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
    Schema::create('liked_songs', function (Blueprint $table) {
        $table->id();
        $table->string('video_id')->unique();
        $table->string('title');
        $table->string('channel_title');
        $table->string('thumbnail_url')->nullable();
        $table->unsignedInteger('duration_seconds');
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('like_songs');
    }
};
