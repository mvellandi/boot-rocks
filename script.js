// Initialize Vimeo Player
const player = new Vimeo.Player("vimeo-player", {
  id: 1070758632,
  width: 1024,
  playerOptions: {
    autoplay: false,
    controls: true,
    playsinline: true,
  },
});

// DOM Elements
const contentCarousel = document.querySelector(".content-carousel");
const navContent = document.querySelector(".nav-content");
const navToggle = document.querySelector(".nav-toggle");
const sections = document.querySelectorAll(".content-carousel section");
const navItems = document.querySelectorAll(".nav-item");
const contentSection = document.querySelector(".content-section");

// State
let currentSegment = 0;
let isNavigating = false;

// Helper function to get section index from ID
function getIndexFromId(id) {
  return Array.from(sections).findIndex((section) => section.id === id);
}

// Update active section
function updateActiveSection(index) {
  // Update content sections
  sections.forEach((section, i) => {
    section.classList.toggle("active", i === index);
  });

  // Update navigation items
  navItems.forEach((item, i) => {
    item.classList.toggle("active", i === index);
  });

  currentSegment = index;
}

// Navigate to specific segment
function navigateToSegment(index) {
  if (index === currentSegment) return;

  const targetSection = sections[index];
  if (!targetSection) return;

  isNavigating = true;
  player
    .pause()
    .then(() => {
      const startTime = parseFloat(targetSection.dataset.start);
      return player.setCurrentTime(startTime);
    })
    .then(() => {
      // Start playing the video
      return player.play();
    })
    .then(() => {
      updateActiveSection(index);
      updateHashFromIndex(index);

      // Close mobile navigation if open
      navContent.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");

      // Reset navigation flag after transition
      setTimeout(() => {
        isNavigating = false;
      }, 500);
    })
    .catch((error) => {
      console.error("Error navigating to segment:", error);
      isNavigating = false;
    });
}

// Handle video time updates
player.on("timeupdate", (event) => {
  if (isNavigating) return;

  const currentTime = event.seconds;
  const newSegment = Array.from(sections).findIndex((section) => {
    const start = parseFloat(section.dataset.start);
    const end = parseFloat(section.dataset.end);
    return currentTime >= start && currentTime < end;
  });

  if (newSegment !== -1 && newSegment !== currentSegment) {
    updateActiveSection(newSegment);
    updateHashFromIndex(newSegment);
  }
});

// Update URL hash using section ID
function updateHashFromIndex(index) {
  const section = sections[index];
  if (section) {
    history.replaceState(null, null, `#${section.id}`);
  }
}

// Mobile navigation toggle
navToggle.addEventListener("click", () => {
  const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", !isExpanded);
  navContent.classList.toggle("active");
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Prevent default hash scroll
  if (window.location.hash) {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }

  // Initialize click handlers for navigation first
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const index = parseInt(item.dataset.segment);
      if (!isNaN(index)) {
        navigateToSegment(index);
      }
    });
  });

  // Wait for player to be ready before doing anything
  player
    .ready()
    .then(() => {
      const hash = window.location.hash.slice(1);
      let initialIndex = 0;

      if (hash !== "") {
        // Try to match ID first
        let index = getIndexFromId(hash);

        // If no ID match, try to parse as index
        if (index === -1) {
          const numericIndex = parseInt(hash);
          if (
            !isNaN(numericIndex) &&
            numericIndex >= 0 &&
            numericIndex < sections.length
          ) {
            index = numericIndex;
          }
        }

        // Ensure we have a valid index
        if (index >= 0 && index < sections.length) {
          initialIndex = index;
        }
      }

      // Show content section
      contentSection.classList.add("loaded");

      // Update UI state before setting video time
      updateActiveSection(initialIndex);
      updateHashFromIndex(initialIndex);

      // Set initial video position
      return player.setCurrentTime(
        parseFloat(sections[initialIndex].dataset.start)
      );
    })
    .catch((error) => {
      console.error("Error during initialization:", error);
      // Show content and initialize with first section in case of error
      contentSection.classList.add("loaded");
      updateActiveSection(0);
      updateHashFromIndex(0);
      window.scrollTo(0, 0);
    });
});

// Also prevent scroll on hash changes
window.addEventListener("hashchange", (e) => {
  e.preventDefault();
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});

// Handle URL hash changes
function handleHashChange() {
  const hash = window.location.hash.slice(1);
  if (hash === "") return;

  // Try to match ID first
  let index = getIndexFromId(hash);

  // If no ID match, try to parse as index
  if (index === -1) {
    const numericIndex = parseInt(hash);
    if (
      !isNaN(numericIndex) &&
      numericIndex >= 0 &&
      numericIndex < sections.length
    ) {
      index = numericIndex;
    }
  }

  // If we found a valid index, navigate to it
  if (index >= 0 && index < sections.length) {
    isNavigating = true;
    updateActiveSection(index);

    // Set video position without playing
    player
      .setCurrentTime(parseFloat(sections[index].dataset.start))
      .then(() => {
        setTimeout(() => {
          isNavigating = false;
        }, 500);
      })
      .catch((error) => {
        console.error("Error setting initial time:", error);
        isNavigating = false;
      });
  }
}

// Listen for hash changes
window.addEventListener("hashchange", handleHashChange);
