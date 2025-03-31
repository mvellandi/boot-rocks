// Vimeo Player SDK
import Player from "@vimeo/player";

// Constants
const VIMEO_VIDEO_ID = "1070758632";

// State Management
let player = null;
let currentSectionId = null;
let isUserSeeking = false;

// Initialize everything after DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  // DOM Elements
  const contentSection = document.querySelector(".content-carousel");
  const navToggle = document.querySelector(".nav-toggle");
  const navContent = document.querySelector(".nav-content");
  const navItems = document.querySelectorAll(".nav-item");
  const iframe = document.getElementById("vimeo-player");

  // Show the content section immediately
  contentSection.classList.remove("opacity-0");

  // Handle initial navigation based on hash
  const hash = window.location.hash.slice(1);
  const initialSectionId = hash || "intro";
  const initialSection = document.getElementById(initialSectionId);

  if (initialSection) {
    // Update UI immediately for direct navigation
    updateActiveSection(initialSectionId);
  }

  // Initialize Vimeo Player
  if (iframe) {
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
    });

    try {
      // Wait for player to be ready
      await player.ready();

      // Event Listeners
      player.on("timeupdate", handleTimeUpdate);

      // If we have a hash, seek to the correct time and start playing
      if (hash && initialSection) {
        isUserSeeking = true;
        await player.setCurrentTime(parseFloat(initialSection.dataset.start));
        await player.play();
        isUserSeeking = false;
      }
    } catch (error) {
      console.error("Error initializing player:", error);
    }
  }

  // Navigation Toggle for Mobile
  navToggle?.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", !isExpanded);
    navContent.classList.toggle("active");
  });

  // Add click handler for navigation
  navContent.addEventListener("click", handleNavClick);
});

// Helper Functions
function getActiveSectionId(currentTime) {
  const sections = Array.from(
    document.querySelectorAll(".content-carousel section")
  );
  return sections.find((section, index) => {
    const start = parseFloat(section.dataset.start);
    // Get end time from next section's start, or use a large number for the last section
    const end =
      index < sections.length - 1
        ? parseFloat(sections[index + 1].dataset.start)
        : Number.MAX_SAFE_INTEGER;
    return currentTime >= start && currentTime < end;
  })?.id;
}

function updateActiveSection(sectionId) {
  if (currentSectionId === sectionId) return;

  // Update navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === sectionId);
  });

  // Update content sections
  document.querySelectorAll(".content-carousel section").forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });

  currentSectionId = sectionId;
}

// Event Handlers
function handleTimeUpdate({ seconds }) {
  const sectionId = getActiveSectionId(seconds);
  if (sectionId && (!isUserSeeking || sectionId !== currentSectionId)) {
    updateActiveSection(sectionId);
    // Update URL hash without scrolling
    history.replaceState(null, null, `#${sectionId}`);
  }
}

function handleNavClick(event) {
  const button = event.target.closest(".nav-item");
  if (!button || !player) return;

  const sectionId = button.dataset.section;
  const section = document.getElementById(sectionId);
  if (!section) return;

  isUserSeeking = true;

  // Update UI immediately
  updateActiveSection(sectionId);
  history.pushState(null, null, `#${sectionId}`);

  player
    .setCurrentTime(parseFloat(section.dataset.start))
    .then(() => player.play())
    .then(() => {
      isUserSeeking = false;
    })
    .catch((error) => {
      console.error("Error during playback:", error);
      isUserSeeking = false;
    });

  // Close mobile navigation if open
  if (window.innerWidth < 1024) {
    const navToggle = document.querySelector(".nav-toggle");
    const navContent = document.querySelector(".nav-content");
    navToggle?.setAttribute("aria-expanded", "false");
    navContent?.classList.remove("active");
  }
}
