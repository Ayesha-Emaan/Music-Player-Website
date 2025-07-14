document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const musicPlayer = document.querySelector('.music-player');
    const albumArt = document.getElementById('album-art');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const playlistEl = document.getElementById('playlist');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const lyricsBtn = document.getElementById('lyrics-btn');
    const equalizerBtn = document.getElementById('equalizer-btn');
    const addSongBtn = document.getElementById('add-song-btn');
    const lyricsModal = document.querySelector('.lyrics-modal');
    const lyricsText = document.getElementById('lyrics-text');
    const closeModal = document.querySelector('.close-modal');
    const equalizerModal = document.querySelector('.equalizer-modal');
    const closeEqualizer = document.querySelector('.close-equalizer');
    const addSongModal = document.querySelector('.add-song-modal');
    const closeAddModal = document.querySelector('.close-add-modal');
    const addSongForm = document.getElementById('add-song-form');
    const themeToggle = document.querySelector('.theme-toggle');
    const toggleSwitch = document.querySelector('.toggle-switch');
    const eqSliders = document.querySelectorAll('.eq-slider');
    const eqPresets = document.querySelectorAll('.eq-preset');

    // Audio Context
    const audio = new Audio();
    let isPlaying = false;
    let isShuffle = false;
    let isRepeat = false;
    let currentSongIndex = 0;
    let audioContext;
    let analyser;
    let dataArray;
    let animationId;

    // Sample Song Data (Replace with your actual songs)
    let songs = [
      
        {
            title: "Blinding Lights",
            artist: "The Weekend",
            src: "assets/songs/audio1.mp3",
            cover: "assets/images/album1.jpg",
            duration: "3:20",
            lyrics: "I've been tryna call\nI've been on my own for long enough\nMaybe you can show me how to love, maybe\n..."
        },
        {
            title: "Save Your Tears",
            artist: "The Weeknd",
            src: "assets/songs/audio2.mp3",
            cover: "assets/images/album1.jpg",
            duration: "3:35",
            lyrics: "Ooh, na-na, yeah\nI saw you dancing in a crowded room\nYou look so happy when I'm not with you\n..."
        },
        {
            title: "Levitating",
            artist: "Dua Lipa",
            src: "assets/songs/audio3.mp3",
            cover: "assets/images/album1.jpg",
            duration: "3:50",
            lyrics: "I'm tryna put you in the worst mood, ah\nP1 cleaner than your church shoes, ah\n..."
        },
          {
            title: "Don't Start Now",
            artist: "Dua Lipa",
            src: "assets/songs/audio3.mp3",
            cover: "assets/images/album1.jpg",
            duration: "3:50",
            lyrics: "I'm tryna put you in the worst mood, ah\nP1 cleaner than your church shoes, ah\n..."
        },
          {
            title: "Watermelon Sugar",
            artist: "Harry Styles",
            src: "assets/songs/audio3.mp3",
            cover: "assets/images/album1.jpg",
            duration: "3:50",
            lyrics: "I'm tryna put you in the worst mood, ah\nP1 cleaner than your church shoes, ah\n..."
        }
    ];

    // Initialize Player
    function initPlayer() {
        renderPlaylist();
        loadSong(currentSongIndex);
        
        // Event Listeners
        playBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', prevSong);
        nextBtn.addEventListener('click', nextSong);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleSongEnd);
        audio.addEventListener('loadedmetadata', updateDuration);
        progressBar.parentElement.addEventListener('click', setProgress);
        volumeSlider.addEventListener('input', setVolume);
        shuffleBtn.addEventListener('click', toggleShuffle);
        repeatBtn.addEventListener('click', toggleRepeat);
        lyricsBtn.addEventListener('click', showLyrics);
        equalizerBtn.addEventListener('click', showEqualizer);
        addSongBtn.addEventListener('click', showAddSongModal);
        closeModal.addEventListener('click', hideLyrics);
        closeEqualizer.addEventListener('click', hideEqualizer);
        closeAddModal.addEventListener('click', hideAddSongModal);
        addSongForm.addEventListener('submit', addNewSong);
        themeToggle.addEventListener('click', toggleTheme);
        
        // Equalizer Presets
        eqPresets.forEach(preset => {
            preset.addEventListener('click', applyEqPreset);
        });
        
        // Set initial volume
        audio.volume = volumeSlider.value;
        
        // Initialize Audio Context for Equalizer
        initAudioContext();
    }

    // Load Song
    function loadSong(index) {
        const song = songs[index];
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        albumArt.src = song.cover;
        audio.src = song.src;
        
        // Update active song in playlist
        updateActiveSong();
        
        // If audio was playing, continue playing
        if (isPlaying) {
            audio.play().catch(e => console.log("Playback prevented:", e));
        }
    }

    // Play/Pause
    function togglePlay() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    function playSong() {
        musicPlayer.classList.add('playing');
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        audio.play().catch(e => console.log("Playback prevented:", e));
        isPlaying = true;
        startVisualizer();
    }

    function pauseSong() {
        musicPlayer.classList.remove('playing');
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        audio.pause();
        isPlaying = false;
        cancelAnimationFrame(animationId);
    }

    // Previous Song
    function prevSong() {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songs.length - 1;
        }
        loadSong(currentSongIndex);
        if (isPlaying) {
            playSong();
        }
    }

    // Next Song
    function nextSong() {
        if (isShuffle) {
            shuffleSong();
        } else {
            currentSongIndex++;
            if (currentSongIndex > songs.length - 1) {
                currentSongIndex = 0;
            }
        }
        loadSong(currentSongIndex);
        if (isPlaying) {
            playSong();
        }
    }

    // Handle Song End
    function handleSongEnd() {
        if (isRepeat) {
            audio.currentTime = 0;
            audio.play();
        } else {
            nextSong();
        }
    }

    // Shuffle Song
    function shuffleSong() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * songs.length);
        } while (newIndex === currentSongIndex && songs.length > 1);
        currentSongIndex = newIndex;
    }

    // Toggle Shuffle
    function toggleShuffle() {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        localStorage.setItem('shuffle', isShuffle);
    }

    // Toggle Repeat
    function toggleRepeat() {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle('active', isRepeat);
        localStorage.setItem('repeat', isRepeat);
    }

    // Update Progress Bar
    function updateProgress() {
        const { duration, currentTime } = audio;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Update time display
        currentTimeEl.textContent = formatTime(currentTime);
    }

    // Set Progress
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    // Update Duration
    function updateDuration() {
        durationEl.textContent = formatTime(audio.duration);
        
        // Update duration in playlist
        const playlistItems = playlistEl.querySelectorAll('li');
        if (playlistItems[currentSongIndex]) {
            const durationSpan = playlistItems[currentSongIndex].querySelector('.song-duration');
            if (durationSpan) {
                durationSpan.textContent = formatTime(audio.duration);
            }
        }
    }

    // Format Time
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Set Volume
    function setVolume() {
        audio.volume = this.value;
        localStorage.setItem('volume', this.value);
    }

    // Show Lyrics
    function showLyrics() {
        lyricsText.textContent = songs[currentSongIndex].lyrics || "No lyrics available";
        lyricsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Hide Lyrics
    function hideLyrics() {
        lyricsModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Show Equalizer
    function showEqualizer() {
        equalizerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Hide Equalizer
    function hideEqualizer() {
        equalizerModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Show Add Song Modal
    function showAddSongModal() {
        addSongModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Hide Add Song Modal
    function hideAddSongModal() {
        addSongModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Add New Song
    function addNewSong(e) {
        e.preventDefault();
        
        const title = document.getElementById('song-title-input').value;
        const artist = document.getElementById('song-artist-input').value;
        const audioFile = document.getElementById('song-file-input').files[0];
        const coverFile = document.getElementById('album-art-input').files[0];
        const lyrics = document.getElementById('song-lyrics-input').value;
        
        if (!title || !artist || !audioFile) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Create object URL for audio file
        const audioSrc = URL.createObjectURL(audioFile);
        let coverSrc = 'assets/images/default-cover.jpg';
        
        if (coverFile) {
            coverSrc = URL.createObjectURL(coverFile);
        }
        
        // Add new song to playlist
        const newSong = {
            title,
            artist,
            src: audioSrc,
            cover: coverSrc,
            duration: '0:00',
            lyrics: lyrics || "No lyrics available"
        };
        
        songs.push(newSong);
        renderPlaylist();
        
        // Reset form
        addSongForm.reset();
        hideAddSongModal();
        
        // If this is the first song, play it
        if (songs.length === 1) {
            currentSongIndex = 0;
            loadSong(currentSongIndex);
        }
    }

    // Render Playlist
    function renderPlaylist() {
        playlistEl.innerHTML = '';
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${song.title} - ${song.artist}</span>
                <span class="song-duration">${song.duration}</span>
            `;
            li.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(currentSongIndex);
                playSong();
            });
            playlistEl.appendChild(li);
        });
    }

    // Update Active Song in Playlist
    function updateActiveSong() {
        const playlistItems = playlistEl.querySelectorAll('li');
        playlistItems.forEach((item, index) => {
            item.classList.toggle('playing', index === currentSongIndex);
        });
    }

    // Toggle Theme
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    // Initialize Audio Context for Equalizer
    function initAudioContext() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            
            // Create analyser node
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            
            // Create media element source
            const source = audioContext.createMediaElementSource(audio);
            
            // Connect nodes
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            // Create data array for visualization
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        } catch (e) {
            console.log("Audio Context not supported:", e);
        }
    }

    // Start Visualizer
    function startVisualizer() {
        if (!analyser) return;
        
        // Clear any previous animation
        cancelAnimationFrame(animationId);
        
        // Draw visualization
        function draw() {
            animationId = requestAnimationFrame(draw);
            
            analyser.getByteFrequencyData(dataArray);
            
            // Here you could update a visualizer if you had one
            // For example, update CSS variables or canvas drawing
        }
        
        draw();
    }

    // Apply EQ Preset
    function applyEqPreset(e) {
        const preset = e.target.dataset.preset;
        const values = {
            flat: [0, 0, 0, 0, 0, 0],
            pop: [4, 2, -2, -1, 2, 3],
            rock: [6, 3, -3, 1, 4, 2],
            jazz: [2, 4, 1, -1, -2, 2],
            classical: [3, 1, 0, 0, 1, 4]
        };
        
        if (values[preset]) {
            eqSliders.forEach((slider, index) => {
                slider.value = values[preset][index];
                // Here you would normally apply these to your audio nodes
                // For demo purposes, we're just setting the slider values
            });
        }
    }

    // Load Saved Preferences
    function loadPreferences() {
        // Theme
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
        
        // Volume
        const savedVolume = localStorage.getItem('volume');
        if (savedVolume) {
            audio.volume = savedVolume;
            volumeSlider.value = savedVolume;
        }
        
        // Shuffle
        const savedShuffle = localStorage.getItem('shuffle');
        if (savedShuffle === 'true') {
            isShuffle = true;
            shuffleBtn.classList.add('active');
        }
        
        // Repeat
        const savedRepeat = localStorage.getItem('repeat');
        if (savedRepeat === 'true') {
            isRepeat = true;
            repeatBtn.classList.add('active');
        }
    }

    // Initialize the player
    loadPreferences();
    initPlayer();
});





// DOM Elements
const musicPlayer = document.querySelector('.music-player');
const albumArt = document.getElementById('album-art');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const volumeSlider = document.getElementById('volume-slider');
const playlist = document.getElementById('playlist');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const lyricsBtn = document.getElementById('lyrics-btn');
const equalizerBtn = document.getElementById('equalizer-btn');
const shareBtn = document.getElementById('share-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const visualizer = document.getElementById('visualizer');
const themeToggle = document.querySelector('.theme-toggle');
const toggleSwitch = document.querySelector('.toggle-switch');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const loginBtn = document.querySelector('.login-btn');
const signupBtn = document.querySelector('.signup-btn');
const showLogin = document.querySelector('.show-login');
const showSignup = document.querySelector('.show-signup');
const closeModals = document.querySelectorAll('.close-modal');
const lyricsModal = document.querySelector('.lyrics-modal');
const equalizerModal = document.querySelector('.equalizer-modal');
const addSongModal = document.querySelector('.add-song-modal');
const addPlaylistModal = document.querySelector('.add-playlist-modal');
const shareModal = document.querySelector('.share-modal');
const addSongBtn = document.getElementById('add-song-btn');
const addPlaylistBtn = document.querySelector('.add-playlist-btn');

// Audio Context and Analyser
let audioContext;
let analyser;
let dataArray;
let source;
let isAudioContextInitialized = false;

// Initialize the audio context
function initAudioContext() {
  if (!isAudioContextInitialized) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    isAudioContextInitialized = true;
  }
}

// Audio Element
const audio = new Audio();

// Current song index
let currentSongIndex = 0;
let isPlaying = false;
let isShuffled = false;
let isRepeated = false;

// Sample music library
const songs = [
  {
    title: "Blinding Lights",
    artist: "The Weeknd",
    src: "assets/music/blinding-lights.mp3",
    cover: "assets/images/album1.jpg",
    duration: "3:20",
    lyrics: "I've been tryna call\nI've been on my own for long enough\nMaybe you can show me how to love, maybe\nI'm going through withdrawals\nYou don't even have to do too much\nYou can turn me on with just a touch, baby",
    genre: "pop"
  },
  {
    title: "Save Your Tears",
    artist: "The Weeknd",
    src: "assets/music/save-your-tears.mp3",
    cover: "assets/images/album2.jpg",
    duration: "3:35",
    lyrics: "I saw you dancing in a crowded room\nYou look so happy when I'm not with you\nBut then you saw me, caught you by surprise\nA single teardrop falling from your eye",
    genre: "pop"
  },
  {
    title: "Levitating",
    artist: "Dua Lipa",
    src: "assets/music/levitating.mp3",
    cover: "assets/images/album3.jpg",
    duration: "3:23",
    lyrics: "If you wanna run away with me, I know a galaxy\nAnd I can take you for a ride\nI had a premonition that we fell into a rhythm\nWhere the music don't stop for life",
    genre: "pop"
  },
  {
    title: "Don't Start Now",
    artist: "Dua Lipa",
    src: "assets/music/dont-start-now.mp3",
    cover: "assets/images/album4.jpg",
    duration: "3:03",
    lyrics: "Did a full 180, crazy\nThinking 'bout the way I was\nDid the heartbreak change me? Maybe\nBut look at where I ended up",
    genre: "pop"
  },
  {
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    src: "assets/music/watermelon-sugar.mp3",
    cover: "assets/images/album5.jpg",
    duration: "2:54",
    lyrics: "Tastes like strawberries on a summer evenin'\nAnd it sounds just like a song\nI want more berries and that summer feelin'\nIt's so wonderful and warm",
    genre: "pop"
  }
];

// Initialize the player
function initPlayer() {
  loadSong(currentSongIndex);
  renderPlaylist();
  updatePlayerTheme();
  setupEventListeners();
  initializeParticles();
}

// Load a song into the player
function loadSong(index) {
  const song = songs[index];
  audio.src = song.src;
  albumArt.src = song.cover;
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  
  // Update active song in playlist
  const playlistItems = playlist.querySelectorAll('li');
  playlistItems.forEach(item => item.classList.remove('playing'));
  playlistItems[index].classList.add('playing');
  
  // Initialize audio context when first song loads
  if (!isAudioContextInitialized) {
    initAudioContext();
  }
}

// Play the current song
function playSong() {
  musicPlayer.classList.add('playing');
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  audio.play();
  isPlaying = true;
  updateVisualizer();
}

// Pause the current song
function pauseSong() {
  musicPlayer.classList.remove('playing');
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
  audio.pause();
  isPlaying = false;
}

// Toggle play/pause
function togglePlay() {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

// Go to previous song
function prevSong() {
  currentSongIndex--;
  if (currentSongIndex < 0) {
    currentSongIndex = songs.length - 1;
  }
  loadSong(currentSongIndex);
  if (isPlaying) {
    playSong();
  }
}

// Go to next song
function nextSong() {
  if (isShuffled) {
    playRandomSong();
    return;
  }
  
  currentSongIndex++;
  if (currentSongIndex > songs.length - 1) {
    if (isRepeated) {
      currentSongIndex = 0;
    } else {
      currentSongIndex = songs.length - 1;
      pauseSong();
      return;
    }
  }
  loadSong(currentSongIndex);
  if (isPlaying) {
    playSong();
  }
}

// Play a random song
function playRandomSong() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * songs.length);
  } while (newIndex === currentSongIndex && songs.length > 1);
  
  currentSongIndex = newIndex;
  loadSong(currentSongIndex);
  if (isPlaying) {
    playSong();
  }
}

// Toggle shuffle
function toggleShuffle() {
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle('active', isShuffled);
}

// Toggle repeat
function toggleRepeat() {
  isRepeated = !isRepeated;
  repeatBtn.classList.toggle('active', isRepeated);
}

// Update progress bar
function updateProgress() {
  const { duration, currentTime } = audio;
  const progressPercent = (currentTime / duration) * 100;
  progressBar.style.width = `${progressPercent}%`;
  
  // Update time display
  const durationMinutes = Math.floor(duration / 60);
  let durationSeconds = Math.floor(duration % 60);
  if (durationSeconds < 10) {
    durationSeconds = `0${durationSeconds}`;
  }
  
  // Avoid NaN display
  if (durationSeconds) {
    durationEl.textContent = `${durationMinutes}:${durationSeconds}`;
  }
  
  const currentMinutes = Math.floor(currentTime / 60);
  let currentSeconds = Math.floor(currentTime % 60);
  if (currentSeconds < 10) {
    currentSeconds = `0${currentSeconds}`;
  }
  currentTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;
}

// Set progress when clicking on progress bar
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
}

// Update volume
function setVolume() {
  audio.volume = volumeSlider.value;
}

// Render playlist
function renderPlaylist() {
  playlist.innerHTML = '';
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="song-title">${song.title}</span>
      <span class="song-duration">${song.duration}</span>
    `;
    li.addEventListener('click', () => {
      currentSongIndex = index;
      loadSong(currentSongIndex);
      playSong();
    });
    playlist.appendChild(li);
  });
}

// Update visualizer
function updateVisualizer() {
  if (!isAudioContextInitialized || !isPlaying) return;
  
  analyser.getByteFrequencyData(dataArray);
  
  // Clear previous visualizer
  visualizer.innerHTML = '';
  
  // Create bars based on frequency data
  const barCount = 30;
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement('div');
    bar.classList.add('wave-bar');
    
    // Map frequency data to bars (simplified)
    const dataIndex = Math.floor(i * (dataArray.length / barCount));
    const height = dataArray[dataIndex] / 255 * 40;
    
    bar.style.height = `${height}px`;
    bar.style.left = `${i * (100 / barCount)}%`;
    bar.style.width = `${(100 / barCount) - 1}%`;
    bar.style.backgroundColor = `hsl(${height * 3}, 100%, 50%)`;
    
    visualizer.appendChild(bar);
  }
  
  requestAnimationFrame(updateVisualizer);
}

// Show lyrics modal
function showLyrics() {
  const lyricsText = document.getElementById('lyrics-text');
  lyricsText.textContent = songs[currentSongIndex].lyrics || "Lyrics not available";
  lyricsModal.classList.add('show');
}

// Show equalizer modal
function showEqualizer() {
  equalizerModal.classList.add('show');
}

// Show add song modal
function showAddSongModal() {
  addSongModal.classList.add('show');
}

// Show add playlist modal
function showAddPlaylistModal() {
  addPlaylistModal.classList.add('show');
}

// Show share modal
function showShareModal() {
  const shareUrl = document.getElementById('share-url');
  const embedCode = document.getElementById('embed-code');
  
  shareUrl.value = `${window.location.origin}?song=${encodeURIComponent(songs[currentSongIndex].title)}`;
  embedCode.value = `<iframe src="${shareUrl.value}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
  
  shareModal.classList.add('show');
}

// Toggle theme (dark/light mode)
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  updatePlayerTheme();
}

// Update player theme based on current mode
function updatePlayerTheme() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  themeToggle.querySelector('.fa-moon').style.color = isDarkMode ? 'var(--primary-color)' : 'var(--text-color)';
  themeToggle.querySelector('.fa-sun').style.color = isDarkMode ? 'var(--text-color)' : 'var(--primary-color)';
}


// Setup event listeners
function setupEventListeners() {
  // Player controls
  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', prevSong);
  nextBtn.addEventListener('click', nextSong);
  audio.addEventListener('ended', nextSong);
  audio.addEventListener('timeupdate', updateProgress);
  progressBar.parentElement.addEventListener('click', setProgress);
  volumeSlider.addEventListener('input', setVolume);
  
  // Feature buttons
  shuffleBtn.addEventListener('click', toggleShuffle);
  repeatBtn.addEventListener('click', toggleRepeat);
  lyricsBtn.addEventListener('click', showLyrics);
  equalizerBtn.addEventListener('click', showEqualizer);
  shareBtn.addEventListener('click', showShareModal);
  favoriteBtn.addEventListener('click', () => {
    favoriteBtn.classList.toggle('active');
  });
  

  
  // Modal controls
  loginBtn.addEventListener('click', () => loginModal.classList.add('show'));
  signupBtn.addEventListener('click', () => signupModal.classList.add('show'));
  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.classList.remove('show');
    loginModal.classList.add('show');
  });
  showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.classList.remove('show');
    signupModal.classList.add('show');
  });
  
  closeModals.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.auth-modal, .lyrics-modal, .equalizer-modal, .add-song-modal, .add-playlist-modal, .share-modal').forEach(modal => {
        modal.classList.remove('show');
      });
    });
  });
  
  // Add song/playlist buttons
  addSongBtn.addEventListener('click', showAddSongModal);
  addPlaylistBtn.addEventListener('click', showAddPlaylistModal);
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('auth-modal') || 
        e.target.classList.contains('lyrics-modal') || 
        e.target.classList.contains('equalizer-modal') || 
        e.target.classList.contains('add-song-modal') || 
        e.target.classList.contains('add-playlist-modal') || 
        e.target.classList.contains('share-modal')) {
      e.target.classList.remove('show');
    }
  });
  
  // Copy share link
  document.getElementById('copy-link-btn').addEventListener('click', () => {
    const shareUrl = document.getElementById('share-url');
    shareUrl.select();
    document.execCommand('copy');
    
    // Show toast notification
    showToast('Link copied to clipboard!');
  });
  
  // Equalizer presets
  document.querySelectorAll('.eq-preset').forEach(preset => {
    preset.addEventListener('click', () => {
      const presetType = preset.dataset.preset;
      // In a real app, you would apply actual EQ settings here
      showToast(`${presetType.charAt(0).toUpperCase() + presetType.slice(1)} preset applied`);
    });
  });
  
  // Add song form submission
  document.getElementById('add-song-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // In a real app, you would handle file uploads and add to library
    showToast('Song added to library!');
    addSongModal.classList.remove('show');
  });
  
  // Add playlist form submission
  document.getElementById('add-playlist-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Playlist created!');
    addPlaylistModal.classList.remove('show');
  });
  
  // Login form submission
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Logged in successfully!');
    loginModal.classList.remove('show');
  });
  
  // Signup form submission
  document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Account created successfully!');
    signupModal.classList.remove('show');
  });
}

// Show toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}

// Initialize the player when DOM is loaded
document.addEventListener('DOMContentLoaded', initPlayer);









// User Authentication System
const users = JSON.parse(localStorage.getItem('harmonyFlowUsers')) || [];

// Check authentication status
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('harmonyFlowLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop();
    
    if (isLoggedIn && (currentPage === 'login.html' || currentPage === 'signup.html')) {
        window.location.href = 'index.html';
    } else if (!isLoggedIn && currentPage === 'index.html') {
        window.location.href = 'login.html';
    }
}

// Handle Login
function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.querySelector('#login-form input[type="checkbox"]').checked;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Find user in database
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        alert('Invalid email or password');
        return;
    }
    
    // Store session
    localStorage.setItem('harmonyFlowLoggedIn', 'true');
    localStorage.setItem('harmonyFlowCurrentUser', JSON.stringify(user));
    
    // Redirect to player
    window.location.href = 'index.html';
}

// Handle Signup
function handleSignup() {
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const musicTaste = document.getElementById('music-taste');
    const selectedGenres = Array.from(musicTaste.selectedOptions).map(option => option.value);
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (selectedGenres.length === 0) {
        alert('Please select at least one music genre');
        return;
    }
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
        alert('User with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        firstName,
        lastName,
        email,
        password,
        musicTaste: selectedGenres,
        createdAt: new Date().toISOString()
    };
    
    // Add to database
    users.push(newUser);
    localStorage.setItem('harmonyFlowUsers', JSON.stringify(users));
    
    // Store session
    localStorage.setItem('harmonyFlowLoggedIn', 'true');
    localStorage.setItem('harmonyFlowCurrentUser', JSON.stringify(newUser));
    
    // Redirect to player
    window.location.href = 'index.html';
}

// Logout Function
function logout() {
    localStorage.removeItem('harmonyFlowLoggedIn');
    localStorage.removeItem('harmonyFlowCurrentUser');
    window.location.href = 'login.html';
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuthStatus();
    
    // Set up login form if it exists
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Set up signup form if it exists
    if (document.getElementById('signup-form')) {
        document.getElementById('signup-form').addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup();
        });
    }
    
    // Set up logout button if it exists
    if (document.querySelector('.logout-btn')) {
        document.querySelector('.logout-btn').addEventListener('click', logout);
    }
    
    // Initialize player if on player page
    if (document.querySelector('.music-player')) {
        initializePlayer();
    }
});

// Player initialization function (same as before)
function initializePlayer() {
    // ... (your existing player initialization code)
}




