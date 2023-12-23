// Constants
const easy = document.getElementById("easy");
const normal = document.getElementById("normal");
const hard = document.getElementById("hard");
const reactionTime = document.getElementById("reaction-time");
const reactionTimeLabel = document.querySelector('label[for="reaction-time"]');
const reset = document.getElementById("reset");
const keyMap = {};
const activeKeys = [];
const maxTests = 5 // Number of tests in a run
const minTime = 1000 // Min time between tests in a run
const maxTime = 4000 // Max time between tests in a run

// Variables
var times = []; // All the test times in a run
var numTests = 0; // Number of tests already done
var startedTest = false;

// Actions when loading the webpage
window.onload = () => {
    checkMode();
};

// Add every keyboard key to a map
document.querySelectorAll(".key").forEach(key => {
    keyMap[key.id] = key;
});

// Keyboard inputs
document.addEventListener("keydown", function (e) {
    // Disable non-essential keyboard commands
    if (!(e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }

    const key = keyMap[e.code] || keyMap[e.key];

    // Begin reaction test by pressing Space
    if (key == keyMap["Space"]) { 
        startReactionTest();
    }

    // Reset the reaction test by pressing Esc key
    if (key == keyMap["Escape"]) {
        resetReactionTest();
    }

    if (key) {
        key.classList.add("press");
    }

    // document.getElementById("Space").textContent = e.code; // Debug key information
});

document.addEventListener("keyup", function (e) {
    const key = keyMap[e.code] || keyMap[e.key];

    if (key) {
        key.classList.remove("press");
    }
});

// Input inputs
document.addEventListener("change", function (e) {
    if (e.target.type === "radio" && e.target.name === "mode") {
        checkMode();
    }
});

// Check the difficulty mode
const checkMode = () => {
    // Make all keys visible
    document.querySelectorAll(".key").forEach(key => {
        key.classList.remove("hidden");
    })

    if (easy.checked) {
        // Hide all normal and hard keys
        document.querySelectorAll(".normal-key, .hard-key").forEach(key => {
            key.classList.add("hidden");
        })
    } else if (normal.checked) {
        // Hide all hard keys
        document.querySelectorAll(".hard-key").forEach(key => {
            key.classList.add("hidden");
        })
    }

    checkActiveKeys();
};

// Check what keys are active given the current mode
const checkActiveKeys = () => {
    // Empty the activeKeys array
    activeKeys.length = 0;

    // Set easy keys to active
    document.querySelectorAll(".easy-key").forEach(key => {
        activeKeys.push(key);
    });

    if (normal.checked) {
        // Set normal keys to active
        document.querySelectorAll(".normal-key").forEach(key => {
            activeKeys.push(key);
        });
    } else if (hard.checked) {
        // Set normal and hard keys to active
        document.querySelectorAll(".normal-key, .hard-key").forEach(key => {
            activeKeys.push(key);
        });
    }
};

// Returns a random active key
const getRandomKey = () => {
    return activeKeys[Math.floor(Math.random() * activeKeys.length)].id;
};

// Returns a random time between tests within constraints
const getRandomTime = () => {
    return Math.floor((maxTime - minTime) * Math.random()) + minTime;
};

// Reset the reaction test
const resetReactionTest = () => {
    document.querySelectorAll(".key").forEach(key => {
        key.classList.remove("press");
        key.classList.remove("pressed");
        key.classList.remove("to-press");
    })

    reactionTime.value = "";
    startedTest = false;
    numTests = 0;
};

// Reset the reaction test when clicking the shortcut hint
reset.onclick = function () {
    resetReactionTest();
};

// Start the reaction test
const startReactionTest = async () => {
    if (startedTest) {
        return;
    }

    startedTest = true;
    
    if (numTests < maxTests) {
        reactionTest();
        numTests++;
    }

    await new Promise(resolve => setTimeout(resolve, minTime));

    endReactionTest();
}

const reactionTest = async () => {
    await new Promise(resolve => setTimeout(resolve, getRandomTime()));

    const key = keyMap[getRandomKey()];
    const startTime = Date.now();
    key.classList.add("to-press");

    function checkKey(e) {
        if (key.id == e.code) {
          const endTime = Date.now();
          key.classList.remove("to-press");
          reactionTime.value = endTime - startTime + "ms";
          document.removeEventListener("keydown", checkKey);
          startReactionTest();
        }
    }

    document.addEventListener("keydown", checkKey);
};

// End the reaction test
const endReactionTest = () => {
    reactionTime.value = "";
    startedTest = false;
    numTests = 0;
};
