<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class YoutubeService
{
    protected string $apiKey;
    protected string $baseUri;

    public function __construct()
    {
        $this->apiKey = config('services.youtube.key');
        $this->baseUri = config('services.youtube.base_uri');
    }

    /**
     * Search lagu berdasarkan query dari user.
     */
    public function search(string $query): array
    {
        $cacheKey = 'yt_search_' . md5($query);

        return Cache::remember($cacheKey, now()->addHour(), function () use ($query) {
            // Tambahin keyword tersembunyi biar hasil lebih ke arah "lagu", bukan video biasa
            $searchQuery = $query . ' official audio';

            $response = Http::get("{$this->baseUri}/search", [
                'part' => 'snippet',
                'q' => $searchQuery,
                'type' => 'video',
                'videoCategoryId' => 10, // kategori Music
                'maxResults' => 15,
                'key' => $this->apiKey,
            ]);



            if ($response->failed()) {
                return [];
            }

            $items = $response->json('items', []);

            // Ambil video_id semua hasil, buat dipakai fetch durasi di step berikutnya
            $videoIds = collect($items)->pluck('id.videoId')->filter()->implode(',');

            if (empty($videoIds)) {
                return [];
            }

            return $this->attachDurations($items, $videoIds);
        });
    }

    /**
     * Ambil durasi video (dari endpoint videos.list) lalu gabungkan
     * dengan hasil search, sekaligus filter durasi yang wajar buat lagu.
     */
protected function attachDurations(array $items, string $videoIds): array
{
    $response = Http::get("{$this->baseUri}/videos", [
        'part' => 'contentDetails,status',
        'id' => $videoIds,
        'key' => $this->apiKey,
    ]);

    $videoData = collect($response->json('items', []))->keyBy('id');

    // Kumpulin dulu kandidat yang lolos filter durasi & embeddable dari API,
    // baru diverifikasi ulang pakai oEmbed (lebih akurat).
    $candidates = [];

    foreach ($items as $item) {
        $videoId = $item['id']['videoId'] ?? null;
        if (!$videoId || !isset($videoData[$videoId])) {
            continue;
        }

        $detail = $videoData[$videoId];

        $embeddable = $detail['status']['embeddable'] ?? false;
        if (!$embeddable) {
            continue;
        }

        $durationSeconds = $this->parseDuration($detail['contentDetails']['duration']);
        if ($durationSeconds < 30 || $durationSeconds > 600) {
            continue;
        }

        $candidates[$videoId] = [
            'video_id' => $videoId,
            'title' => $item['snippet']['title'],
            'channel_title' => $item['snippet']['channelTitle'],
            'thumbnail_url' => $item['snippet']['thumbnails']['medium']['url'] ?? null,
            'duration_seconds' => $durationSeconds,
        ];
    }

    if (empty($candidates)) {
        return [];
    }

    // Verifikasi ulang tiap kandidat pakai oEmbed, dijalankan paralel biar cepat.
    $responses = Http::pool(fn ($pool) => collect($candidates)->map(
        fn ($song, $videoId) => $pool->as($videoId)->get('https://www.youtube.com/oembed', [
            'url' => "https://www.youtube.com/watch?v={$videoId}",
            'format' => 'json',
        ])
    )->all());

    $results = [];

    foreach ($candidates as $videoId => $song) {
        $oembedResponse = $responses[$videoId] ?? null;

        if ($oembedResponse && $oembedResponse->successful()) {
            $results[] = $song;
        }
    }

    return $results;
}

    /**
     * Parse format durasi ISO 8601 dari YouTube (misal "PT3M45S") jadi detik.
     */
    protected function parseDuration(string $isoDuration): int
    {
        $interval = new \DateInterval($isoDuration);
        return ($interval->h * 3600) + ($interval->i * 60) + $interval->s;
    }
}