// Vimeo Player SDK
import Player from "@vimeo/player";

// Constants
const VIMEO_VIDEO_ID = "1072643347";
const DEBUG_MODE = false; // Global debug flag to prevent video playback

// State Management
let player = null;
let currentSectionId = null;
let isUserNavigating = false; // Flag to track user navigation
let playerInitialized = false;

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

// Initialize everything after DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  // DOM Elements
  const contentSection = document.querySelector(".content-carousel");
  const navItems = document.querySelectorAll(".nav-item");
  const iframe = document.getElementById("vimeo-player");
  const thumbnailOverlay = document.getElementById("thumbnail-overlay");

  // Show the content section immediately
  contentSection.classList.remove("opacity-0");

  // Handle initial navigation based on hash
  const hash = window.location.hash.slice(1);
  const initialSectionId = hash || "intro";
  const initialSection = document.getElementById(initialSectionId);
  const initialTime = initialSection
    ? parseFloat(initialSection.dataset.start)
    : 0;

  if (initialSection) {
    updateActiveSection(initialSectionId);
  }

  // Initialize Vimeo Player
  if (iframe) {
    // Set the iframe source with specific parameters to control the initial appearance
    iframe.src = `https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?background=0&autopause=0&transparent=0&autoplay=0&loop=0&title=0&byline=0&portrait=0&quality=1080p&dnt=1&controls=1&cc=false&texttrack=false`;

    // Show the iframe immediately
    iframe.style.display = "block";

    // Initialize the player
    player = new Player(iframe, {
      id: VIMEO_VIDEO_ID,
      width: "100%",
      height: "100%",
      responsive: true,
      autoplay: false,
      controls: true,
      title: false,
      byline: false,
      portrait: false,
      playsinline: true,
      background: false,
      quality: "1080p",
      dnt: 1,
      cc: false,
      texttrack: false,
    });

    try {
      await player.ready();
      console.log("Player ready, seeking to:", initialTime);

      // Event Listeners
      player.on("timeupdate", handleTimeUpdate);

      // Set the initial time if needed
      if (initialTime > 0) {
        await player.setCurrentTime(initialTime);
      }

      // Hide the thumbnail overlay after player is ready
      thumbnailOverlay.style.display = "none";
    } catch (error) {
      console.error("Error initializing player:", error);
    }
  }

  // Add hash change event listener
  window.addEventListener("hashchange", async () => {
    const newHash = window.location.hash.slice(1);
    const newSection = document.getElementById(newHash);

    if (newSection && newHash !== currentSectionId) {
      updateActiveSection(newHash);
      if (player) {
        isUserNavigating = true;
        const wasPlaying = await player.getPaused().then((paused) => !paused);
        if (wasPlaying) {
          await player.pause();
        }
        await player.setCurrentTime(parseFloat(newSection.dataset.start));
        if (wasPlaying) {
          await player.play();
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
        const wasPlaying = await player.getPaused().then((paused) => !paused);
        if (wasPlaying) {
          await player.pause();
        }
        await player.setCurrentTime(getSectionStartTime(section));
        if (wasPlaying) {
          await player.play();
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
        const wasPlaying = await player.getPaused().then((paused) => !paused);
        if (wasPlaying) {
          await player.pause();
        }
        await player.setCurrentTime(getSectionStartTime(section));
        if (wasPlaying) {
          await player.play();
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
        const wasPlaying = await player.getPaused().then((paused) => !paused);
        if (wasPlaying) {
          await player.pause();
        }
        await player.setCurrentTime(getSectionStartTime(targetId));
        if (wasPlaying) {
          await player.play();
        }
      }

      // Reset flag after a short delay to allow navigation to complete
      setTimeout(() => {
        isUserNavigating = false;
      }, 1000);
    });
  });
});
