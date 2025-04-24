/**
 * assets/js/include.js
 * Fetches HTML partials and injects them into corresponding container elements.
 * Initializes necessary JavaScript AFTER partials are loaded, including the gallery.
 */

// --- Gallery Initialization Function ---
// Define it here so it's available within the DOMContentLoaded scope
function initializePhotoGallery() {
    // Check if already initialized to prevent errors if called multiple times
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection || gallerySection.dataset.galleryInitialized === 'true') {
        if(gallerySection && gallerySection.dataset.galleryInitialized === 'true') {
            console.log("Gallery: Initialization skipped (already initialized).");
        } else if (!gallerySection) {
            console.log("Gallery: Initialization skipped (section #gallery not found).");
        }
        return; // Exit if section not found or already initialized
    }

    console.log("Gallery (from include.js): Attempting to initialize...");

    // Mark as initialized *early* to prevent race conditions if called again quickly
    gallerySection.dataset.galleryInitialized = 'true';

    // --- Get gallery elements (scope to the section) ---
    const galleryDisplayArea = gallerySection.querySelector('#galleryDisplayArea');
    const imageElement = gallerySection.querySelector('#displayedImage');
    const titleElement = gallerySection.querySelector('#imageTitle');
    const descriptionElement = gallerySection.querySelector('#imageDescription');
    const prevButton = gallerySection.querySelector('#prevButton');
    const nextButton = gallerySection.querySelector('#nextButton');
    const dotsContainer = gallerySection.querySelector('#galleryDotsContainer');
    const errorPlaceholder = gallerySection.querySelector('#galleryImageErrorPlaceholder');

    // --- Check if essential elements exist ---
    if (!galleryDisplayArea || !imageElement || !titleElement || !descriptionElement || !prevButton || !nextButton || !dotsContainer || !errorPlaceholder) {
        console.error("Gallery (from include.js): Initialization failed: One or more essential elements not found within #gallery section.");
        gallerySection.dataset.galleryInitialized = 'false'; // Reset flag on error
        return;
    }
    // --- End Element Check ---

    // --- Gallery image data ---
    const galleryImages = [
        { src: 'assets/images/gallery/img1.jpg', alt: 'Precizní řezný nůž', title: 'Precizní řezný nůž', description: 'Vysoce kvalitní řezné nástroje pro průmyslové aplikace' },
        { src: 'assets/images/gallery/img2.jpg', alt: 'Strojní vybavení', title: 'Strojní vybavení', description: 'Moderní technologické vybavení pro přesnou výrobu' },
        { src: 'assets/images/gallery/img3.jpg', alt: 'Zakázková výroba', title: 'Zakázková výroba', description: 'Komponenty na míru vašim specifickým potřebám' },
        { src: 'https://placehold.co/1200x675/1f2937/FFFFFF?text=Precision+Engineering', alt: 'Přesné inženýrství', title: 'Přesné inženýrství', description: 'Dokonalost v každém detailu našich výrobků' },
        { src: 'https://placehold.co/1200x675/1f2937/FFFFFF?text=Quality+Control', alt: 'Kontrola kvality', title: 'Kontrola kvality', description: 'Důkladná kontrola zajišťuje perfektní kvalitu' }
    ];

    let currentIndex = 0;
    let intervalId = null;
    let dotButtons = [];
    let isTransitioning = false;

    // --- Generate Dots ---
    function generateDots() {
        dotsContainer.innerHTML = '';
        dotButtons = [];
        galleryImages.forEach((_, index) => {
            const button = document.createElement('button');
            button.setAttribute('aria-label', `Přejít na obrázek ${index + 1}`);
            button.classList.add('w-3', 'h-3', 'rounded-full', 'transition-colors', 'duration-300');
            button.dataset.index = index;
            if (index === currentIndex) {
                button.classList.add('bg-blue-500');
            } else {
                button.classList.add('bg-white/30', 'hover:bg-white/50');
            }
            button.addEventListener('click', function() {
                if (isTransitioning || parseInt(this.dataset.index) === currentIndex) return;
                showImage(parseInt(this.dataset.index));
                resetInterval();
            });
            dotsContainer.appendChild(button);
            dotButtons.push(button);
        });
        console.log(`Gallery (from include.js): Generated ${dotButtons.length} dots.`);
    }

    // --- Function to display a specific image ---
    function showImage(index, isInitialLoad = false) {
        if (isTransitioning && !isInitialLoad) {
            console.log("Gallery (from include.js): Transition in progress, skipping showImage call.");
            return;
        }
        // Bounds check
        if (index < 0) index = galleryImages.length - 1;
        if (index >= galleryImages.length) index = 0;

        if (index === currentIndex && !isInitialLoad && imageElement.style.display !== 'none') {
            console.log("Gallery (from include.js): showImage called with same index, skipping update.");
            // Ensure initial image is visible if needed
            if (imageElement.style.opacity !== '1') { imageElement.style.opacity = '1'; }
            return;
        }

        console.log(`Gallery (from include.js): Showing image index: ${index}`);
        isTransitioning = !isInitialLoad;

        currentIndex = index;

        // Update text and dots
        titleElement.textContent = galleryImages[currentIndex].title;
        descriptionElement.textContent = galleryImages[currentIndex].description;
        dotButtons.forEach((dot, i) => {
            const dotIndex = parseInt(dot.dataset.index);
            if (dotIndex === currentIndex) {
                dot.classList.remove('bg-white/30', 'hover:bg-white/50');
                dot.classList.add('bg-blue-500');
            } else {
                dot.classList.remove('bg-blue-500');
                dot.classList.add('bg-white/30', 'hover:bg-white/50');
            }
        });

        // Fade out logic
        if (!isInitialLoad && imageElement.style.display !== 'none') {
            imageElement.style.opacity = '0';
        } else {
            imageElement.style.opacity = '0'; // Ensure starts hidden for initial fade
        }
        errorPlaceholder.style.display = 'none';

        // Wait for fade out (or just proceed on initial load), then update image source
        setTimeout(() => {
            imageElement.style.display = 'block';
            imageElement.src = galleryImages[currentIndex].src; // Set the new source

            // Use Image object for reliable load/error handling
            const tempImage = new Image();
            tempImage.onload = () => {
                console.log(`Gallery (from include.js): Image ${currentIndex} loaded successfully.`);
                imageElement.src = tempImage.src;
                imageElement.style.opacity = '1'; // Fade in
                isTransitioning = false;
            };
            tempImage.onerror = () => {
                console.error('Gallery (from include.js): Failed to load image:', galleryImages[currentIndex].src);
                imageElement.style.display = 'none';
                imageElement.style.opacity = '0';
                errorPlaceholder.style.display = 'flex';
                isTransitioning = false;
            };
            tempImage.src = galleryImages[currentIndex].src;

        }, isInitialLoad ? 10 : 500);
    }

    // --- Auto-rotate images ---
    function startInterval() {
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            showImage(currentIndex + 1);
        }, 5000);
        console.log("Gallery (from include.js): Interval started.");
    }

    function resetInterval() {
        clearInterval(intervalId);
        startInterval();
        console.log("Gallery (from include.js): Interval reset.");
    }

    // --- Event listeners ---
    if (!galleryDisplayArea.dataset.listenersAttachedInclude) { // Use unique flag
        console.log("Gallery (from include.js): Attaching event listeners.");
        prevButton.addEventListener('click', () => {
            if (isTransitioning) return;
            showImage(currentIndex - 1);
            resetInterval();
        });
        nextButton.addEventListener('click', () => {
            if (isTransitioning) return;
            showImage(currentIndex + 1);
            resetInterval();
        });

        galleryDisplayArea.addEventListener('mouseenter', () => {
            clearInterval(intervalId);
            console.log("Gallery (from include.js): Interval paused (mouseenter).");
        });
        galleryDisplayArea.addEventListener('mouseleave', () => {
            if (intervalId !== null) {
                startInterval();
                console.log("Gallery (from include.js): Interval resumed (mouseleave).");
            }
        });

        // Touch swipe support
        let touchStartX = 0;
        galleryDisplayArea.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        galleryDisplayArea.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            handleSwipe(touchStartX, touchEndX);
        }, { passive: true });

        function handleSwipe(startX, endX) {
            if (isTransitioning) return;
            const swipeThreshold = 50;
            if (startX - endX > swipeThreshold) {
                console.log("Gallery (from include.js): Swipe Left detected");
                showImage(currentIndex + 1);
                resetInterval();
            } else if (endX - startX > swipeThreshold) {
                console.log("Gallery (from include.js): Swipe Right detected");
                showImage(currentIndex - 1);
                resetInterval();
            }
        }

        // Keypress navigation
        document.addEventListener('keydown', (e) => {
            const galleryRect = gallerySection.getBoundingClientRect();
            const isVisible = galleryRect.top < window.innerHeight && galleryRect.bottom >= 0;
            if (isVisible && !isTransitioning) {
                if (e.key === 'ArrowLeft') {
                    console.log("Gallery (from include.js): Arrow Left key pressed");
                    e.preventDefault();
                    showImage(currentIndex - 1);
                    resetInterval();
                } else if (e.key === 'ArrowRight') {
                    console.log("Gallery (from include.js): Arrow Right key pressed");
                    e.preventDefault();
                    showImage(currentIndex + 1);
                    resetInterval();
                }
            }
        });

        galleryDisplayArea.dataset.listenersAttachedInclude = 'true';
    } else {
        console.log("Gallery (from include.js): Listeners already attached.");
    }

    // --- Initial Setup ---
    generateDots();
    showImage(0, true); // Initial load
    startInterval();

    console.log("Photo gallery initialized successfully from include.js.");
}
// --- End Gallery Initialization Function ---


