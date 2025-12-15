/**
 * Modern UI Framework - JavaScript Helpers
 *
 * Optional JavaScript utilities for enhanced interactions.
 * The CSS framework works without JavaScript, but these helpers
 * provide smoother transitions for dynamic class changes.
 */

/**
 * Smoothly fades out the gradient effect on an input element.
 *
 * The gradient border on inputs cannot be smoothly transitioned with CSS alone
 * when removing the class. This helper function handles the fade-out animation
 * gracefully by:
 * 1. Adding the 'gradient-out' class to trigger the opacity transition
 * 2. Waiting for the transition to complete
 * 3. Cleanly removing both classes without causing a visual flash
 *
 * @param {HTMLElement} element - The input, textarea, or select element with the 'gradient' class
 * @returns {Promise<void>} Resolves when the fade-out animation is complete
 *
 * @example
 * // Basic usage
 * const input = document.querySelector('input.gradient');
 * easeOutGradient(input);
 *
 * @example
 * // With async/await
 * await easeOutGradient(input);
 * console.log('Gradient removed!');
 *
 * @example
 * // With .then()
 * easeOutGradient(input).then(() => {
 *     console.log('Gradient removed!');
 * });
 */
function easeOutGradient(element) {
    return new Promise((resolve) => {
        // If element doesn't have gradient class, resolve immediately
        if (!element.classList.contains('gradient')) {
            resolve();
            return;
        }

        // Add the fade-out class to trigger the transition
        element.classList.add('gradient-out');

        function handleTransitionEnd(e) {
            // Only act on the gradient opacity transition
            if (e.propertyName === '--gradient-opacity') {
                // Temporarily disable transitions to prevent flash
                // when removing classes (prevents base input transition from firing)
                element.style.transition = 'none';

                // Remove both gradient classes
                element.classList.remove('gradient', 'gradient-out');

                // Force browser reflow to ensure styles are applied
                element.offsetHeight;

                // Re-enable transitions
                element.style.transition = '';

                // Clean up event listener
                element.removeEventListener('transitionend', handleTransitionEnd);

                resolve();
            }
        }

        element.addEventListener('transitionend', handleTransitionEnd);
    });
}

/**
 * Initializes scroll-direction-based hiding/showing of the navbar top row.
 *
 * On mobile, the navbar has two rows:
 * - Top row: logo + buttons (navbar-left, navbar-right)
 * - Bottom row: menu items (navbar-center)
 *
 * This function hides the top row when scrolling down and reveals it
 * when scrolling up, creating a more compact navigation experience.
 *
 * @param {HTMLElement} navbar - The navbar element with class 'navbar'
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Minimum scroll distance before triggering hide/show (default: 10)
 *
 * @example
 * // Basic usage
 * const navbar = document.querySelector('.navbar');
 * initNavbarScroll(navbar);
 *
 * @example
 * // With custom threshold
 * initNavbarScroll(navbar, { threshold: 20 });
 */
