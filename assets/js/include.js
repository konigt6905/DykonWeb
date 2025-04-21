/**
 * assets/js/include.js
 * Fetches HTML partials and injects them into corresponding container elements.
 * Initializes necessary JavaScript after partials are loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Starting partial include process..."); // Log start

    const partialContainers = document.querySelectorAll('[id$="-container"]');
    const totalPartials = partialContainers.length;
    let loadedCount = 0; // Counter for successful loads
    let allFetchesAttempted = false; // Flag to know when all fetches have been tried

    console.log(`Found ${totalPartials} partial containers.`); // Log count

    const fetchHtml = async (url) => {
        console.log(`Attempting to fetch: ${url}`); // Log fetch attempt
        try {
            const response = await fetch(url);
            console.log(`Response status for ${url}: ${response.status}`); // Log status
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} for ${url}`);
            }
            const text = await response.text();
            console.log(`Successfully fetched content for ${url} (length: ${text.length})`); // Log success and length
            return text;
        } catch (error) {
            console.error(`Error fetching partial ${url}:`, error); // Log specific fetch error
            // Return specific error message for the container
            return `<div class="p-4 text-red-500 bg-red-100 border border-red-400 rounded">Error loading content from ${url}. Check path/server.</div>`;
        }
    };

    const initializeMobileNav = () => {
        const menuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        // Check if elements exist before adding listeners
        if (menuButton && mobileMenu) {
            const menuIcons = menuButton.querySelectorAll('svg');
            const menuIconOpen = menuIcons.length > 0 ? menuIcons[0] : null;
            const menuIconClose = menuIcons.length > 1 ? menuIcons[1] : null;

            // Ensure icons exist before trying to toggle classes
            if (!menuIconOpen || !menuIconClose) {
                console.error("Could not find menu icons within the mobile menu button.");
                return;
            }

            // Only add listener if not already added (basic check)
            if (!menuButton.dataset.listenerAdded) {
                menuButton.addEventListener('click', () => {
                    const expanded = menuButton.getAttribute('aria-expanded') === 'true' || false;
                    menuButton.setAttribute('aria-expanded', String(!expanded));
                    mobileMenu.classList.toggle('hidden'); // Toggle visibility of the menu
                    menuIconOpen.classList.toggle('hidden'); // Toggle open icon
                    menuIconOpen.classList.toggle('block');
                    menuIconClose.classList.toggle('hidden'); // Toggle close icon
                    menuIconClose.classList.toggle('block');
                });

                // Add event listener to close menu when a link is clicked
                mobileMenu.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        // Check if the menu is currently open before trying to close it
                        if (!mobileMenu.classList.contains('hidden')) {
                            menuButton.click(); // Simulate a click on the button to close the menu
                        }
                    });
                });
                menuButton.dataset.listenerAdded = 'true'; // Mark listener as added
                console.log("Mobile navigation initialized.");
            }

        } else {
            console.error("Mobile menu button or menu container not found when trying to initialize nav.");
            // Retry initialization slightly later in case the nav partial loaded last
            setTimeout(initializeMobileNav, 100);
        }
    };

    const tryAOSRefresh = () => {
        if (typeof AOS !== 'undefined') {
            // Ensure AOS is initialized before refreshing, might need a slight delay
            setTimeout(() => {
                console.log("Attempting AOS refresh...");
                try {
                    AOS.refresh();
                    console.log("AOS refreshed.");
                } catch(e) {
                    console.error("Error refreshing AOS:", e);
                }
            }, 100); // Increased delay slightly
        } else {
            console.log("AOS library not found or not initialized, skipping refresh.");
        }
    };

    const onPartialLoaded = (success) => {
        if (success) {
            loadedCount++;
        }
        console.log(`Partials loaded: ${loadedCount} / ${totalPartials}`);
        // Check if all fetches have been attempted *and* the count matches total
        // Or if all fetches attempted even if some failed
        if (allFetchesAttempted && loadedCount >= totalPartials) {
            console.log("All partials loaded successfully.");
            initializeMobileNav();
            tryAOSRefresh();
        } else if (allFetchesAttempted) {
            console.warn(`Partial loading complete, but some failed. Loaded: ${loadedCount}/${totalPartials}`);
            initializeMobileNav(); // Still try to init nav
            // Decide if you want to refresh AOS even if parts failed
            // tryAOSRefresh();
        }
    };

    if (totalPartials === 0) {
        console.warn("No partial containers found on the page.");
        return; // Exit if no containers
    }

    const fetchPromises = [];

    partialContainers.forEach((container) => {
        const partialName = container.id.replace('-container', '');
        if (!partialName) {
            console.warn(`Container with ID ${container.id} has invalid format.`);
            return; // Skip this container
        }
        const partialUrl = `partials/${partialName}.html`;
        console.log(`Processing container: #${container.id}, expecting partial: ${partialUrl}`);

        const fetchPromise = fetchHtml(partialUrl)
            .then(htmlContent => {
                const isErrorContent = htmlContent.includes('Error loading content from');
                if (isErrorContent) {
                    console.warn(`Injecting error message into #${container.id}`);
                } else {
                    console.log(`Injecting content into #${container.id}`);
                }

                try {
                    container.innerHTML = htmlContent;
                    container.classList.add('loaded'); // Add loaded class regardless to make it visible
                    if (!isErrorContent) {
                        // Request animation frame can sometimes help ensure DOM is updated before further JS runs
                        requestAnimationFrame(() => {
                            onPartialLoaded(true); // Mark as success
                        });
                    } else {
                        onPartialLoaded(false); // Mark as failure
                    }
                } catch (e) {
                    console.error(`Error setting innerHTML for #${container.id}:`, e);
                    container.innerHTML = `<div class="p-4 text-red-700 bg-red-100">Failed to render content for ${partialName}.</div>`;
                    container.classList.add('loaded');
                    onPartialLoaded(false); // Mark as failure
                }
                return partialName; // Resolve with name for tracking
            })
            .catch(error => {
                // Catch unexpected errors during the promise chain for this specific partial
                console.error(`Unhandled promise error for ${partialName}:`, error);
                container.innerHTML = `<div class="p-4 text-red-700 bg-red-100">Critical error loading ${partialName}.</div>`;
                container.classList.add('loaded');
                onPartialLoaded(false); // Mark as failure
                return partialName; // Resolve even on error to allow Promise.allSettled to complete
            });

        fetchPromises.push(fetchPromise);
    });

    // Wait for all initiated fetch/inject operations to settle (either succeed or fail)
    Promise.allSettled(fetchPromises).then((results) => {
        console.log("All fetch/inject promises settled.");
        allFetchesAttempted = true; // Mark that all attempts are done
        // Check if the final counts match after all settled
        onPartialLoaded(null); // Call final check in case last one finished here
    });

    console.log("Partial include processing initiated for all containers.");
});