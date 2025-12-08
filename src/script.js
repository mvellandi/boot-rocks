// Mux Player (loaded via script tag in HTML)
// No import needed - Mux player is a web component

// Constants
const MUX_PLAYBACK_ID = "WiotNBkpu2om5owi02fZhkaGAoQHlrXU3Nzf3qDHZqp8";
const DEBUG_MODE = false; // Global debug flag to prevent video playback

// State Management
let player = null;
let currentSectionId = null;
let isUserNavigating = false; // Flag to track user navigation
let playerInitialized = false;
let pageReady = false; // New flag to track page readiness
let isInitialLoad = true; // Flag to track initial page load

// Helper Functions
function getSectionStartTime(sectionId) {
  const section = document.getElementById(sectionId);
  return section ? parseFloat(section.dataset.start) : 0;
}

function getActiveSectionId(currentTime) {
  const sections = Array.from(
    document.querySelectorAll(".content-carousel section")
  );
  return sections.find((section, index) => {
    const start = parseFloat(section.dataset.start);
    const end =
      index < sections.length - 1
        ? parseFloat(sections[index + 1].dataset.start)
        : Number.MAX_SAFE_INTEGER;
    return currentTime >= start && currentTime < end;
  })?.id;
}

function updateActiveSection(sectionId) {
  if (currentSectionId === sectionId) return;

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === sectionId);
  });

  document.querySelectorAll(".mobile-menu li").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === sectionId);
  });

  document.querySelectorAll(".content-carousel section").forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });

  currentSectionId = sectionId;
}

// Event Handlers
function handleTimeUpdate({ seconds }) {
  const sectionId = getActiveSectionId(seconds);
  if (sectionId && !isUserNavigating) {
    updateActiveSection(sectionId);
    history.replaceState(null, null, `#${sectionId}`);
  }
}

// Function to ensure scroll position is at top
function ensureScrollAtTop() {
  return new Promise((resolve) => {
    if (window.scrollY === 0) {
      resolve();
      return;
    }

    window.scrollTo(0, 0);

    // Check if scroll has completed
    const checkScroll = setInterval(() => {
      if (window.scrollY === 0) {
        clearInterval(checkScroll);
        resolve();
      }
    }, 10);

    // Timeout after 1 second
    setTimeout(() => {
      clearInterval(checkScroll);
      resolve();
    }, 1000);
  });
}

// Function to show page content
function showPageContent() {
  if (pageReady) return;
  const contentSection = document.querySelector(".content-carousel");
  contentSection.classList.remove("opacity-0");
  document.body.classList.remove("no-scroll");
  pageReady = true;
}

