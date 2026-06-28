// Ceylon Wheels - Admin Portal Logic

document.addEventListener('DOMContentLoaded', () => {
    // Nav Navigation
    const menuItems = document.querySelectorAll('.admin-menu-item');
    const panes = document.querySelectorAll('.admin-pane');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPaneId = item.getAttribute('data-target');
            
            // Switch Menu active state
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // Switch Pane active state
            panes.forEach(pane => {
                if (pane.id === targetPaneId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });

            // Trigger specific pane loads
            if (targetPaneId === 'pane-reports') {
                renderReports();
            }
        });
    });

    // Quick jump button from dashboard to bookings
    document.getElementById('dashboard-to-bookings-btn').addEventListener('click', () => {
        const bookingsMenuItem = document.querySelector('[data-target="pane-bookings"]');
        if (bookingsMenuItem) bookingsMenuItem.click();
    });

    // --- Modal Registration ---
    const addVehicleModal = document.getElementById('add-vehicle-modal');
    const addVehicleBtn = document.getElementById('add-vehicle-btn');
    const addVehicleCloseBtn = document.getElementById('add-vehicle-close-btn');
    const addVehicleForm = document.getElementById('add-vehicle-form');

    addVehicleBtn.addEventListener('click', () => {
        addVehicleModal.classList.add('open');
    });

    function closeVehicleModal() {
        addVehicleModal.classList.remove('open');
        addVehicleForm.reset();
    }

    addVehicleCloseBtn.addEventListener('click', closeVehicleModal);
    addVehicleModal.addEventListener('click', (e) => {
        if (e.target === addVehicleModal) closeVehicleModal();
    });

    addVehicleForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('car-name').value.trim();
        const category = document.getElementById('car-category').value;
        const transmission = document.getElementById('car-transmission').value;
        const fuel = document.getElementById('car-fuel').value;
        const price = parseInt(document.getElementById('car-price').value);
        const passengers = parseInt(document.getElementById('car-passengers').value);
        const engine = document.getElementById('car-engine').value.trim();
        const featuresText = document.getElementById('car-features').value;
        const image = document.getElementById('car-image').value;

        const features = featuresText 
            ? featuresText.split(',').map(f => f.trim()).filter(f => f.length > 0)
            : ["Air Conditioning", "Bluetooth Audio", "Dual Airbags"];

        const newCar = {
            name,
            category,
            transmission,
            fuel,
            pricePerDay: price,
            passengers,
            baggage: Math.max(1, passengers - 2),
            image,
            status: "Available",
            year: new Date().getFullYear(),
            engine,
            rating: 5.0,
            reviewsCount: 0,
            features
        };

        saveVehicle(newCar);
        showToast(`${name} registered to fleet successfully!`, 'success');
        
        closeVehicleModal();
        renderAllPanes();
    });

    // --- Booking Search Filter ---
    const bookingSearchInput = document.getElementById('booking-search-q');
    bookingSearchInput.addEventListener('input', () => {
        renderBookingsQueue(bookingSearchInput.value.trim().toLowerCase());
    });

    // --- Main Rendering Pipelines ---
    function renderStats() {
        const bookings = getBookings();
        const vehicles = getVehicles();

        // Calculate Revenue (Approved and Completed bookings sum)
        const totalRev = bookings
            .filter(b => b.status === 'Approved' || b.status === 'Completed')
            .reduce((sum, b) => sum + (b.totalPrice - b.deposit), 0); // subtract deposit to show real revenue

        // Counts
        const activeCount = bookings.filter(b => b.status === 'Approved').length;
        const pendingCount = bookings.filter(b => b.status === 'Pending').length;

        document.getElementById('stat-revenue').textContent = formatLKR(totalRev);
        document.getElementById('stat-active').textContent = activeCount;
        document.getElementById('stat-fleet').textContent = vehicles.length;
        document.getElementById('stat-pending').textContent = pendingCount;
    }

    function renderRecentActivity() {
        const bookings = getBookings();
        const recent = bookings.slice(-5).reverse(); // Get last 5 bookings
        const tbody = document.getElementById('recent-bookings-tbody');

        if (recent.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No rentals placed yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = recent.map(b => `
            <tr>
                <td style="font-weight: 700; color: var(--primary);">${b.id}</td>
                <td>
                    <div style="font-weight: 600;">${b.customerName}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${b.customerPhone}</div>
                </td>
                <td>${b.vehicleName}</td>
                <td>${b.pickupDate} to ${b.dropoffDate}</td>
                <td style="font-weight: 600;">${formatLKR(b.totalPrice)}</td>
                <td><span class="status-badge ${b.status.toLowerCase()}">${b.status}</span></td>
            </tr>
        `).join('');
    }

    function renderBookingsQueue(searchQuery = '') {
        const bookings = getBookings();
        const tbody = document.getElementById('bookings-queue-tbody');

        const filtered = bookings.filter(b => 
            b.customerName.toLowerCase().includes(searchQuery) ||
            b.vehicleName.toLowerCase().includes(searchQuery) ||
            b.id.toLowerCase().includes(searchQuery)
        ).reverse();

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">No bookings match search details.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(b => {
            let actionsHTML = '';
            
            if (b.status === 'Pending') {
                actionsHTML = `
                    <div class="action-buttons">
                        <button class="btn-icon approve" title="Approve Booking" data-id="${b.id}">✓</button>
                        <button class="btn-icon cancel" title="Cancel Booking" data-id="${b.id}">×</button>
                    </div>
                `;
            } else if (b.status === 'Approved') {
                actionsHTML = `
                    <button class="btn btn-primary complete-btn" style="padding: 6px 12px; font-size: 11px; border-radius: 6px;" data-id="${b.id}">Complete Ride</button>
                `;
            } else {
                actionsHTML = `<span style="font-size: 12px; color: var(--text-muted); font-style: italic;">No actions</span>`;
            }

            return `
                <tr>
                    <td style="font-weight: 700; color: var(--primary);">${b.id}</td>
                    <td>
                        <div style="font-weight: 600;">${b.customerName}</div>
                        <div style="font-size: 12px; color: var(--text-muted);">${b.customerEmail}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">NIC: ${b.nic}</div>
                    </td>
                    <td>
                        <div style="font-weight: 600;">${b.vehicleName}</div>
                        <div style="font-size: 11px; color: var(--primary-light); font-weight: 500;">
                            ${b.driverOption === 'driver' ? '👨‍✈️ Hired Driver' : '🚗 Self-Drive'}
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 500;">${b.pickupLocation} ➔ ${b.dropoffLocation}</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                            📅 ${b.pickupDate} to ${b.dropoffDate} (${b.days} Days)
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 700;">${formatLKR(b.totalPrice)}</div>
                        <div style="font-size: 10px; color: var(--text-muted);">Method: ${b.paymentMethod}</div>
                    </td>
                    <td><span class="status-badge ${b.status.toLowerCase()}">${b.status}</span></td>
                    <td>${actionsHTML}</td>
                </tr>
            `;
        }).join('');

        // Attach action handlers
        document.querySelectorAll('.approve').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                updateBookingStatus(id, 'Approved');
                showToast(`Booking ${id} approved!`, 'success');
                renderAllPanes();
            });
        });

        document.querySelectorAll('.cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                updateBookingStatus(id, 'Cancelled');
                showToast(`Booking ${id} cancelled!`, 'error');
                renderAllPanes();
            });
        });

        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                updateBookingStatus(id, 'Completed');
                showToast(`Ride ${id} completed! Fleet status returned.`, 'success');
                renderAllPanes();
            });
        });
    }

    function renderFleetManager() {
        const vehicles = getVehicles();
        const tbody = document.getElementById('fleet-manager-tbody');

        tbody.innerHTML = vehicles.map(car => `
            <tr data-id="${car.id}">
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${car.image}" alt="${car.name}" style="width: 50px; height: 40px; object-fit: contain; background: var(--bg-sub); border-radius: 4px; padding: 2px;">
                        <div>
                            <div style="font-weight: 600;">${car.name}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">${car.year} Model</div>
                        </div>
                    </div>
                </td>
                <td>${car.category}</td>
                <td>
                    <div style="font-size: 13px;">${car.transmission} | ${car.fuel}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${car.passengers} seats | ${car.engine}</div>
                </td>
                <td style="font-weight: 600; color: var(--primary);">${formatLKR(car.pricePerDay)}</td>
                <td><span class="status-badge approved" style="font-size: 10px;">${car.status}</span></td>
                <td>
                    <button class="btn-icon delete-car-btn" title="Remove from fleet" data-id="${car.id}" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');

        // Attach delete action
        document.querySelectorAll('.delete-car-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const car = getVehicleById(id);
                if (confirm(`Are you sure you want to remove ${car.name} from the Ceylon Wheels fleet?`)) {
                    deleteVehicle(id);
                    showToast(`${car.name} removed from fleet.`, 'info');
                    renderAllPanes();
                }
            });
        });
    }

    // Reports & Visualization logic (Pure CSS/SVG)
    function renderReports() {
        const bookings = getBookings();
        const vehicles = getVehicles();

        // 1. Calculate Monthly Revenue (April - July 2026)
        // Group by month
        const monthlyData = {
            '2026-04': 120000, // Seed initial values
            '2026-05': 280000, 
            '2026-06': 0,
            '2026-07': 0
        };

        // Add up approved/completed booking values
        bookings.forEach(b => {
            if (b.status === 'Approved' || b.status === 'Completed') {
                const monthKey = b.bookingDate.substring(0, 7); // e.g. "2026-06"
                const rentalRevenue = b.totalPrice - b.deposit; // exclude refundable deposit from revenue
                if (monthlyData[monthKey] !== undefined) {
                    monthlyData[monthKey] += rentalRevenue;
                } else {
                    monthlyData[monthKey] = rentalRevenue;
                }
            }
        });

        // Convert key-val to sorted array
        const sortedMonths = Object.keys(monthlyData).sort();
        const monthNamesMap = {
            '04': 'April',
            '05': 'May',
            '06': 'June',
            '07': 'July'
        };

        const maxVal = Math.max(...Object.values(monthlyData), 50000);
        const chartContainer = document.getElementById('revenue-chart-container');
        
        chartContainer.innerHTML = sortedMonths.map(monthKey => {
            const val = monthlyData[monthKey];
            const monthSuffix = monthKey.split('-')[1];
            const monthName = monthNamesMap[monthSuffix] || monthKey;
            
            // Calculate height as percentage (leaving space for values at top)
            const percentHeight = Math.round((val / maxVal) * 80); 

            return `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="height: ${percentHeight}%; height: max(${percentHeight}%, 4px);">
                        <span class="chart-bar-value" style="font-size: 9px;">${Math.round(val / 1000)}K</span>
                    </div>
                    <span class="chart-bar-label">${monthName}</span>
                </div>
            `;
        }).join('');

        // 2. Calculate Car Popularity Share (based on booking frequencies)
        const carRentalsCount = {};
        let totalRentals = 0;

        bookings.forEach(b => {
            const vId = b.vehicleId;
            carRentalsCount[vId] = (carRentalsCount[vId] || 0) + 1;
            totalRentals++;
        });

        const popularityList = document.getElementById('popularity-chart-list');
        
        // Sort vehicles by rent frequency
        const carShares = vehicles.map(car => {
            const count = carRentalsCount[car.id] || 0;
            const percentage = totalRentals > 0 ? Math.round((count / totalRentals) * 100) : 0;
            return {
                name: car.name,
                count,
                percentage
            };
        }).sort((a, b) => b.count - a.count);

        // Render top 4 list items with pure CSS bar fills
        popularityList.innerHTML = carShares.slice(0, 4).map((item, idx) => {
            const colors = ['#6b21a8', '#3b82f6', '#06b6d4', '#f97316'];
            const color = colors[idx] || '#64748b';

            return `
                <div class="pie-list-item">
                    <div style="flex-grow: 1; margin-right: 20px;">
                        <div class="pie-list-car">
                            <span class="pie-list-color" style="background-color: ${color}"></span>
                            <span>${item.name}</span>
                        </div>
                        <div class="progress-bar-track">
                            <div class="progress-bar-fill" style="width: ${item.percentage}%; background: ${color};"></div>
                        </div>
                    </div>
                    <div class="pie-list-percentage">${item.percentage}%</div>
                </div>
            `;
        }).join('');
    }

    // Master pane renderer
    function renderAllPanes() {
        renderStats();
        renderRecentActivity();
        renderBookingsQueue();
        renderFleetManager();
        renderReports();
    }

    // Run renderers on load
    renderAllPanes();
});
