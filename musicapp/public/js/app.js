    // ===== State =====
    let ytPlayer = null;
    let isPlayerReady = false;
    let pendingVideoId = null;
    let seekInterval = null;
    let isSeeking = false;
    let currentSong = null;
    let likedVideoIds = new Set();
    let queue = [];
    let queueIndex = -1;

    // ===== DOM Elements =====
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const statusMessage = document.getElementById('status-message');
    const resultsList = document.getElementById('results-list');
    const playerBar = document.getElementById('player-bar');
    const playerThumbnail = document.getElementById('player-thumbnail');
    const playerTitle = document.getElementById('player-title');
    const playerChannel = document.getElementById('player-channel');
    const playPauseButton = document.getElementById('play-pause-button');
    // ===== BUAT MEMPERBESAR LAYAR MUSIK KETIKA DI PLAY =====
    const expandedPlayer = document.getElementById('expanded-player');
    const collapsePlayerButton = document.getElementById('collapse-player-button');
    const expandedThumbnail = document.getElementById('expanded-thumbnail');
    const expandedTitle = document.getElementById('expanded-title');
    const expandedChannel = document.getElementById('expanded-channel');
    const expandedPlayPauseButton = document.getElementById('expanded-play-pause-button');
    const seekBar = document.getElementById('seek-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const playerLikeButton = document.getElementById('player-like-button');
    const expandedLikeButton = document.getElementById('expanded-like-button');
    // ===== UNTUK MENAMBAHKAN DAFTAR LAGU YANG DISUKAI =====
    const likedList = document.getElementById('liked-list');
    const showLikedButton = document.getElementById('show-liked-button');
    // ===== YouTube IFrame API =====
    // Wajib nama function ini persis "onYouTubeIframeAPIReady",
    // dipanggil otomatis sama YouTube script setelah API-nya siap.
    function onYouTubeIframeAPIReady() {
        ytPlayer = new YT.Player('youtube-player-container', {
            height: '1',
            width: '1',
            events: {
                onReady: () => {
                    isPlayerReady = true;
                    if (pendingVideoId) {
                        ytPlayer.loadVideoById(pendingVideoId);
                        pendingVideoId = null;
                    }
                },
                onStateChange: onPlayerStateChange,
                onError: onPlayerError,
            },
        });
    }

    // Dipanggil otomatis tiap kali status player berubah
    // (mulai muter, di-pause, video habis, dll)
    function onPlayerStateChange(event) {
        console.log('YT state changed:', event.data);
        
        const icon = event.data === YT.PlayerState.PLAYING ? '⏸' : '▶';
        playPauseButton.textContent = icon;
        expandedPlayPauseButton.textContent = icon;

        if (event.data === YT.PlayerState.PLAYING) {
            startSeekTracking();
        }
    }

    function onPlayerError(event) {
        const messages = {
            2:   'Video ID tidak valid.',
            5:   'Error HTML5 player.',
            100: 'Video tidak ditemukan / sudah dihapus.',
            101: 'Pemilik video melarang pemutaran di luar YouTube.',
            150: 'Pemilik video melarang pemutaran di luar YouTube.',
        };

        console.error('YT Player error code:', event.data);
        statusMessage.textContent = messages[event.data] || 'Video tidak bisa diputar.';
        playPauseButton.textContent = '▶';
    }

    function playVideo(videoId, title, channelTitle, thumbnailUrl, durationSeconds) {
        if (isPlayerReady) {
            ytPlayer.loadVideoById(videoId);
        } else {
            pendingVideoId = videoId;
        }

        playerThumbnail.src = thumbnailUrl;
        playerTitle.textContent = title;
        playerChannel.textContent = channelTitle;
        playerBar.classList.add('active');

            // tampilan musik diperlebar
        expandedThumbnail.src = thumbnailUrl;
        expandedTitle.textContent = title;
        expandedChannel.textContent = channelTitle;

            // simpen lagu yang lagi diputar, dipakai buat like
    currentSong = {
        video_id: videoId,
        title,
        channel_title: channelTitle,
        thumbnail_url: thumbnailUrl,
        // duration_seconds diisi terpisah karena playVideo() gak nerima parameter ini
        duration_seconds: durationSeconds,
    };

    const isLiked = likedVideoIds.has(videoId);
    const icon = isLiked ? '❤️' : '🤍';
    playerLikeButton.textContent = icon;
    expandedLikeButton.textContent = icon;


        startSeekTracking();
    }

    function playFromQueue(songs, index) {
    queue = songs;
    queueIndex = index;

    const song = queue[queueIndex];
    playVideo(song.video_id, song.title, song.channel_title, song.thumbnail_url, song.duration_seconds);

    console.log('Queue:', queue.length, 'lagu, index sekarang:', queueIndex);
}

    function togglePlayPause() {
        if (!isPlayerReady || !ytPlayer) return;

        const state = ytPlayer.getPlayerState();

        if (state === YT.PlayerState.PLAYING) {
            ytPlayer.pauseVideo();
        } else {
            ytPlayer.playVideo();
        }
    }

    // ===== Format durasi detik jadi mm:ss =====
    function formatDuration(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

async function toggleLike(song, buttonEl, otherButtonEl = null) {
    try {
        const response = await fetch('/api/liked/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                video_id: song.video_id,
                title: song.title,
                channel_title: song.channel_title,
                thumbnail_url: song.thumbnail_url,
                duration_seconds: song.duration_seconds,
            }),
        });

        const data = await response.json();
        const icon = data.liked ? '❤️' : '🤍';
        buttonEl.textContent = icon;
        if (otherButtonEl) otherButtonEl.textContent = icon;

        if (data.liked) {
            likedVideoIds.add(song.video_id);
        } else {
            likedVideoIds.delete(song.video_id);
        }
    } catch (error) {
        console.error('Gagal toggle like:', error);
    }
}

