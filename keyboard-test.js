// Constants
const keyboardDisplay = document.getElementById("keyboard-display");
const restart = document.getElementById("restart");
const keyMap = {};

// Add every key to a map
document.querySelectorAll(".key").forEach(key => {
    keyMap[key.id] = key;
})

// Keyboard inputs for the webpage
document.addEventListener("keydown", function (e) {
    // Reset the typing test by pressing ESC
    // e.preventDefault();

    if (keyMap[e.code]) {
        keyMap[e.code].classList.add("pressed");
    }
})

// Reset the keyboard test
const resetKeyboardTest = () => {
    document.querySelectorAll(".key").forEach(key => {
        key.classList.remove("pressed");
    })
}

// Reset the keybaord test when clicking the shortcut hint
restart.onclick = function () {
    resetKeyboardTest();
}
