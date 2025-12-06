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
 * Initializes a datalist (searchable select) component.
 *
 * Creates an accessible, searchable dropdown that allows users to type to filter
 * options and select from a list. Supports keyboard navigation and multiple style variants.
 *
 * @param {HTMLElement} container - The container element with class 'datalist'
 * @param {Object} options - Configuration options
 * @param {Array<{value: string, label: string}>} options.options - Array of options with value and label
 * @param {string} [options.placeholder] - Placeholder text for the input (default: 'Search...')
 * @param {string} [options.emptyMessage] - Message shown when no options match (default: 'No results found')
 * @param {Function} [options.onChange] - Callback when selection changes, receives {value, label}
 * @returns {Object} An object with methods to control the datalist
 *
 * @example
 * // Basic usage
 * const container = document.querySelector('.datalist');
 * const datalist = initDatalist(container, {
 *     options: [
 *         { value: 'apple', label: 'Apple' },
 *         { value: 'banana', label: 'Banana' },
 *         { value: 'cherry', label: 'Cherry' }
 *     ],
 *     placeholder: 'Select a fruit...',
 *     onChange: (selected) => console.log('Selected:', selected)
 * });
 *
 * @example
 * // Programmatically control
 * datalist.setValue('banana');  // Set value programmatically
 * datalist.getValue();          // Get current value
 * datalist.clear();             // Clear selection
 * datalist.open();              // Open dropdown
 * datalist.close();             // Close dropdown
 */
function initDatalist(container, config = {}) {
    const {
        options = [],
        placeholder = 'Search...',
        emptyMessage = 'No results found',
        onChange = null
    } = config;

    let selectedValue = null;
    let selectedLabel = '';
    let highlightedIndex = -1;
    let filteredOptions = [...options];
    let isOpen = false;

    // Create DOM structure
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'datalist-input';
    input.placeholder = placeholder;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-haspopup', 'listbox');
    input.setAttribute('autocomplete', 'off');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'datalist-toggle';
    toggle.setAttribute('tabindex', '-1');
    toggle.setAttribute('aria-label', 'Toggle dropdown');
    toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>`;

    const dropdown = document.createElement('div');
    dropdown.className = 'datalist-dropdown';
    dropdown.setAttribute('role', 'listbox');

    container.appendChild(input);
    container.appendChild(toggle);
    container.appendChild(dropdown);

    function renderOptions() {
        dropdown.innerHTML = '';

        if (filteredOptions.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'datalist-empty';
            empty.textContent = emptyMessage;
            dropdown.appendChild(empty);
            return;
        }

        filteredOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'datalist-option';
            button.setAttribute('role', 'option');
            button.setAttribute('data-value', option.value);
            button.textContent = option.label;

            if (option.value === selectedValue) {
                button.classList.add('selected');
                button.setAttribute('aria-selected', 'true');
            }

            if (index === highlightedIndex) {
                button.classList.add('highlighted');
            }

            button.addEventListener('click', () => selectOption(option));
            button.addEventListener('mouseenter', () => {
                highlightedIndex = index;
                updateHighlight();
            });

            dropdown.appendChild(button);
        });
    }

    function updateHighlight() {
        const optionElements = dropdown.querySelectorAll('.datalist-option');
        optionElements.forEach((el, index) => {
            el.classList.toggle('highlighted', index === highlightedIndex);
        });

        // Scroll highlighted option into view
        if (highlightedIndex >= 0 && optionElements[NavbarScroll };
}
