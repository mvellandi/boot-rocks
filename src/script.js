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
  if (sectionId && !isUserNavigating) {
    updateActiveSection(sectionId);
    // Update URL hash without scrolling
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

  // Show the content section immediately
  contentSection.classList.remove("opacity-0");

  // Handle initial navigation based on hash
  const hash = window.location.hash.slice(1);
  const initialSectionId = hash || "intro";
  const initialSection = document.getElementById(initialSectionId);
  const initialTime = initialSection
    ? parseFloat(initialSection.dataset.start)
    : 0;

  console.log("Initial section:", initialSectionId, "Time:", initialTime);

  if (initialSection) {
    // Update UI immediately for direct navigation
    updateActiveSection(initialSectionId);
  }

  // Initialize Vimeo Player immediately
  if (iframe) {
    // Show the iframe but keep it hidden
    iframe.style.display = "block";
    iframe.style.opacity = "0";

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
      playsinline: true, // Important for mobile
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

      // Load the video and prepare it for playback
      await player.play();
      await player.pause();

      // Set up click handler for thumbnail overlay
      thumbnailOverlay.addEventListener("click", async () => {
        if (!playerInitialized) {
          // Show the player immediately
          iframe.style.opacity = "1";
          thumbnailOverlay.style.opacity = "0";

          // Start playing
          await player.play();

          // Remove the thumbnail overlay after fade out
          setTimeout(() => {
            thumbnailOverlay.style.display = "none";
          }, 400);

          playerInitialized = true;
        }
      });

      // If no thumbnail overlay (mobile), initialize immediately
      if (!thumbnailOverlay || window.innerWidth <= 768) {
        iframe.style.opacity = "1";
        playerInitialized = true;
      }
    } catch (error) {
      console.error("Error initializing player:", error);
    }
  }

  // Fetch thumbnail from Vimeo oEmbed API
  try {
    const response = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${VIMEO_VIDEO_ID}&width=1920&maxwidth=1920`
    );
    const data = await response.json();
    if (data.thumbnail_url) {
      // Replace _640x360 with _1920x1080 to get the highest quality thumbnail
      const highResThumb = data.thumbnail_url.replace(
        /_\d+x\d+\./,
        "_1920x1080."
      );
      videoThumbnail.src = highResThumb;
    }
  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    // Fallback to a default thumbnail if needed
    videoThumbnail.src = "https://i.vimeocdn.com/video/default-1920x1080.jpg";
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
