// Constants
const keys = document.querySelectorAll(".key");
const easy = document.getElementById("easy");
const normal = document.getElementById("normal");
const hard = document.getElementById("hard");
const reactionTime = document.getElementById("reaction-time");
const reactionTimeLabel = document.querySelector('label[for="reaction-time"]');
const reactionTimeListContainer = document.getElementById("reaction-time-list-container");
const reactionTimeList = document.querySelectorAll(".reaction-time-list");
const beginPromptContainer = document.getElementById("begin-prompt-container");
const beginPrompt = document.getElementById("begin-prompt");
const reset = document.getElementById("reset");
const keyMap = {};
const activeKeys = [];
const maxTests = reactionTimeList.length // Number of tests in a run
const minTime = 1000 // Min time between tests in a run
const maxTime = 4000 // Max time between tests in a run

// Variables
var times = []; // All the test times in a run
var startedTest = false;

// Actions when loading the webpage
window.onload = () => {
    checkMode();
};

// Add every keyboard key to a map
keys.forEach(key => {
    keyMap[key.id] = key;
});

// Keyboard inputs
document.addEventListener("keydown", function (e) {
    // Disable non-essential keyboard commands
    if (!(e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }

    const key = keyMap[e.code] || keyMap[e.key];

    // Reset the reaction test by pressing Esc key
    if (key != keyMap["Escape"]) {
        startReactionTest();
    } else {
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
    keys.forEach(key => {
        key.classList.remove("hidden");
    });

    if (easy.checked) {
        // Hide all normal and hard keys
        document.querySelectorAll(".normal-key, .hard-key").forEach(key => {
            key.classList.add("hidden");
        });
    } else if (normal.checked) {
        // Hide all hard keys
        document.querySelectorAll(".hard-key").forEach(key => {
            key.classList.add("hidden");
        });
    }

    checkActiveKeys();
    resetReactionTest();
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

// Return a random active key
const getRandomKey = () => {
    return activeKeys[Math.floor(Math.random() * activeKeys.length)].id;
};

// Return a random time between tests within constraints
const getRandomTime = () => {
    return Math.floor((maxTime - minTime) * Math.random()) + minTime;
};

// Return the average reaction time
const getAverageReactionTime = () => {
    totalTime = 0;

    times.forEach(time => {
        totalTime += time;
    });

    return Math.round(totalTime / times.length);
};

// Switch top prompt
const switchPrompt = () => {
    if (!startedTest) {
        beginPromptContainer.classList.remove("hidden");
        reactionTimeListContainer.classList.add("hidden");
    } else {
        beginPromptContainer.classList.add("hidden");
        reactionTimeListContainer.classList.remove("hidden");
    }
};

// Reset the reaction test
const resetReactionTest = () => {
    keys.forEach(key => {
        key.classList.remove("press");
        key.classList.remove("pressed");
        key.classList.remove("to-press");
    })

    reactionTime.value = "";
    reactionTime.style.border = "0.1rem solid transparent";
    
    reactionTimeList.forEach(element => {
        element.value = "";
    });

    startedTest = false;
    times.length = 0;
    switchPrompt();
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
    switchPrompt();

    // Trampoline for recursive reaction test
    await reactionTest(0);
}

// Reaction test
const reactionTest = async (numTests) => {
    if (numTests < maxTests) {
        await new Promise(resolve => setTimeout(resolve, getRandomTime()));

        const key = keyMap[getRandomKey()];
        const startTime = Date.now();
        key.classList.add("to-press");

        await new Promise(resolve => {
            const test = function (e) {
                if (key.id == e.code) {
                    const endTime = Date.now();
                    key.classList.remove("to-press");
                    times.push(endTime - startTime);
                    reactionTimeList[numTests].value = endTime - startTime + "ms";
    
                    if (numTests != maxTests - 1) {
                        reactionTimeList[numTests].style.border = "0.1rem solid var(--side-grey)";
                    }
    
                    if (numTests > 0) {
                        reactionTimeList[numTests - 1].style.border = "0.1rem solid transparent";
                    }
    
                    document.removeEventListener("keydown", test);
                    resolve();
                }
            };
    
            document.addEventListener("keydown", test);
        });

        // Recursive call for reaction test
        await reactionTest(numTests + 1);
    } else {
        endReactionTest();
    }
};

// End the reaction test
const endReactionTest = () => {
    reactionTime.value = getAverageReactionTime() + "ms";
    reactionTime.style.border = "0.1rem solid var(--side-grey)";
};
