
        // Page navigation
        function showPage(pageName) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show selected page
            const pageMap = {
                'home': 'homePage',
                'guides': 'guidesPage',
                'categories': 'categoriesPage',
                'about': 'aboutPage',
                'heist-guide': 'heistGuidePage'
            };
            
            const pageId = pageMap[pageName];
            if (pageId) {
                document.getElementById(pageId).classList.add('active');
            }
            
            // Update active nav link
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // Close mobile menu
            document.getElementById('navLinks').classList.remove('active');
        }
        
        // Mobile menu toggle
        function toggleMenu() {
            document.getElementById('navLinks').classList.toggle('active');
        }
        
        // Interactive map functionality
        document.addEventListener('DOMContentLoaded', function() {
            const legendItems = document.querySelectorAll('.legend-item');
            const markers = document.querySelectorAll('.map-marker');
            
            legendItems.forEach(item => {
                item.addEventListener('click', function() {
                    const targetPoint = this.getAttribute('data-target');
                    
                    // Remove active class from all items and markers
                    legendItems.forEach(i => i.classList.remove('active'));
                    markers.forEach(m => m.classList.remove('active'));
                    
                    // Add active class to clicked item
                    this.classList.add('active');
                    
                    // Find and activate corresponding marker
                    const targetMarker = document.querySelector(`.map-marker[data-point="${targetPoint}"]`);
                    if (targetMarker) {
                        targetMarker.classList.add('active');
                    }
                });
            });
            
            // Also allow clicking markers directly
            markers.forEach(marker => {
                marker.addEventListener('click', function() {
                    const targetPoint = this.getAttribute('data-point');
                    
                    // Remove active class from all
                    legendItems.forEach(i => i.classList.remove('active'));
                    markers.forEach(m => m.classList.remove('active'));
                    
                    // Activate this marker
                    this.classList.add('active');
                    
                    // Activate corresponding legend item
                    const targetLegendItem = document.querySelector(`.legend-item[data-target="${targetPoint}"]`);
                    if (targetLegendItem) {
                        targetLegendItem.classList.add('active');
                    }
                });
            });
        });
        







function updateDates() {
    document.querySelectorAll(".update-date").forEach(el => {

        const [year, month, day] = el.dataset.date.split("-").map(Number);
        const past = new Date(year, month - 1, day);
        const now = new Date();

        const diffDays = Math.floor((now - past) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            el.textContent = "dzisiaj";
        } else if (diffDays === 1) {
            el.textContent = "wczoraj";
        } else {
            el.textContent = `${diffDays} dni temu`;
        }
    });
}

// uruchom po załadowaniu strony
document.addEventListener("DOMContentLoaded", updateDates);






function setupActive(selector) {
    const items = document.querySelectorAll(selector);

    items.forEach(item => {
        item.addEventListener("click", () => {
            items.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });
}

// dla pietra
setupActive(".pietra-item");

// dla gora/dol
setupActive(".goradol-item");







const items = document.querySelectorAll(".goradol-item");
const img1 = document.querySelector(".img1");
const img2 = document.querySelector(".img2");

items.forEach(item => {
    item.addEventListener("click", () => {
        items.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        const view = item.dataset.view;

        if (view === "top") {
            img1.style.opacity = "1";
            img2.style.opacity = "0.15";

        } else if (view === "bottom") {
            img1.style.opacity = "0.15";
            img2.style.opacity = "1";

        } else if (view === "both") {
            // 🔥 CAŁOŚĆ
            img1.style.opacity = "1";
            img2.style.opacity = "1";
        }
    });
});





document.addEventListener("DOMContentLoaded", () => {

    const img1 = document.querySelector(".img1");
    const img2 = document.querySelector(".img2");

    const fsImg1 = document.querySelector(".fs-img1");
    const fsImg2 = document.querySelector(".fs-img2");

    const fullscreen = document.getElementById("fullscreen");
    const fullscreenBtn = document.getElementById("fullscreenBtn");

    const items = document.querySelectorAll(".goradol-item");

    let currentView = "both";

    // 🔥 MAPA – zmiana widoku
    function updateView(view) {

        if (view === "top") {
            img1.style.opacity = "1";
            img2.style.opacity = "0.3";

        } else if (view === "bottom") {
            img1.style.opacity = "0.3";
            img2.style.opacity = "1";

        } else {
            img1.style.opacity = "1";
            img2.style.opacity = "1";
        }
    }

    // 🔥 klik przycisków
    items.forEach(item => {
        item.addEventListener("click", () => {

            items.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            currentView = item.dataset.view;
            updateView(currentView);
        });
    });

    // 🔥 FULLSCREEN OPEN (z animacją)
    fullscreenBtn.addEventListener("click", () => {

        fsImg1.src = img1.src;
        fsImg2.src = img2.src;

        fsImg1.style.display = "block";
        fsImg2.style.display = "block";

        if (currentView === "top") {

            fsImg1.style.opacity = "1";
            fsImg2.style.opacity = "0.3";

        } else if (currentView === "bottom") {

            fsImg1.style.opacity = "0.3";
            fsImg2.style.opacity = "1";

        } else {

            fsImg1.style.opacity = "1";
            fsImg2.style.opacity = "1";
        }

        fullscreen.style.display = "flex";

        // 🔥 fade-in efekt
        requestAnimationFrame(() => {
            fullscreen.classList.add("show");
        });
    });

    // 🔥 FULLSCREEN CLOSE (z animacją)
    fullscreen.addEventListener("click", () => {

        fullscreen.classList.remove("show");

        setTimeout(() => {
            fullscreen.style.display = "none";
        }, 200);
    });

    // 🔥 start
    updateView(currentView);
});