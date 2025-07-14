document.addEventListener('DOMContentLoaded', function() {
    // Audio Context Setup
    let audioContext;
    let source;
    let analyser;
    let gainNodes = [];
    let filters = [];
    let eqSliders = document.querySelectorAll('.eq-slider');
    let eqPresets = document.querySelectorAll('.eq-preset');
    
    // Initialize Audio Context
    function initAudioContext(audioElement) {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            
            // Create source from audio element
            source = audioContext.createMediaElementSource(audioElement);
            
            // Create analyser for visualization
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            
            // Create EQ bands (6-band equalizer)
            const frequencies = [60, 150, 400, 1000, 2400, 15000]; // Hz
            
            // Create filter and gain nodes for each band
            frequencies.forEach((freq, i) => {
                // Create biquad filter
                const filter = audioContext.createBiquadFilter();
                filter.type = "peaking";
                filter.frequency.value = freq;
                filter.Q.value = 1;
                filter.gain.value = 0;
                
                // Create gain node
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 1;
                
                filters.push(filter);
                gainNodes.push(gainNode);
                
                // Connect nodes
                if (i === 0) {
                    source.connect(filter);
                } else {
                    filters[i-1].connect(filter);
                }
                
                filter.connect(gainNode);
                
                if (i === frequencies.length - 1) {
                    gainNode.connect(analyser);
                    analyser.connect(audioContext.destination);
                }
                
                // Connect slider to filter
                eqSliders[i].addEventListener('input', function() {
                    filter.gain.value = parseFloat(this.value);
                    saveEqSettings();
                });
            });
            
            // Load saved EQ settings
            loadEqSettings();
            
        } catch (e) {
            console.error("Audio Context Error:", e);
            document.querySelector('.equalizer-modal').style.display = 'none';
        }
    }
    
    // Apply EQ Preset
    function applyEqPreset(preset) {
        const presets = {
            flat: [0, 0, 0, 0, 0, 0],
            pop: [4, 2, -2, -1, 2, 3],
            rock: [6, 3, -3, 1, 4, 2],
            jazz: [2, 4, 1, -1, -2, 2],
            classical: [3, 1, 0, 0, 1, 4]
        };
        
        if (presets[preset]) {
            presets[preset].forEach((value, i) => {
                if (filters[i]) {
                    filters[i].gain.value = value;
                    eqSliders[i].value = value;
                }
            });
            saveEqSettings();
        }
    }
    
    // Save EQ settings to localStorage
    function saveEqSettings() {
        const settings = Array.from(eqSliders).map(slider => slider.value);
        localStorage.setItem('eqSettings', JSON.stringify(settings));
    }
    
    // Load EQ settings from localStorage
    function loadEqSettings() {
        const savedSettings = localStorage.getItem('eqSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            settings.forEach((value, i) => {
                if (eqSliders[i] && filters[i]) {
                    eqSliders[i].value = value;
                    filters[i].gain.value = parseFloat(value);
                }
            });
        }
    }
    
    // Initialize presets
    eqPresets.forEach(preset => {
        preset.addEventListener('click', function() {
            applyEqPreset(this.dataset.preset);
        });
    });
    
    // Visualization (optional)
    function visualize() {
        if (!analyser) return;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        // Here you could update a visualizer canvas if you had one
        // For example: drawFrequencyBars(dataArray);
        
        requestAnimationFrame(visualize);
    }
    
    // Export functions needed by main player
    window.equalizer = {
        init: initAudioContext,
        visualize: visualize
    };
});