function initNavbarScroll(navbar, options = {}) {
    const threshold = options.threshold || 10;
    const mobileBreakpoint = options.mobileBreakpoint || 640;
    let lastScrollY = window.scrollY;
    let topRowHidden = false;

    const topRowElements = navbar.querySelectorAll('.navbar-left, .navbar-right');

    function isMobile() {
        return window.innerWidth <= mobileBreakpoint;
    }

    // Add CSS for smooth transition
    topRowElements.forEach(el => {
        el.style.transition = 'opacity 0.3s ease, max-height 0.3s ease, padding 0.3s ease, margin 0.3s ease';
        el.style.overflow = 'hidden';
    });

    // Also transition the navbar itself for gap/padding
    navbar.style.transition = 'gap 0.3s ease, padding 0.3s ease';

    function hideTopRow() {
        if (topRowHidden) return;
        topRowHidden = true;
        topRowElements.forEach(el => {
            el.style.opacity = '0';
            el.style.maxHeight = '0';
            el.style.paddingTop = '0';
            el.style.paddingBottom = '0';
            el.style.marginTop = '0';
            el.style.marginBottom = '0';
        });
        // Collapse grid gap and even out padding
        navbar.style.gap = '0';
        navbar.style.paddingTop = 'var(--space-2)';
        navbar.style.paddingBottom = 'var(--space-2)';
    }

    function showTopRow() {
        if (!topRowHidden) return;
        topRowHidden = false;
        topRowElements.forEach(el => {
            el.style.opacity = '1';
            el.style.maxHeight = '4rem';
            el.style.paddingTop = '';
            el.style.paddingBottom = '';
            el.style.marginTop = '';
            el.style.marginBottom = '';
        });
        // Restore grid gap and padding
        navbar.style.gap = '';
        navbar.style.paddingTop = '';
        navbar.style.paddingBottom = '';
    }

    function onScroll() {
        // Only apply on mobile screens
        if (!isMobile()) {
            if (topRowHidden) showTopRow();
            return;
        }

        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        // Only trigger if scroll distance exceeds threshold
        if (Math.abs(scrollDelta) < threshold) return;

        if (scrollDelta > 0 && currentScrollY > 50) {
            // Scrolling down & not at top
            hideTopRow();
        } else if (scrollDelta < 0) {
            // Scrolling up
            showTopRow();
        }

        lastScrollY = currentScrollY;
    }

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Initializes dark mode based on system preference and provides a toggle function.
 *
 * This function:
 * 1. Checks the user's system preference for dark mode
 * 2. Applies the 'dark' class to <html> if dark mode is preferred
 * 3. Optionally syncs with a toggle checkbox
 * 4. Listens for system preference changes
 *
 * @param {HTMLInputElement} [toggle] - Optional checkbox input to sync with dark mode state
 * @returns {Object} An object with methods to control dark mode
 *
 * @example
 * // Basic usage - just follows system preference
 * initDarkMode();
 *
 * @example
 * // With a toggle checkbox
 * const toggle = document.getElementById('dark-mode-toggle');
 * const darkMode = initDarkMode(toggle);
 *
 * // Programmatically control dark mode
 * darkMode.set(true);  // Enable dark mode
 * darkMode.set(false); // Disable dark mode
 * darkMode.toggle();   // Toggle dark mode
 */
function initDarkMode(toggle) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function set(isDark) {
        document.documentElement.classList.toggle('dark', isDark);
        if (toggle) {
            toggle.checked = isDark;
        }
    }

    // Sync toggle with dark mode state
    if (toggle) {
        toggle.addEventListener('change', function() {
            set(this.checked);
        });
    }

    // Set initial state based on system preference
    set(darkModeQuery.matches);

    // Listen for system preference changes
    darkModeQuery.addEventListener('change', (e) => set(e.matches));

    // Return control methods
    return {
        set: set,
        toggle: () => set(!document.documentElement.classList.contains('dark')),
        isDark: () => document.documentElement.classList.contains('dark')
    };
}

/**
 * Tracks unsaved changes and shows a native browser confirmation dialog
 * when the user tries to navigate away from the page.
 *
 * The browser shows a generic message like "Changes you made may not be saved"
 * (custom messages are ignored for security reasons).
 *
 * @returns {Object} An object with methods to control the dirty state
 *
 * @example
 * // Basic usage
 * const unsavedChanges = trackUnsavedChanges();
 *
 * // When form is modified
 * formInput.addEventListener('input', () => {
 *     unsavedChanges.setDirty();
 * });
 *
 * // After saving successfully
 * saveButton.addEventListener('click', async () => {
 *     await saveData();
 *     unsavedChanges.setClean();
 * });
 *
 * @example
 * // Auto-track a form
 * const unsavedChanges = trackUnsavedChanges();
 * const form = document.querySelector('form');
 *
 * form.addEventListener('input', () => unsavedChanges.setDirty());
 * form.addEventListener('submit', () => unsavedChanges.setClean());
 */
function trackUnsavedChanges() {
    let dirty = false;

    function handleBeforeUnload(e) {
        if (dirty) {
            e.preventDefault();
            e.returnValue = ''; // Required for Chrome/Edge
            return ''; // Required for some older browsers
        }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    return {
        /**
         * Mark the page as having unsaved changes
         */
        setDirty: () => {
            dirty = true;
        },

        /**
         * Mark the page as clean (no unsaved changes)
         */
        setClean: () => {
            dirty = false;
        },

        /**
         * Check if there are unsaved changes
         * @returns {boolean}
         */
        isDirty: () => dirty,

        /**
         * Remove the beforeunload listener entirely
         * Call this when the component/page is destroyed
         */
        destroy: () => {
            dirty = false;
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    };
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { easeOutGradient, initNavbarScroll, openModal, closeModal, trackUnsavedChanges };
}
