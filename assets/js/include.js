/**
 * assets/js/include.js
 * Fetches HTML partials and injects them into corresponding container elements.
 * Initializes necessary JavaScript after partials are loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Starting partial include process..."); // Log start

    const partialContainers = document.querySelectorAll('[id$="-container"]');
    const loadedPartials = [];
    const totalPartials = partialContainers.length;
    let allFetchesSuccessful = true; // Flag to track fetch success

    console.log(`Found ${totalPartials} partial containers.`); // Log count

    const fetchHtml = async (url) => {
        console.log(`Attempting to fetch: ${url}`); // Log fetch attempt
        try {
            const response = await fetch(url);
            console.log(`Workspace response status for ${url}: ${response.status}`); // Log status
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} for ${url}`);
            }
            const text = await response.text();
            console.log(`Successfully fetched content for ${url} (length: ${text.length})`); // Log success and length
            // console.log(`Content snippet for ${url}: `, text.substring(0, 100) + "..."); // Optional: Log content snippet
            return text;
        } catch (error) {
            console.error(`Error fetching partial ${url}:`, error); // Log specific fetch error
            allFetchesSuccessful = false; // Mark failure
            // Return specific error message for the container
            return `<div class="p-4 text-red-500 bg-red-100 border border-red-400 rounded">Error loading content from ${url}. Check file path and server status.</div>`;
        }
    };

    const initializeMobileNav = () => {
        // ... (keep the existing initializeMobileNav function as it was)
        const menuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (menuButton && mobileMenu) {
            const menuIcons = menuButton.querySelectorAll('svg');
            const menuIconOpen = menuIcons.length > 0 ? menuIcons[0] : null;
            const menuIconClose = menuIcons.length > 1 ? menuIcons[1] : null;

            if (!menuIconOpen || !menuIconClose) {
                console.error("Could not find menu icons within the mobile menu button.");
                return;
            }

            menuButton.addEventListener('click', () => {
                const expanded = menuButton.getAttribute('aria-expanded') === 'true' || false;
                menuButton.setAttribute('aria-expanded', String(!expanded));
                mobileMenu.classList.toggle('hidden');
                menuIconOpen.classList.toggle('hidden');
                menuIconOpen.classList.toggle('block');
                menuIconClose.classList.toggle('hidden');
                menuIconClose.classList.toggle('block');
            });

            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (!mobileMenu.classList.contains('hidden')) {
                        menuButton.click();
                    }
                });
            });
            console.log("Mobile navigation initialized.");
        } else {
            setTimeout(() => {
                if (!document.getElementById('mobile-menu-button') || !document.getElementById('mobile-menu')) {
                    console.error("Mobile menu elements not found after loading nav partial (with delay).");
                } else {
                    initializeMobileNav();
                }
            }, 100);
        }
    };

    const onAllPartialsLoaded = () => {
        console.log(`Partial loading loop complete. Success status: ${allFetchesSuccessful}`);
        initializeMobileNav();

        // Refresh AOS only if all fetches seemed successful initially
        // Note: This might still run even if innerHTML fails later for some reason
        if (typeof AOS !== 'undefined' && allFetchesSuccessful) {
            // Ensure AOS is initialized before refreshing, might need a slight delay
            setTimeout(() => {
                console.log("Attempting AOS refresh...");
                try {
                    AOS.refresh();
                    console.log("AOS refreshed.");
                } catch(e) {
                    console.error("Error refreshing AOS:", e);
                }
            }, 50); // Small delay to ensure AOS might have initialized
        } else if (!allFetchesSuccessful) {
            console.warn("Skipping AOS refresh due to fetch errors.");
        } else {
            console.log("AOS library not found, skipping refresh.");
        }
        console.log("Include script finished onAllPartialsLoaded.");
    };

    if (totalPartials === 0) {
        console.warn("No partial containers found on the page.");
        return; // Exit if no containers
    }

    // Use Promise.all to wait for all fetches *initiated* by the loop
    const fetchPromises = [];

    partialContainers.forEach((container) => {
        const partialName = container.id.replace('-container', '');
        if (!partialName) {
            console.warn(`Container with ID ${container.id} has invalid format.`);
            return; // Skip this container
        }
        const partialUrl = `partials/${partialName}.html`;
        console.log(`Processing container: #${container.id}, expecting partial: ${partialUrl}`);

        const fetchPromise = fetchHtml(partialUrl).then(htmlContent => {
            // Check if content is error message we generated
            const isErrorContent = htmlContent.includes('Error loading content from');
            if (isErrorContent) {
                console.warn(`Injecting error message into #${container.id}`);
            } else {
                console.log(`Injecting content into #${container.id}`);
            }

            try {
                container.innerHTML = htmlContent;
                // Add 'loaded' class *only if* it wasn't an error we generated
                // And apply after ensuring DOM update
                if (!isErrorContent) {
                    requestAnimationFrame(() => {
                        container.classList.add('loaded');
                    });
                } else {
                    // Still add loaded to remove initial opacity=0 if it was present
                    // Or just ensure visibility if relying on AOS only
                    container.style.opacity = '1'; // Ensure error message is visible
                    container.classList.add('loaded'); // Add loaded anyway
                }
            } catch (e) {
                console.error(`Error setting innerHTML for #${container.id}:`, e);
                container.innerHTML = `<div class="p-4 text-red-700 bg-red-100">Failed to render content for ${partialName}.</div>`;
                container.style.opacity = '1';
                container.classList.add('loaded');
            }
            // Resolve the promise for this container
            return partialName;
        }).catch(error => {
            // This catch might be redundant if fetchHtml handles its errors, but good safety net
            console.error(`Unhandled error processing ${partialName}:`, error);
            allFetchesSuccessful = false;
            container.innerHTML = `<div class="p-4 text-red-700 bg-red-100">Unhandled error for ${partialName}.</div>`;
            container.style.opacity = '1';
            container.classList.add('loaded');
            return partialName; // Still resolve to allow Promise.all to finish
        });

        fetchPromises.push(fetchPromise);
    });

    // Wait for all fetch/inject operations initiated above to complete or fail
    Promise.allSettled(fetchPromises).then((results) => {
        console.log("All fetch/inject promises settled.");
        results.forEach(result => {
            if (result.status === 'rejected') {
                // This implies an error *outside* the fetchHtml catch or innerHTML try/catch
                console.error("A promise settled with rejection:", result.reason);
                allFetchesSuccessful = false; // Ensure flag is set
            }
        });
        // Now call the final setup function
        onAllPartialsLoaded();
    });

    console.log("Partial include processing loop initiated.");
});