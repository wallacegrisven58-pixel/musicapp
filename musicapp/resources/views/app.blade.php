<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music App</title>
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    <h1>🎵 Music App</h1>
    <form id="search-form">
        <input
            type="text"
            id="search-input"
            placeholder="Cari lagu atau artis..."
            autocomplete="off"
        >
        
        <button type="submit" id="search-button">Cari</button>
        <button id="show-liked-button" type="button">❤️ Liked Songs</button>
    </form>
</head>
<body>



    <main>
        <p id="status-message">Ketik sesuatu untuk mulai mencari lagu.</p>
        <ul id="results-list"></ul>
        <ul id="liked-list" style="display: none;"></ul>
    </main>

    <div id="player-bar">
        <img id="player-thumbnail" src="" alt="">
        <div id="player-info">
            <div id="player-title">-</div>
            <div id="player-channel">-</div>
        </div>
        <button id="player-like-button" type="button">🤍</button>
        <button id="play-pause-button" type="button">▶</button>
    </div>

    <!-- Container tersembunyi, tempat YouTube IFrame Player nempel -->
    <div id="youtube-player-container"></div>

    <!-- YouTube IFrame API -->
    <script src="https://www.youtube.com/iframe_api"></script>

 

<div id="expanded-player" class="expanded-player">
    <button id="collapse-player-button" class="collapse-button">▾</button>

    <img id="expanded-thumbnail" class="expanded-thumbnail" src="" alt="">

    <div class="expanded-info">
        <h2 id="expanded-title"></h2>
        <p id="expanded-channel"></p>
    </div>

    <div class="seek-container">
        <span id="current-time">0:00</span>
        <input type="range" id="seek-bar" min="0" max="100" value="0" step="1">
        <span id="total-time">0:00</span>
    </div>

    <button id="expanded-play-pause-button" class="expanded-play-pause">▶</button>
    <button id="expanded-like-button" type="button">🤍</button>
</div>

   <!-- Logic aplikasi kita -->
    <script src="{{ asset('js/app.js') }}"></script>

</body>
</html>