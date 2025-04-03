// Vimeo Player SDK
import Player from "@vimeo/player";

// Constants
const VIMEO_VIDEO_ID = "1070758632";
const DEBUG_MODE = true; // Global debug flag to prevent video playback

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

      // If we have a hash, seek to the correct time but don't play in debug mode
      if (hash && initialSection) {
        isUserSeeking = true;
        await player.setCurrentTime(parseFloat(initialSection.dataset.start));
        if (!DEBUG_MODE) {
          await player.play();
        }
        isUserSeeking = false;
      }

      // In debug mode, ensure video stays paused
      if (DEBUG_MODE) {
        player.on("play", () => player.pause());
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

  // Add click handlers to navigation items
  navItems.forEach((item) => {
    item.addEventListener("click", async (event) => {
      event.preventDefault(); // Prevent default anchor behavior
      const section = event.currentTarget.dataset.section;
      updateActiveSection(section);
      history.pushState({ section }, "", `#${section}`);
      await player.seekTo(getSectionStartTime(section));
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

  // Open menu when clicking the button
  mobileMenuButton?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Close menu when clicking the close button
  mobileMenuClose.addEventListener("click", toggleMobileMenu);

  // Close menu when clicking the overlay (background)
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
      await player.seekTo(getSectionStartTime(section));
    });
  });

  // Check if we're on the about page
  const isAboutPage = document.body.classList.contains("about-page");

  if (isAboutPage) {
    // For about page, just show the content immediately
    const contentCarousel = document.querySelector(".content-carousel");
    if (contentCarousel) {
      contentCarousel.style.opacity = "1";
    }
  } else {
    // Original carousel functionality for homepage
    // ... existing carousel code ...
  }
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

  // Update mobile menu items
  document.querySelectorAll(".mobile-menu li").forEach((item) => {
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
