// Constants
const textRegion = document.getElementsByClassName("text-region");
const userText = document.getElementById("user-text");
const targetText = document.getElementById("target-text");
const timer = document.getElementById("timer");
const timerLabel = document.querySelector('label[for="timer"]');
const wpm = document.getElementById("wpm");
const wpmLabel = document.querySelector('label[for="wpm"]');
const reset = document.getElementById("reset");
const defaultTime = 30; // The default time of the typing test
const numRandomWords = Math.round((targetText.clientWidth + targetText.clientHeight) / 12); // The number of random words to be called by the API

// Variables
var startedTest = false;
var initialTime = timer.value; // Value stored in the time input
var testTime = 0; // Time taken for the test
var correctStored = 0; // Number of correct characters stored when random words refreshed on the same test
var dataMain; // The random word data being displayed
var dataSide; // A queued set of random words (for reset performance)

// API
const randomWordsAPI = "https://random-word-api.vercel.app/api?words=" + numRandomWords; // More common words API (faster)
// const randomWordsAPI = "https://random-word-api.herokuapp.com/word?number=" + numRandomWords; // More uncommon words API (slower)

// Actions when loading the webpage
window.onload = () => {
  timer.value = defaultTime;
  getRandomWords();
};

// Keyboard inputs
document.addEventListener("keydown", (e) => {
  // Reset the typing test by pressing Esc key
  if (e.code === "Escape") {
    resetTypingTest();
  }
});

// Disable moving text cursor with mouse click
userText.addEventListener("mousedown", (e) => {
  if (startedTest) {
    e.preventDefault();
    userText.focus();
  }
});

// Disable moving text cursor with arrow keys and full word delete
userText.addEventListener("keydown", (e) => {
  startTypingTest();

  if (startedTest) {
    if (e.code === "ArrowLeft" || e.code === "ArrowUp" || e.code === "ArrowRight" || e.code === "ArrowDown" || (e.ctrlKey || e.metaKey) && e.code === "Backspace") {
      e.preventDefault();
    }
  }
});

// Darken text colour when text region is focused
userText.addEventListener("focusin", () => {
  if (!startedTest) {
    textRegion[0].classList.remove("unfocused");
  }
});

// Lighten text colour when text region is unfocused
userText.addEventListener("focusout", () => {
  if (!startedTest) {
    textRegion[0].classList.add("unfocused");
  }
});

// Check if the user text matches the target text
userText.addEventListener("input", () => {
  let userChars; // The chars of the user text
  let targetChars; // The chars of the target text

  targetChars = document.querySelectorAll(".target-char");
  targetChars = Array.from(targetChars); // Create an array from <span> elements
  userChars = userText.value.split(""); // Array of user text

  targetChars.forEach((char, index) => {
    if (char.innerText === userChars[index]) { // If user text char matches target text char
      char.classList.add("correct");
    } else if (userChars[index] == null) { // No user text written
      if (char.classList.contains("correct")) {
        char.classList.remove("correct");
      } else {
        char.classList.remove("incorrect");
      }
    } else { // If user text char does not match target text char
      if (!char.classList.contains("incorrect")) {
        char.classList.add("incorrect");
      }
    }
  });

  // Generate new set of words when the visible words have been filled
  if (userText.value.length === targetChars.length) {
    correctStored += document.querySelectorAll(".correct").length;
    switchRandomWords();
    userText.value = "";
  }
});

// Fetch random words from the API
const getRandomWords = async () => {
  if (dataMain == null) {
    const response = await fetch(randomWordsAPI);
    dataMain = await response.json();
  }

  let randomWordsArray = dataMain; // Array of random words fetched from the API
  let randomWordsString = randomWordsArray.join(" "); // Convert array of words into single string

  // Split the string into <span> elements to allow changing colours of individual chars
  let randomWordsChars = randomWordsString.split("").map((targetChar) => {
    return "<span class='target-char'>" + targetChar + "</span>"; // Return the char <span> element
  });

  targetText.innerHTML = randomWordsChars.join(""); // Set target text to the string of random words
  removeOverflow();

  const response = await fetch(randomWordsAPI);
  dataSide = await response.json(); // Queue next set of random words (for reset performance)
};

// Switch current words with queued ones
const switchRandomWords = () => {
  dataMain = dataSide;
  getRandomWords();
};

// Remove overflow of words
const removeOverflow = () => {
  while (true) {
    const lastElem = targetText.lastElementChild;

    if (lastElem) {
      const lastChar = lastElem.innerText.trim();

      if (targetText.scrollHeight > targetText.clientHeight || (lastChar !== " " && lastChar !== "")) {
        targetText.removeChild(lastElem);
      } else {
        break;
      }
    } else {
      break;
    }
  }
};

// Set the timer
const startTimer = () => {
  typingTimer = setInterval(updateTimer, 1000);
};

// Update the timer
const updateTimer = () => {
  if (timer.value == 0) {
    endTypingTest();
  } else {
    timer.value--;
    testTime++;
  }
};

// Reset the typing test
const resetTypingTest = () => {
  clearInterval(typingTimer);
  switchRandomWords();
  userText.value = "";
  userText.removeAttribute("readonly");
  timer.value = initialTime;
  timer.removeAttribute("disabled");
  timer.style.color = "var(--off-grey)";
  timer.style.border = "0.1rem solid var(--side-grey)";
  timerLabel.style.color = "var(--main-grey)";
  wpm.value = "";
  wpm.style.border = "0.1rem solid transparent";
  wpmLabel.style.color = "var(--off-grey)";
  startedTest = false;
  testTime = 0;
  correctStored = 0;
};

// Reset the typing test when clicking the shortcut hint
reset.onclick = () => {
  textRegion[0].classList.add("unfocused");
  resetTypingTest();
};

// Start the typing test
const startTypingTest = () => {
  if (startedTest) {
    return;
  }

  initialTime = parseInt(timer.value);

  if (initialTime < 0) {
    initialTime = Math.abs(initialTime);
    timer.value = initialTime;
  }

  if (isNaN(initialTime)) {
    initialTime = defaultTime;
    timer.value = initialTime;
  }

  removeOverflow();

  timer.setAttribute("disabled", "true");
  timer.style.color = "var(--main-grey)";
  timer.style.border = "0.1rem solid transparent";
  startedTest = true;
  startTimer();
};

// End the typing test
const endTypingTest = () => {
  clearInterval(typingTimer);
  userText.setAttribute("readonly", "true");
  timer.style.color = "var(--off-grey)";
  timerLabel.style.color = "var(--off-grey)";
  wpm.style.border = "0.1rem solid var(--side-grey)";
  wpmLabel.style.color = "var(--main-grey)";

  // Calculate the WPM (incorrect > correct -> negative WPM -> 0)
  const totalChars = document.querySelectorAll(".correct").length;
  wpm.value = (testTime > 0) ? Math.max(Math.round((totalChars + correctStored) / 5 / (testTime / 60)), 0) : 0;
};
