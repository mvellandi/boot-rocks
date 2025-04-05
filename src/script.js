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
  const videoThumbnail = document.getElementById("video-thumbnail");
  const playButton = document.querySelector(".play-button");

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

  // Set a static thumbnail immediately
  videoThumbnail.src = "https://i.vimeocdn.com/video/1072643347_1920x1080.jpg";

  // Simple function to start the video
  function startVideo() {
    if (playerInitialized) return;

    console.log("Starting video...");

    // Hide the thumbnail overlay
    thumbnailOverlay.style.opacity = "0";

    // Show the iframe
    iframe.style.display = "block";
    iframe.style.opacity = "1";

    // Remove the thumbnail overlay after fade out
    setTimeout(() => {
      thumbnailOverlay.style.display = "none";
    }, 400);

    playerInitialized = true;
  }

  // Set up click handlers
  if (playButton) {
    playButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Play button clicked");
      startVideo();
    });
  }

  thumbnailOverlay.addEventListener("click", function (e) {
    e.preventDefault();
    console.log("Thumbnail clicked");
    startVideo();
  });

  // Initialize Vimeo Player
  if (iframe) {
    // Hide the iframe initially
    iframe.style.display = "none";

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
    });

    try {
      // Wait for player to be ready
      await player.ready();
      console.log("Player ready, seeking to:", initialTime);

      // Event Listeners
      player.on("timeupdate", handleTimeUpdate);

      // Set the initial time
      if (initialTime > 0) {
        await player.setCurrentTime(initialTime);
      }

      // Set up a one-time event listener for when the player becomes visible
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !playerInitialized) {
              console.log("Player is visible, starting playback");
              player.play();
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(iframe);
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
});
