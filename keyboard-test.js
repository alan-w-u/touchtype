// Constants
const reset = document.getElementById("reset");
const keyMap = {};

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

    if (keyMap[e.code]) {
        keyMap[e.code].classList.remove("pressed");
        keyMap[e.code].classList.add("press");
    }
});

document.addEventListener("keyup", async function (e) {
    if (keyMap[e.code]) {
        await new Promise(resolve => setTimeout(resolve, 100));
        keyMap[e.code].classList.remove("press");
        keyMap[e.code].classList.add("pressed");
    }
});

// Reset the keyboard test
const resetKeyboardTest = () => {
    document.querySelectorAll(".key").forEach(key => {
        key.classList.remove("press");
        key.classList.remove("pressed");
    })
};

// Reset the keyboard test when clicking the shortcut hint
reset.onclick = function () {
    resetKeyboardTest();
};
