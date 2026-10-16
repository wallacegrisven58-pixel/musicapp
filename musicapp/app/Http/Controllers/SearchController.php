<?php

namespace App\Http\Controllers;

use App\Services\YoutubeService;
use App\Http\Requests\SearchRequest;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    protected YoutubeService $youtubeService;

    public function __construct(YoutubeService $youtubeService)
    {
        $this->youtubeService = $youtubeService;
    }

    public function search(SearchRequest $request): JsonResponse
    {
        $query = $request->validated('q');

        $results = $this->youtubeService->search($query);

        return response()->json([
            'query' => $query,
            'results' => $results,
        ]);
    }
}