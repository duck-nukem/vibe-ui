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

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { easeOutGradient };
}