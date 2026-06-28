// Ceylon Wheels - Fleet Page Logic

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gridContainer = document.getElementById('fleet-grid-container');
    const searchInput = document.getElementById('search-input');
    const priceSlider = document.getElementById('price-slider');
    const sliderLabel = document.getElementById('slider-val-label');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const resultsCount = document.getElementById('results-count');
    
    const categoryCheckboxes = document.querySelectorAll('.category-filter');
    const transmissionCheckboxes = document.querySelectorAll('.transmission-filter');
    const fuelCheckboxes = document.querySelectorAll('.fuel-filter');
    
    // Modal Elements
    const detailModal = document.getElementById('detail-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCarName = document.getElementById('modal-car-name');
    const modalBodyContent = document.getElementById('modal-body-content');

    // Get URL Query Params on Load
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('type');
    const urlSearch = urlParams.get('search');
    
    // Set initial filters from URL if available
    if (urlCategory) {
        categoryCheckboxes.forEach(cb => {
            if (cb.value.toLowerCase() === urlCategory.toLowerCase()) {
                cb.checked = true;
            }
        });
    }
    if (urlSearch) {
        searchInput.value = urlSearch;
    }

    // Load and render
    function renderFleet() {
        const vehicles = getVehicles();
        const searchQuery = searchInput.value.toLowerCase().trim();
        const maxPrice = parseInt(priceSlider.value);
        
        // Active Filter Arrays
        const activeCategories = Array.from(categoryCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const activeTransmissions = Array.from(transmissionCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const activeFuels = Array.from(fuelCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

        // Filter the database
        const filteredVehicles = vehicles.filter(car => {
            // Search Query Filter
            const matchesSearch = car.name.toLowerCase().includes(searchQuery) || 
                                  car.category.toLowerCase().includes(searchQuery);
            
            // Price Filter
            const matchesPrice = car.pricePerDay <= maxPrice;
            
            // Category Filter
            const matchesCategory = activeCategories.length === 0 || activeCategories.includes(car.category);
            
            // Transmission Filter
            const matchesTransmission = activeTransmissions.length === 0 || activeTransmissions.includes(car.transmission);
            
            // Fuel Filter
            const matchesFuel = activeFuels.length === 0 || activeFuels.some(fuel => {
                if (fuel === 'Hybrid') return car.fuel.includes('Hybrid') || car.fuel.includes('Petrol');
                if (fuel === 'Diesel') return car.fuel.toLowerCase() === 'diesel';
                return false;
            });

            return matchesSearch && matchesPrice && matchesCategory && matchesTransmission && matchesFuel;
        });

        // Update count label
        resultsCount.textContent = `${filteredVehicles.length} ${filteredVehicles.length === 1 ? 'Car' : 'Cars'} Found`;

        // Render to grid
        if (filteredVehicles.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🚗🚫</div>
                    <h3>No Vehicles Match Your Search</h3>
                    <p style="color: var(--text-muted); margin-top: 8px;">Try clearing filters or searching for another vehicle.</p>
                </div>
            `;
            return;
        }

        gridContainer.innerHTML = filteredVehicles.map(car => `
            <div class="fleet-card" data-id="${car.id}">
                <div class="fleet-card-img-wrapper" style="cursor: pointer;">
                    <span class="fleet-card-badge ${car.category.toLowerCase()}">${car.category}</span>
                    <img src="${car.image}" alt="${car.name}">
                </div>
                <div class="fleet-card-content">
                    <h3 class="fleet-card-title" style="cursor: pointer;">${car.name}</h3>
                    <div class="fleet-card-rating" style="cursor: pointer;">
                        ⭐ ${car.rating} <span class="reviews">(${car.reviewsCount} reviews)</span>
                    </div>
                    <div class="fleet-card-specs" style="cursor: pointer;">
                        <div class="spec-item">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>${car.passengers} Seats</span>
                        </div>
                        <div class="spec-item">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span>${car.transmission}</span>
                        </div>
                        <div class="spec-item">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>${car.fuel}</span>
                        </div>
                        <div class="spec-item">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>${car.engine}</span>
                        </div>
                    </div>
                    <div class="fleet-card-footer">
                        <div class="fleet-card-price">
                            <h4>${formatLKR(car.pricePerDay)}</h4>
                            <span>/ day</span>
                        </div>
                        <div class="action-buttons">
                            <button class="btn btn-outline detail-btn" style="padding: 10px 14px; font-size: 13px;">Details</button>
                            <a href="booking.html?carId=${car.id}" class="btn btn-secondary" style="padding: 10px 14px; font-size: 13px;">Rent</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-attach listeners to details buttons / images click
        document.querySelectorAll('.fleet-card-img-wrapper, .fleet-card-title, .fleet-card-rating, .fleet-card-specs, .detail-btn').forEach(el => {
            el.addEventListener('click', (e) => {
                const card = e.target.closest('.fleet-card');
                if (card) {
                    const carId = card.getAttribute('data-id');
                    openDetailsModal(carId);
                }
            });
        });
    }

    // Modal Display Logic
    function openDetailsModal(id) {
        const car = getVehicleById(id);
        if (!car) return;

        modalCarName.textContent = car.name;
        
        modalBodyContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px;">
                <div>
                    <div style="background: var(--bg-sub); border-radius: var(--radius-md); padding: 20px; display: flex; align-items: center; justify-content: center; height: 260px;">
                        <img src="${car.image}" alt="${car.name}" style="max-height: 100%; object-fit: contain;">
                    </div>
                    
                    <h4 style="margin-top: 24px; margin-bottom: 12px; font-size: 16px;">Key Features</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${car.features.map(feat => `
                            <span style="background-color: rgba(107, 33, 168, 0.05); color: var(--primary); padding: 6px 12px; border-radius: var(--radius-full); font-size: 12px; font-weight: 600;">✅ ${feat}</span>
                        `).join('')}
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                            <span class="status-badge approved" style="font-size: 10px;">${car.status}</span>
                            <span class="status-badge completed" style="font-size: 10px;">${car.year} Model</span>
                        </div>

                        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">
                            A premium ${car.category} with ${car.engine} fuel-efficient engine, well suited for highway cruising and city drives across Sri Lanka.
                        </p>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; border-top: 1px solid var(--border); padding-top: 16px;">
                            <div>
                                <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Category</span>
                                <p style="font-weight: 600; font-size: 14px;">${car.category}</p>
                            </div>
                            <div>
                                <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Fuel Type</span>
                                <p style="font-weight: 600; font-size: 14px;">${car.fuel}</p>
                            </div>
                            <div>
                                <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Transmission</span>
                                <p style="font-weight: 600; font-size: 14px;">${car.transmission}</p>
                            </div>
                            <div>
                                <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Seating</span>
                                <p style="font-weight: 600; font-size: 14px;">${car.passengers} Passengers</p>
                            </div>
                        </div>
                    </div>

                    <div style="border-top: 1px solid var(--border); padding-top: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <div>
                                <span style="font-size: 12px; color: var(--text-muted);">Daily Rate</span>
                                <h3 style="color: var(--primary); font-size: 26px; line-height: 1;">${formatLKR(car.pricePerDay)}</h3>
                            </div>
                            <div style="text-align: right;">
                                <span style="color: #eab308; font-weight: 700; font-size: 15px;">⭐ ${car.rating}</span>
                                <p style="font-size: 11px; color: var(--text-muted);">${car.reviewsCount} reviews</p>
                            </div>
                        </div>

                        <a href="booking.html?carId=${car.id}" class="btn btn-secondary" style="width: 100%; text-align: center;">Book This Car Now</a>
                    </div>
                </div>
            </div>
        `;

        detailModal.classList.add('open');
    }

    // Close Modal
    function closeModal() {
        detailModal.classList.remove('open');
    }

    modalCloseBtn.addEventListener('click', closeModal);
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeModal();
    });

    // Slider change event
    priceSlider.addEventListener('input', () => {
        sliderLabel.textContent = formatLKR(priceSlider.value);
        renderFleet();
    });

    // Other inputs change event
    searchInput.addEventListener('input', renderFleet);
    categoryCheckboxes.forEach(cb => cb.addEventListener('change', renderFleet));
    transmissionCheckboxes.forEach(cb => cb.addEventListener('change', renderFleet));
    fuelCheckboxes.forEach(cb => cb.addEventListener('change', renderFleet));

    // Clear filters logic
    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        priceSlider.value = priceSlider.max;
        sliderLabel.textContent = formatLKR(priceSlider.max);
        
        categoryCheckboxes.forEach(cb => cb.checked = false);
        transmissionCheckboxes.forEach(cb => cb.checked = false);
        fuelCheckboxes.forEach(cb => cb.checked = false);
        
        renderFleet();
        showToast('All filters cleared!', 'info');
    });

    // Initial render
    renderFleet();
});
