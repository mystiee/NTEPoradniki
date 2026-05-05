document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // MAP ELEMENTS
    // =========================

    const layer = document.querySelector(".map-layer");

    const fsImg1 = document.querySelector(".fs-img1");
    const fsImg2 = document.querySelector(".fs-img2");

    const fullscreen = document.getElementById("fullscreen");
    const fullscreenBtn = document.getElementById("fullscreenBtn");

    const floorItems = document.querySelectorAll(".pietra-item");
    const viewItems = document.querySelectorAll(".goradol-item");

    const markers = document.querySelectorAll(".map-marker");
    const legendItems = document.querySelectorAll(".legend-item");

    const mapa = document.querySelector(".mapa");
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");

    // =========================
    // LAYERS
    // =========================

    const layers = {
        "1": {
            g: document.querySelector(".img-1g"),
            d: document.querySelector(".img-1d")
        },
        "2": {
            g: document.querySelector(".img-2g"),
            d: document.querySelector(".img-2d")
        },
        "3": {
            g: document.querySelector(".img-3g"),
            d: document.querySelector(".img-3d")
        },
        "4": {
            single: document.querySelector(".img-4")
        }
    };

    let currentFloor = "1";
    let currentView = "both";

    // =========================
    // VIEW (GÓRA/DÓŁ)
    // =========================

    function updateView(floor, view) {

        Object.values(layers).forEach(l => {
            if (l.g) l.g.style.opacity = "0";
            if (l.d) l.d.style.opacity = "0";
            if (l.single) l.single.style.opacity = "0";
        });

        const l = layers[floor];
        if (!l) return;

        if (floor === "4") {
            if (l.single) l.single.style.opacity = "1";
            return;
        }

        if (view === "top") {
            l.g.style.opacity = "1";
            l.d.style.opacity = "0.3";
        } else if (view === "bottom") {
            l.g.style.opacity = "0.3";
            l.d.style.opacity = "1";
        } else {
            l.g.style.opacity = "1";
            l.d.style.opacity = "1";
        }
    }

    // =========================
    // MARKERS
    // =========================

    function updateMarkers(floor) {

        markers.forEach(m => {
            m.classList.toggle("active", m.dataset.floor === floor);
        });
    }

    // =========================
    // LEGEND
    // =========================

    function updateLegend(floor) {

        legendItems.forEach(item => {
            item.style.display = item.dataset.floor === floor ? "block" : "none";
        });
    }

    // =========================
    // GÓRA/DÓŁ TOGGLE (SKARBIEC FIX)
    // =========================

    function toggleViewButtons(floor) {

        viewItems.forEach(btn => {

            if (floor === "4") {
                btn.style.opacity = "0.3";
                btn.style.pointerEvents = "none";
            } else {
                btn.style.opacity = "1";
                btn.style.pointerEvents = "auto";
            }
        });
    }

    // =========================
    // FLOOR SWITCH
    // =========================

    floorItems.forEach(item => {
        item.addEventListener("click", () => {

            floorItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            currentFloor = item.dataset.view;

            updateView(currentFloor, currentView);
            updateMarkers(currentFloor);
            updateLegend(currentFloor);
            toggleViewButtons(currentFloor);
        });
    });

    // =========================
    // VIEW SWITCH
    // =========================

    viewItems.forEach(item => {
        item.addEventListener("click", () => {

            if (currentFloor === "4") return;

            viewItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            currentView = item.dataset.view;

            updateView(currentFloor, currentView);
        });
    });

    // =========================
    // FULLSCREEN
    // =========================

    fullscreenBtn.addEventListener("click", () => {

        const l = layers[currentFloor];
        if (!l) return;

        if (currentFloor === "4") {

            fsImg1.src = l.single?.src || "";
            fsImg2.style.display = "none";

        } else {

            fsImg1.src = l.g?.src || "";
            fsImg2.src = l.d?.src || "";
            fsImg2.style.display = "block";
        }

        fullscreen.style.display = "flex";

        requestAnimationFrame(() => {
            fullscreen.classList.add("show");
        });
    });

    fullscreen.addEventListener("click", () => {
        fullscreen.classList.remove("show");

        setTimeout(() => {
            fullscreen.style.display = "none";
        }, 200);
    });

    // =========================
    // ZOOM + DRAG
    // =========================

    let scale = 1;
    let x = 0;
    let y = 0;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let pointerId = null;

    function render() {
        layer.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }

    zoomIn.addEventListener("click", (e) => {
        e.stopPropagation();
        scale = Math.min(scale + 0.2, 3);
        render();
    });

    zoomOut.addEventListener("click", (e) => {
        e.stopPropagation();
        scale = Math.max(scale - 0.2, 1);

        if (scale === 1) {
            x = 0;
            y = 0;
        }

        render();
    });

    mapa.addEventListener("pointerdown", (e) => {

        if (e.target.closest(".zoom-controls") || e.target.closest(".fullscreen-btn")) return;

        dragging = true;
        pointerId = e.pointerId;

        mapa.setPointerCapture(pointerId);

        startX = e.clientX - x;
        startY = e.clientY - y;

        mapa.style.cursor = "grabbing";
    });

    mapa.addEventListener("pointermove", (e) => {

        if (!dragging || e.pointerId !== pointerId) return;

        x = e.clientX - startX;
        y = e.clientY - startY;

        render();
    });

    function stop(e) {
        dragging = false;
        pointerId = null;
        mapa.style.cursor = "grab";

        try {
            mapa.releasePointerCapture(e.pointerId);
        } catch {}
    }

    mapa.addEventListener("pointerup", stop);
    mapa.addEventListener("pointercancel", stop);

    // =========================
    // INIT
    // =========================

    updateView(currentFloor, currentView);
    updateMarkers(currentFloor);
    updateLegend(currentFloor);
    toggleViewButtons(currentFloor);
    render();
});