// Initialize everything after DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  // Add no-scroll class to body for non-root routes
  const hash = window.location.hash.slice(1);
  if (hash) {
    document.body.classList.add("no-scroll");
  }

  // DOM Elements
  const navItems = document.querySelectorAll(".nav-item");
  const muxPlayer = document.getElementById("mux-player");
  const thumbnailOverlay = document.getElementById("thumbnail-overlay");

  // Handle initial navigation based on hash
  const initialSectionId = hash || "intro";
  const initialSection = document.getElementById(initialSectionId);
  const initialTime = initialSection
    ? parseFloat(initialSection.dataset.start)
    : 0;

  // Only delay render for non-root routes
  if (hash) {
    // Force scroll to top without animation
    window.scrollTo(0, 0);
    // Wait a bit to ensure scroll is complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  showPageContent();

  if (initialSection) {
    updateActiveSection(initialSectionId);
  }

  // Initialize Mux Player
  if (muxPlayer) {
    player = muxPlayer;

    try {
      // Wait for Mux player to be ready
      await new Promise((resolve) => {
        if (player.readyState >= 1) {
          resolve();
        } else {
          player.addEventListener("loadedmetadata", resolve, { once: true });
        }
      });

      playerInitialized = true;
      console.log("Player ready, seeking to:", initialTime);

      // Event Listeners
      player.addEventListener("timeupdate", () => {
        handleTimeUpdate({ seconds: player.currentTime });
      });

      // Set the initial time if needed
      if (initialTime > 0) {
        player.currentTime = initialTime;
      }

      // Hide the thumbnail overlay after player is ready
      if (thumbnailOverlay) {
        thumbnailOverlay.style.display = "none";
      }
    } catch (error) {
      console.error("Error initializing player:", error);
    }
  }

  // Update hash change event listener to ensure scroll position
  window.addEventListener("hashchange", async () => {
    const newHash = window.location.hash.slice(1);
    const newSection = document.getElementById(newHash);

    if (newSection && newHash !== currentSectionId) {
      // Add no-scroll class
      document.body.classList.add("no-scroll");

      // Force scroll to top without animation
      window.scrollTo(0, 0);
      // Wait a bit to ensure scroll is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      updateActiveSection(newHash);

      // Remove no-scroll class
      document.body.classList.remove("no-scroll");

      if (player) {
        isUserNavigating = true;
        const wasPlaying = !player.paused;
        if (wasPlaying) {
          player.pause();
        }
        player.currentTime = parseFloat(newSection.dataset.start);
        if (wasPlaying) {
          player.play();
        }
      }
    }
  });

  // Add click handlers to navigation items
  navItems.forEach((item) => {
    item.addEventListener("click", async (event) => {
      event.preventDefault();
      isUserNavigating = true;
      const section = event.currentTarget.dataset.section;
      updateActiveSection(section);
      history.pushState({ section }, "", `#${section}`);

      if (player) {
        const wasPlaying = !player.paused;
        if (wasPlaying) {
          player.pause();
        }
        player.currentTime = getSectionStartTime(section);
        if (wasPlaying) {
          player.play();
        }
      }

      setTimeout(() => {
        isUserNavigating = false;
      }, 1000);
    });
  });

  // Mobile Menu Functionality
  const mobileMenuButton = document.querySelector(".mobile-menu-button");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileMenuClose = document.querySelector(".mobile-menu-close");

  if (!mobileMenuButton || !mobileMenu || !mobileMenuClose) {
    console.error("Mobile menu elements not found");
  }

  function toggleMobileMenu() {
    if (!mobileMenu || !mobileMenuButton) return;
    mobileMenu.classList.toggle("active");
    const isExpanded =
      mobileMenuButton.getAttribute("aria-expanded") === "true";
    mobileMenuButton.setAttribute("aria-expanded", !isExpanded);
  }

  mobileMenuButton?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMobileMenu();
  });

  mobileMenuClose.addEventListener("click", toggleMobileMenu);

  mobileMenu.addEventListener("click", (e) => {
    if (e.target === mobileMenu) {
      toggleMobileMenu();
    }
  });

  // Add event listeners to mobile menu items
  const menuItems = mobileMenu.querySelectorAll("li");
  menuItems.forEach((item) => {
    item.addEventListener("click", async (event) => {
      event.preventDefault();

      // Close menu first
      mobileMenu.classList.remove("active");
      mobileMenuButton.setAttribute("aria-expanded", "false");

      // Then update content
      const section = event.currentTarget.dataset.section;
      updateActiveSection(section);
      history.pushState({ section }, "", `#${section}`);

      // Handle video navigation
      if (player) {
        const wasPlaying = !player.paused;
        if (wasPlaying) {
          player.pause();
        }
        player.currentTime = getSectionStartTime(section);
        if (wasPlaying) {
          player.play();
        }
      }
    });
  });

  // Add click handlers to continue reading links
  document.querySelectorAll('.link[href^="#"]').forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      isUserNavigating = true; // Set flag when user initiates navigation
      const targetId = link.getAttribute("href").slice(1);
      window.location.hash = targetId;
      window.scrollTo(0, 0);

      // Handle video navigation
      if (player) {
        const wasPlaying = !player.paused;
        if (wasPlaying) {
          player.pause();
        }
        player.currentTime = getSectionStartTime(targetId);
        if (wasPlaying) {
          player.play();
        }
      }

      // Reset flag after a short delay to allow navigation to complete
      setTimeout(() => {
        isUserNavigating = false;
      }, 1000);
    });
  });
});