async function loadLikedSongs() {
    try {
        const response = await fetch('/api/liked');
        const data = await response.json();
        likedVideoIds = new Set(data.songs.map(s => s.video_id));
    } catch (error) {
        console.error('Gagal ambil daftar liked songs:', error);
    }
}

    // ===== Format detik jadi mm:ss (dipakai juga buat seek bar) =====
    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function startSeekTracking() {
        clearInterval(seekInterval);

        seekInterval = setInterval(() => {
            if (!isPlayerReady || !ytPlayer || isSeeking) return;

            const duration = ytPlayer.getDuration();
            const current = ytPlayer.getCurrentTime();

            if (!duration) return;

            seekBar.max = duration;
            seekBar.value = current;
            currentTimeEl.textContent = formatTime(current);
            totalTimeEl.textContent = formatTime(duration);
        }, 500);
    }

    // User mulai geser slider
    seekBar.addEventListener('input', () => {
        isSeeking = true;
        currentTimeEl.textContent = formatTime(seekBar.value);
    });

    // User lepas slider → lompat ke posisi itu
    seekBar.addEventListener('change', () => {
        if (isPlayerReady && ytPlayer) {
            ytPlayer.seekTo(seekBar.value, true);
        }
        isSeeking = false;
    });

    // ===== Render hasil search ke list =====
    function renderResults(songs) {
        resultsList.innerHTML = '';

        if (songs.length === 0) {
            statusMessage.textContent = 'Tidak ada hasil ditemukan.';
            return;
        }

        statusMessage.textContent = `${songs.length} hasil ditemukan`;

        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'song-item';
             const isLiked = likedVideoIds.has(song.video_id);
            li.innerHTML = `
                <img src="${song.thumbnail_url}" alt="${song.title}">
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-channel">${song.channel_title}</div>
                </div>
                <div class="song-duration">${formatDuration(song.duration_seconds)}</div>
                <button class="like-button" type="button">${isLiked ? '❤️' : '🤍'}</button>
            `;

            li.addEventListener('click', () => {
                playFromQueue(songs, index);
            });

                // biar klik tombol like gak ikut trigger play
            const likeButton = li.querySelector('.like-button');
            likeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(song, likeButton);
    });

            resultsList.appendChild(li);
        });
    }

    // ===== Render lagu yang disukai =====

    function renderLikedSongs(songs) {
    likedList.innerHTML = '';

    if (songs.length === 0) {
        likedList.innerHTML = '<li>Belum ada lagu yang di-like.</li>';
        return;
    }

    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'song-item';

        li.innerHTML = `
            <img src="${song.thumbnail_url}" alt="${song.title}">
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-channel">${song.channel_title}</div>
            </div>
            <div class="song-duration">${formatDuration(song.duration_seconds)}</div>
            <button class="like-button" type="button">❤️</button>
        `;


        li.addEventListener('click', () => {
    playFromQueue(songs, index);
});

        const likeButton = li.querySelector('.like-button');
        likeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(song, likeButton).then(() => {
                // kalau di-unlike dari halaman ini, langsung hilangin dari list
                if (!likedVideoIds.has(song.video_id)) {
                    li.remove();
                }
            });
        });

        likedList.appendChild(li);
    });
}

 // ===== menunjukan lagu yang disukai =====

async function showLikedSongs() {
    try {
        const response = await fetch('/api/liked');
        const data = await response.json();

        likedVideoIds = new Set(data.songs.map(s => s.video_id));
        renderLikedSongs(data.songs);

        resultsList.style.display = 'none';
        likedList.style.display = '';
        statusMessage.style.display = 'none';

        showLikedButton.textContent = '← Kembali';
    } catch (error) {
        console.error('Gagal ambil daftar liked songs:', error);
    }
}

function showSearchView() {
    likedList.style.display = 'none';
    resultsList.style.display = '';
    statusMessage.style.display = '';

    showLikedButton.textContent = '❤️ Liked Songs';
}

    // ===== Handle submit form search =====
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const query = searchInput.value.trim();
    if (query.length < 2) {
        statusMessage.textContent = 'Query minimal 2 karakter.';
        return;
    }

    // balik ke tampilan hasil search
     showSearchView();

    statusMessage.textContent = 'Mencari...';
    resultsList.innerHTML = '';

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (!response.ok) {
                statusMessage.textContent = data.message || 'Terjadi kesalahan.';
                return;
            }

            renderResults(data.results);
        } catch (error) {
            statusMessage.textContent = 'Gagal terhubung ke server.';
            console.error(error);
        }
    });

    // ===== Handle klik tombol play/pause =====
    playPauseButton.addEventListener('click', togglePlayPause);

    // ===== Expand / collapse player =====
    playerBar.addEventListener('click', (e) => {
        // supaya klik tombol play/pause di mini player nggak ikut expand
        if (e.target === playPauseButton) return;
        expandedPlayer.classList.add('active');
    });

    collapsePlayerButton.addEventListener('click', () => {
        expandedPlayer.classList.remove('active');
    });

    // ===== Sinkronisasi tombol play/pause di expanded view =====
    expandedPlayPauseButton.addEventListener('click', togglePlayPause);

playerLikeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentSong) toggleLike(currentSong, playerLikeButton, expandedLikeButton);
});

expandedLikeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentSong) toggleLike(currentSong, expandedLikeButton, playerLikeButton);
});

showLikedButton.addEventListener('click', () => {
    const isShowingLiked = likedList.style.display !== 'none';
    if (isShowingLiked) {
        showSearchView();
    } else {
        showLikedSongs();
    }
});

 // menampilkan lagu yang disukai =====
