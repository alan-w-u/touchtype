// Constants
const keys = document.querySelectorAll(".key");
const reset = document.getElementById("reset");
const keyMap = {};

// Add every keyboard key to a map
keys.forEach(key => {
    keyMap[key.id] = key;
});

// Keyboard inputs
document.addEventListener("keydown", (e) => {
    // Disable non-essential keyboard commands
    if (!(e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }

    const key = keyMap[e.code] || keyMap[e.key];

    if (key) {
        key.classList.remove("pressed");
        key.classList.add("press");
    }
});

document.addEventListener("keyup", async (e) => {
    const key = keyMap[e.code] || keyMap[e.key];

    if (key) {
        await new Promise(resolve => setTimeout(resolve, 100));
        key.classList.remove("press");
        key.classList.add("pressed");
    }
});

// Reset the keyboard test
const resetKeyboardTest = () => {
    keys.forEach(key => {
        key.classList.remove("press");
        key.classList.remove("pressed");
    })
};

// Reset the keyboard test when clicking the shortcut hint
reset.onclick = () => {
    resetKeyboardTest();
};
