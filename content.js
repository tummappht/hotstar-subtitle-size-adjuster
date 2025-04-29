(() => {
  if (window.hasRun) {
    return; // Prevent the script from running multiple times
  }
  window.hasRun = true;

  let currentFontSize = localStorage.getItem("subtitleFontSize") || "1.5rem"; // Load saved font size or default to 1.5rem

  function injectModal() {
    if (document.getElementById("subtitle-font-modal")) {
      // If the modal already exists, just show it
      document.getElementById("subtitle-font-modal").style.display = "block";
      return;
    }

    const modal = document.createElement("div");
    modal.id = "subtitle-font-modal";
    modal.style.position = "fixed";
    modal.style.top = "10%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, 0)";
    modal.style.backgroundColor = "rgba(20, 20, 20, 0.95)";
    modal.style.color = "white";
    modal.style.padding = "20px";
    modal.style.borderRadius = "12px";
    modal.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    modal.style.zIndex = "10000";
    modal.style.width = "300px";
    modal.style.fontFamily = "Arial, sans-serif";
    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <label for="subtitle-size-slider" style="font-size: 16px; font-weight: bold;">Subtitle Size: <span id="subtitle-size-label" style="font-weight: normal;">${currentFontSize}</span></label>
        <button id="subtitle-modal-close" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0;">×</button>
      </div>
      <input
        type="range"
        id="subtitle-size-slider"
        min="0.5"
        max="4"
        step="0.1"
        value="${parseFloat(currentFontSize)}"
        style="width: 100%; margin-top: 8px; appearance: none; height: 6px; background: #444; border-radius: 5px; outline: none; transition: background 0.3s;"
      />
      <button id="reset-font-size" style="margin-top: 15px; padding: 8px 12px; background-color: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; width: 100%; transition: background-color 0.3s;">
        Reset to Default
      </button>
    `;
    document.body.appendChild(modal);
    attachModalEvents();

    // Close modal when clicking outside of it
    window.addEventListener("click", closeModalOnOutsideClick);
  }

  function updateSubtitleSize(size) {
    const subtitles = document.querySelectorAll("#video-container span"); // Update this selector if needed
    if (subtitles.length > 0) {
      subtitles.forEach((el) => {
        el.style.fontSize = size;
      });
      localStorage.setItem("subtitleFontSize", size); // Save the font size
    }
  }

  function resetSubtitleSize() {
    const subtitles = document.querySelectorAll("#video-container span"); // Update this selector if needed
    if (subtitles.length > 0) {
      subtitles.forEach((el) => {
        el.style.fontSize = "var(--VIDEO-SUBTITLE-FONT-SIZE)"; // Reset to default font size
      });
      localStorage.removeItem("subtitleFontSize"); // Remove saved font size
      currentFontSize = "var(--VIDEO-SUBTITLE-FONT-SIZE)";

      // Get the computed value of the CSS variable
      const computedFontSize = getComputedStyle(document.documentElement)
        .getPropertyValue("--VIDEO-SUBTITLE-FONT-SIZE")
        .trim();

      const slider = document.getElementById("subtitle-size-slider");
      const label = document.getElementById("subtitle-size-label");

      slider.value = parseFloat(computedFontSize) || 1.5; // Reset slider to default value or fallback to 1.5
      label.textContent = computedFontSize || "1.5rem"; // Display the computed font size or fallback
    }
  }

  function attachModalEvents() {
    const slider = document.getElementById("subtitle-size-slider");
    const label = document.getElementById("subtitle-size-label");
    const closeButton = document.getElementById("subtitle-modal-close");
    const resetButton = document.getElementById("reset-font-size");

    slider.addEventListener("input", () => {
      const value = `${slider.value}rem`;
      label.textContent = value;
      currentFontSize = value;
      updateSubtitleSize(currentFontSize);
    });

    closeButton.addEventListener("click", () => {
      closeModal();
    });

    resetButton.addEventListener("click", () => {
      resetSubtitleSize();
    });

    updateSubtitleSize(currentFontSize); // Apply the saved font size on modal open
  }

  function closeModal() {
    const modal = document.getElementById("subtitle-font-modal");
    if (modal) {
      modal.style.display = "none";
      window.removeEventListener("click", closeModalOnOutsideClick); // Remove the outside click listener
    }
  }

  function closeModalOnOutsideClick(event) {
    const modal = document.getElementById("subtitle-font-modal");
    if (modal && !modal.contains(event.target)) {
      closeModal();
    }
  }

  function applyFontSizeWithDelay() {
    const interval = setInterval(() => {
      const subtitles = document.querySelectorAll("#video-container span"); // Update this selector if needed
      if (subtitles.length > 0) {
        updateSubtitleSize(currentFontSize);
        clearInterval(interval); // Stop checking once subtitles are found
      }
    }, 500); // Check every 500ms
  }

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "openModal") {
      injectModal();
    }
  });

  // Apply the saved font size on page load with a delay
  applyFontSizeWithDelay();
})();
