/**
 * assets/js/include.js
 * Fetches HTML partials and injects them into corresponding container elements.
 * Initializes necessary JavaScript after partials are loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Starting partial include process..."); // Log start

    const partialContainers = document.querySelectorAll('[id$="-container"]');
    const totalPartials = partialContainers.length;

    console.log(`Found ${totalPartials} partial containers.`); // Log count

    // Determine base path by getting the current path from window.location
    // This helps with GitHub Pages deployment where the site might be in a subdirectory
    function getBasePath() {
        // Extract the repository name from the pathname for GitHub Pages
        const pathSegments = window.location.pathname.split('/');
        // If deployed on GitHub Pages with a repo name, the repo name will be the first segment
        const repoName = pathSegments[1] && !pathSegments[1].includes('.html') ? `/${pathSegments[1]}` : '';

        console.log(`Detected base path: ${repoName}`);
        return repoName;
    }

    const basePath = getBasePath();

    const fetchHtml = async (url) => {
        // Adjust URL to include base path
        const adjustedUrl = `${basePath}/${url}`;
        console.log(`Attempting to fetch: ${adjustedUrl}`); // Log fetch attempt

        try {
            const response = await fetch(adjustedUrl);
            console.log(`Response status for ${adjustedUrl}: ${response.status}`); // Log status
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} for ${adjustedUrl}`);
            }
            const text = await response.text();
            console.log(`Successfully fetched content for ${adjustedUrl} (length: ${text.length})`); // Log success and length
            return text;
        } catch (error) {
            console.error(`Error fetching partial ${adjustedUrl}:`, error); // Log specific fetch error
            // Return specific error message for the container
            return `<div class="p-4 text-red-500 bg-red-100 border border-red-400 rounded">Error loading content from ${adjustedUrl}. Check path/server.</div>`;
        }
    };

    const initializeMobileNav = () => {
        const menuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (menuButton && mobileMenu) {
            const menuIcons = menuButton.querySelectorAll('svg');
            const menuIconOpen = menuIcons.length > 0 ? menuIcons[0] : null;
            const menuIconClose = menuIcons.length > 1 ? menuIcons[1] : null;
            if (!menuIconOpen || !menuIconClose) {
                console.error("Could not find menu icons within the mobile menu button."); return;
            }
            if (!menuButton.dataset.listenerAdded) {
                menuButton.addEventListener('click', () => {
                    const expanded = menuButton.getAttribute('aria-expanded') === 'true' || false;
                    menuButton.setAttribute('aria-expanded', String(!expanded));
                    mobileMenu.classList.toggle('hidden');
                    menuIconOpen.classList.toggle('hidden'); menuIconOpen.classList.toggle('block');
                    menuIconClose.classList.toggle('hidden'); menuIconClose.classList.toggle('block');
                });
                mobileMenu.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        if (!mobileMenu.classList.contains('hidden')) { menuButton.click(); }
                    });
                });
                menuButton.dataset.listenerAdded = 'true';
                console.log("Mobile navigation initialized.");
            }
        } else {
            // Still try to re-run later if elements aren't found immediately
            console.warn("Mobile menu elements not found immediately after partials settled, will retry initialization soon.");
            setTimeout(initializeMobileNav, 200); // Retry after a slightly longer delay
        }
    };

    const tryAOSRefresh = () => {
        if (typeof AOS !== 'undefined') {
            setTimeout(() => {
                console.log("Attempting AOS refresh...");
                try {
                    AOS.refresh();
                    console.log("AOS refreshed.");
                }
                catch(e) {
                    console.error("Error refreshing AOS:", e);
                }
            }, 100);
        } else {
            console.log("AOS library not found or not initialized, skipping refresh.");
        }
    };

    const initializeFloatingContact = () => {
        const floatingButtons = document.querySelectorAll('.floating-contact .contact-btn');
        if (floatingButtons.length > 0) {
            floatingButtons.forEach((btn, index) => {
                // Add delay to stagger the animations
                btn.style.animationDelay = `${index * 0.1}s`;
                btn.classList.add('animate-float');
            });
            console.log("Floating contact buttons initialized.");
        }
    };

    const initializeParticleEffects = () => {
        // This will be handled by the inline script in the hero.html partial
        console.log("Particle effects initialization delegated to hero.html script.");
    };

    // Smooth scrolling for all anchor links
    const initializeSmoothScrolling = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return; // Skip if it's just a # link

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Scroll smoothly to the target
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        console.log("Smooth scrolling initialized for anchor links.");
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
                // Inject content immediately after fetch resolves
                try {
                    console.log(`Attempting to set innerHTML for #${container.id}`);
                    container.innerHTML = htmlContent;
                    container.classList.add('loaded'); // Add loaded class right after successful injection
                    console.log(`Successfully set innerHTML for #${container.id}`);
                } catch (e) {
                    console.error(`Error setting innerHTML for #${container.id}:`, e);
                    container.innerHTML = `<div class="p-4 text-red-700 bg-red-100">Failed to render content for ${partialName}.</div>`;
                    container.classList.add('loaded'); // Add loaded anyway to ensure visibility
                }
                return { name: partialName, status: 'fulfilled' }; // Return success status
            })
            .catch(error => {
                // Catch fetch errors or errors from fetchHtml returning the error message
                console.error(`Promise failed for ${partialName}:`, error);
                // Display error in container if fetchHtml didn't already provide one
                if (!container.innerHTML.includes('Error loading content from')) {
                    container.innerHTML = `<div class="p-4 text-red-700 bg-red-100">Critical error loading ${partialName}.</div>`;
                }
                container.classList.add('loaded');
                return { name: partialName, status: 'rejected', reason: error }; // Return failure status
            });

        fetchPromises.push(fetchPromise);
    });

    // Wait for all initiated fetch/inject operations to settle (either succeed or fail)
    Promise.allSettled(fetchPromises).then((results) => {
        console.log("All fetch/inject promises settled.");

        // Optional: Check results for failures
        let allSucceeded = true;
        results.forEach(result => {
            if (result.status === 'rejected') {
                allSucceeded = false;
                console.error(`Failed to process partial: ${result.reason?.name || 'Unknown'}`, result.reason);
            } else if (result.value?.status === 'rejected') {
                allSucceeded = false; // Handle cases where the promise resolved but indicated failure
                console.error(`Failed to process partial: ${result.value.name}`, result.value.reason);
            }
        });

        if (allSucceeded) {
            console.log("All partials processed successfully. Running initializations.");
        } else {
            console.warn("Some partials failed to process. Running initializations anyway.");
        }

        // --- RUN INITIALIZATIONS DIRECTLY HERE ---
        initializeMobileNav();
        tryAOSRefresh();
        initializeFloatingContact();
        initializeParticleEffects();
        initializeSmoothScrolling();

        // Initialize gallery (if function exists, it's loaded from the gallery partial)
        if (typeof window.initGallery === 'function') {
            setTimeout(() => {
                try {
                    window.initGallery();
                    console.log("Gallery initialized.");
                } catch (e) {
                    console.error("Error initializing gallery:", e);
                }
            }, 500); // Small delay to ensure DOM is ready
        }

        console.log("Include script finished post-load initializations.");
        // --- END OF INITIALIZATIONS ---
    });

    console.log("Partial include processing initiated for all containers.");
});