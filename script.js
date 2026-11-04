
document.addEventListener("DOMContentLoaded", () => {

    // ELEMENTS
    const gallery = document.querySelector(".gallery");
    const searchInput = document.querySelector(".search-box input");
    const categoryButtons = document.querySelectorAll(".category-btn");
    const uploadForm = document.querySelector(".admin-panel");

    let wallpapers = [];
    let selectedCategory = "all";

    // LOAD EXISTING WALLPAPERS
    function loadWallpapers() {
        try {
            wallpapers = JSON.parse(
                localStorage.getItem("cricketWallpapers") || "[]"
            );
        } catch (error) {
            wallpapers = [];
        }

        displayWallpapers();
    }

    // DISPLAY WALLPAPERS
    function displayWallpapers() {
        if (!gallery) return;

        gallery.innerHTML = "";

        const searchText = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        const filtered = wallpapers.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchText) ||
                item.category.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                item.category.toLowerCase() === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        if (filtered.length === 0) {
            gallery.innerHTML =
                '<p style="color:#d4af37;text-align:center;grid-column:1/-1;">No wallpapers found.</p>';
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement("div");
            card.className = "wallpaper-card";

            const image = document.createElement("img");
            image.src = item.image;
            image.alt = item.name;
            image.loading = "lazy";

            const info = document.createElement("div");
            info.className = "wallpaper-info";

            const heading = document.createElement("h3");
            heading.textContent = item.name;

            const description = document.createElement("p");
            description.textContent = item.category;

            const download = document.createElement("a");
            download.className = "download-btn";
            download.href = item.image;
            download.download = item.name.replace(/\s+/g, "-");
            download.textContent = "Download Wallpaper";

            info.append(heading, description, download);
            card.append(image, info);
            gallery.appendChild(card);
        });
    }

    // SEARCH
    if (searchInput) {
        searchInput.addEventListener("input", displayWallpapers);
    }

    // CATEGORY FILTER
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {

            categoryButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            selectedCategory =
                button.dataset.category?.toLowerCase() ||
                button.textContent.trim().toLowerCase();

            displayWallpapers();
        });
    });

    // ADMIN UPLOAD
    if (uploadForm) {
        const uploadButton = uploadForm.querySelector("button");
        
        if (uploadButton) {
            uploadButton.addEventListener("click", event => {
                event.preventDefault();

                const inputs = uploadForm.querySelectorAll("input");
                const nameInput = inputs[0];
                const imageInput = inputs[1];
                const categoryInput = uploadForm.querySelector("select");

                if (!nameInput || !imageInput || !imageInput.files[0]) {
                    alert("Please enter a wallpaper name and select an image.");
                    return;
                }

                const file = imageInput.files[0];

                if (!file.type.startsWith("image/")) {
                    alert("Please select a valid image.");
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    alert("Image must be smaller than 5 MB.");
                    return;
                }

                const reader = new FileReader();

                reader.onload = function () {

                    const wallpaper = {
                        id: Date.now(),
                        name: nameInput.value.trim(),
                        category: categoryInput
                            ? categoryInput.value
                            : "Other",
                        image: reader.result
                    };

                    if (!wallpaper.name) {
                        alert("Enter a wallpaper name.");
                        return;
                    }

                    wallpapers.push(wallpaper);

                    try {
                        localStorage.setItem(
                            "cricketWallpapers",
                            JSON.stringify(wallpapers)
                        );

                        displayWallpapers();

                        nameInput.value = "";
                        imageInput.value = "";

                        alert("Wallpaper uploaded successfully!");
                    } catch (error) {
                        alert("Storage limit reached. Use permanent image storage for uploads.");
                    }
                };

                reader.readAsDataURL(file);
            });
        }
    }

    // INITIALIZE
    loadWallpapers();

});