// --- Main include.js Logic ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Starting partial include process...");

    const partialContainers = document.querySelectorAll('[id$="-container"]');
    const totalPartials = partialContainers.length;
    console.log(`Found ${totalPartials} partial containers.`);

    function getBasePath() {
        // If using file:// protocol, don't use leading slash for paths
        if (window.location.protocol === 'file:') {
            return '.'; // Use relative path for file:// protocol
        }

        // For web servers
        const pathSegments = window.location.pathname.split('/');
        const repoName = pathSegments[1] && !pathSegments[1].includes('.html') ? `/${pathSegments[1]}` : '';
        const finalBasePath = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : repoName;
        console.log(`Detected base path: '${finalBasePath}'`);
        return finalBasePath;
    }

    const basePath = getBasePath();

    const fetchHtml = async (url) => {
        const adjustedUrl = `${basePath}/${url}`;
        console.log(`Workspaceing: ${adjustedUrl}`);
        try {
            const response = await fetch(adjustedUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} for ${adjustedUrl}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`Error fetching partial ${adjustedUrl}:`, error);
            return `<div class="p-4 text-red-500 bg-red-100 border border-red-400 rounded">Error loading content: ${error.message}</div>`;
        }
    };

    // --- Other Initialization Functions (Keep these) ---
    const initializeMobileNav = () => {
        // ... (keep existing mobile nav logic) ...
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
            console.warn("Mobile menu elements not found, will retry soon.");
            // Simple retry mechanism
            if (!window.mobileNavRetries) window.mobileNavRetries = 0;
            if (window.mobileNavRetries < 3) {
                window.mobileNavRetries++;
                setTimeout(initializeMobileNav, 300);
            }
        }
    };

    const tryAOSRefresh = () => { // Or full AOS init if moved here
        if (typeof AOS !== 'undefined' && typeof AOS.refresh === 'function') {
            // If AOS is initialized elsewhere, refresh it.
            // If AOS init is moved here, replace refresh with init.
            console.log("Attempting AOS refresh...");
            try { AOS.refresh(); console.log("AOS refreshed."); }
            catch(e) { console.error("Error refreshing AOS:", e); }
        } else {
            console.log("AOS library/refresh not available, skipping refresh.");
        }
    };

    const initializeFloatingContact = () => {
        // ... (keep existing floating contact logic) ...
        const floatingButtons = document.querySelectorAll('.floating-contact .contact-btn');
        if (floatingButtons.length > 0 && !floatingButtons[0].dataset.floatInitialized) {
            floatingButtons.forEach((btn, index) => {
                btn.style.animationDelay = `${index * 0.1}s`;
                btn.classList.add('animate-float');
                btn.dataset.floatInitialized = 'true'; // Prevent re-adding class
            });
            console.log("Floating contact buttons initialized.");
        }
    };

    // No particle init needed here if handled by inline script in hero.html
    // const initializeParticleEffects = () => { ... };

    const initializeSmoothScrolling = () => {
        // ... (keep existing smooth scroll logic) ...
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            if (!anchor.dataset.smoothScrollListener) { // Prevent adding multiple listeners
                anchor.addEventListener('click', function (e) {
                    const targetId = this.getAttribute('href');
                    if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            e.preventDefault();
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                });
                anchor.dataset.smoothScrollListener = 'true';
            }
        });
        console.log("Smooth scrolling initialized for anchor links.");
    };
    // --- End Other Initialization Functions ---


    if (totalPartials === 0) {
        console.warn("No partial containers found on the page.");
        // Run initializations that don't depend on partials
        initializeMobileNav(); // Nav might be static
        initializeFloatingContact();
        initializeSmoothScrolling();
        // Try to initialize gallery even if no partials (maybe it's static?)
        initializePhotoGallery();
        // Refresh AOS if it exists
        tryAOSRefresh();
        return;
    }

    const fetchPromises = [];
    partialContainers.forEach((container) => {
        const partialName = container.id.replace('-container', '');
        if (!partialName) {
            console.warn(`Container ID ${container.id} invalid.`); return;
        }
        const partialUrl = `partials/${partialName}.html`;
        console.log(`Processing #${container.id} -> ${partialUrl}`);

        const fetchPromise = fetchHtml(partialUrl)
            .then(htmlContent => {
                try {
                    container.innerHTML = htmlContent;
                    container.classList.add('loaded');
                    console.log(`Injected HTML for ${partialName}`);

                    // IMPORTANT: If partials contain THEIR OWN scripts (like hero particles),
                    // you STILL need the script execution logic here.
                    // If ONLY the gallery logic was moved out, you might not need it,
                    // but it's safer to keep it if other partials have scripts.
                    const scripts = container.querySelectorAll('script');
                    if (scripts.length > 0) {
                        console.log(`Found ${scripts.length} script(s) in partial ${partialName}, executing...`);
                        scripts.forEach(oldScript => {
                            const newScript = document.createElement('script');
                            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                            newScript.textContent = oldScript.textContent;
                            oldScript.parentNode.replaceChild(newScript, oldScript);
                        });
                    }

                    return { name: partialName, status: 'fulfilled' };
                } catch (e) {
                    console.error(`Error processing content for ${partialName}:`, e);
                    container.innerHTML = `<div class="p-4 text-red-700 bg-red-100">Failed to render ${partialName}.</div>`;
                    return { name: partialName, status: 'rejected', reason: e };
                }
            })
            .catch(error => { // Catches fetch errors primarily
                console.error(`Promise failed for ${partialName} during fetch:`, error);
                if (!container.innerHTML.includes('Error loading content')) {
                    container.innerHTML = `<div class="p-4 text-red-700 bg-red-100">Critical loading error for ${partialName}.</div>`;
                }
                return { name: partialName, status: 'rejected', reason: error };
            });
        fetchPromises.push(fetchPromise);
    });

    // Wait for all fetches and injections to settle
    Promise.allSettled(fetchPromises).then((results) => {
        console.log("All fetch/inject promises settled. Running initializations.");

        results.forEach(result => {
            if (result.status === 'rejected' || (result.status === 'fulfilled' && result.value.status === 'rejected')) {
                const partialName = result.reason?.name || result.value?.name || 'Unknown';
                console.error(`Failed to process partial: ${partialName}`, result.reason || result.value?.reason);
            }
        });

        // --- RUN ALL INITIALIZATIONS HERE (AFTER PARTIALS LOADED) ---
        initializeMobileNav(); // Ensure nav works after potential replacement
        initializeFloatingContact();
        initializeSmoothScrolling();

        // Initialize Gallery explicitly now
        initializePhotoGallery(); // Call the function defined above

        // Refresh AOS (or initialize it if moved here)
        tryAOSRefresh();

        console.log("Include script finished post-load initializations.");
    });

    console.log("Partial include processing initiated.");
});