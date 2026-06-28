// Ceylon Wheels - LocalStorage Database Wrapper

const DEFAULT_VEHICLES = [
    {
        id: "v1",
        name: "Suzuki Wagon R FZ",
        category: "Hatchback",
        transmission: "Automatic",
        fuel: "Hybrid / Petrol",
        passengers: 4,
        baggage: 2,
        pricePerDay: 7500,
        image: "assets/images/suzuki_wagonr.jpg",
        status: "Available",
        year: 2018,
        engine: "650cc",
        rating: 4.8,
        reviewsCount: 24,
        features: ["Air Conditioning", "Bluetooth Audio", "Keyless Entry", "Dual Airbags"]
    },
    {
        id: "v2",
        name: "Toyota Aqua G Grade",
        category: "Hatchback",
        transmission: "Automatic",
        fuel: "Hybrid / Petrol",
        passengers: 5,
        baggage: 3,
        pricePerDay: 9500,
        image: "assets/images/toyota_aqua.jpg",
        status: "Available",
        year: 2016,
        engine: "1500cc",
        rating: 4.9,
        reviewsCount: 42,
        features: ["Climate Control", "Reverse Camera", "Lane Departure Alert", "EV/ECO Modes"]
    },
    {
        id: "v3",
        name: "Toyota Axio WxB",
        category: "Sedan",
        transmission: "Automatic",
        fuel: "Hybrid / Petrol",
        passengers: 5,
        baggage: 4,
        pricePerDay: 11500,
        image: "assets/images/toyota_axio.jpg",
        status: "Available",
        year: 2017,
        engine: "1500cc",
        rating: 4.7,
        reviewsCount: 31,
        features: ["Premium Leather Seats", "Push Start", "LED Headlights", "Pre-Collision System"]
    },
    {
        id: "v4",
        name: "Toyota Prius S Touring",
        category: "Sedan",
        transmission: "Automatic",
        fuel: "Hybrid / Petrol",
        passengers: 5,
        baggage: 4,
        pricePerDay: 14000,
        image: "assets/images/toyota_prius.jpg",
        status: "Available",
        year: 2018,
        engine: "1800cc",
        rating: 4.9,
        reviewsCount: 56,
        features: ["Head-up Display", "Radar Cruise Control", "Dual Zone A/C", "JBL Premium Sound"]
    },
    {
        id: "v5",
        name: "Honda Vezel Z SENSING",
        category: "SUV",
        transmission: "Automatic",
        fuel: "Hybrid / Petrol",
        passengers: 5,
        baggage: 4,
        pricePerDay: 16500,
        image: "assets/images/honda_vezel.jpg",
        status: "Available",
        year: 2016,
        engine: "1500cc",
        rating: 4.8,
        reviewsCount: 38,
        features: ["Paddle Shifts", "Honda SENSING safety", "Electric Parking Brake", "Roof Rails"]
    },
    {
        id: "v6",
        name: "Toyota KDH Super GL 206",
        category: "Van",
        transmission: "Automatic",
        fuel: "Diesel",
        passengers: 10,
        baggage: 8,
        pricePerDay: 19000,
        image: "assets/images/toyota_kdh.jpg",
        status: "Available",
        year: 2016,
        engine: "3000cc (1KD)",
        rating: 4.9,
        reviewsCount: 65,
        features: ["Dual A/C", "Rotating Seats", "Velour Interior", "Android Infotainment"]
    },
    {
        id: "v7",
        name: "Mitsubishi Montero Sport GT",
        category: "SUV",
        transmission: "Automatic",
        fuel: "Diesel",
        passengers: 7,
        baggage: 6,
        pricePerDay: 35000,
        image: "assets/images/mitsubishi_montero.jpg",
        status: "Available",
        year: 2018,
        engine: "2400cc MIVEC",
        rating: 4.9,
        reviewsCount: 19,
        features: ["4WD Super Select", "Sunroof", "Leather Electric Seats", "Blind Spot Monitor"]
    },
    {
        id: "v8",
        name: "Toyota Land Cruiser V8 ZX",
        category: "SUV",
        transmission: "Automatic",
        fuel: "Diesel",
        passengers: 7,
        baggage: 6,
        pricePerDay: 65000,
        image: "assets/images/toyota_landcruiser.jpg",
        status: "Available",
        year: 2018,
        engine: "4500cc Twin Turbo",
        rating: 5.0,
        reviewsCount: 12,
        features: ["Air Suspension", "Cool Box", "Rear Entertainment System", "Matrix LED Headlamps"]
    }
];

const DEFAULT_BOOKINGS = [
    {
        id: "BK-1001",
        vehicleId: "v4",
        vehicleName: "Toyota Prius S Touring",
        customerName: "Kamal Perera",
        customerEmail: "kamal.p@gmail.com",
        customerPhone: "+94 77 123 4567",
        nic: "1992284712V",
        licenseNumber: "B8274912",
        pickupLocation: "Colombo (CMB)",
        dropoffLocation: "Colombo (CMB)",
        pickupDate: "2026-07-01",
        pickupTime: "09:00",
        dropoffDate: "2026-07-05",
        dropoffTime: "18:00",
        days: 4,
        driverOption: "self", // 'self' or 'driver'
        driverCost: 0,
        subtotal: 56000,
        tax: 4480, // 8% VAT
        deposit: 15000, // Refundable security deposit
        totalPrice: 75480,
        status: "Approved",
        bookingDate: "2026-06-20",
        paymentMethod: "Card"
    },
    {
        id: "BK-1002",
        vehicleId: "v6",
        vehicleName: "Toyota KDH Super GL 206",
        customerName: "Nimal Silva",
        customerEmail: "nimal.silva@yahoo.com",
        customerPhone: "+94 71 987 6543",
        nic: "1985392819V",
        licenseNumber: "B1238491",
        pickupLocation: "Katunayake Airport (BIA)",
        dropoffLocation: "Kandy",
        pickupDate: "2026-07-10",
        pickupTime: "07:30",
        dropoffDate: "2026-07-15",
        dropoffTime: "19:00",
        days: 5,
        driverOption: "driver", // With driver
        driverCost: 15000, // LKR 3,000 per day for driver
        subtotal: 110000, // (19000 * 5) + 15000
        tax: 8800,
        deposit: 0, // No deposit needed when driver is hired
        totalPrice: 118800,
        status: "Pending",
        bookingDate: "2026-06-25",
        paymentMethod: "Card"
    }
];

// Seed databases if they don't exist
function initDB() {
    if (!localStorage.getItem("cw_vehicles")) {
        localStorage.setItem("cw_vehicles", JSON.stringify(DEFAULT_VEHICLES));
    }
    if (!localStorage.getItem("cw_bookings")) {
        localStorage.setItem("cw_bookings", JSON.stringify(DEFAULT_BOOKINGS));
    }
}

// Vehicles CRUD and queries
function getVehicles() {
    initDB();
    return JSON.parse(localStorage.getItem("cw_vehicles"));
}

function getVehicleById(id) {
    const vehicles = getVehicles();
    return vehicles.find(v => v.id === id);
}

function saveVehicle(vehicle) {
    const vehicles = getVehicles();
    if (vehicle.id) {
        // Edit existing
        const idx = vehicles.findIndex(v => v.id === vehicle.id);
        if (idx !== -1) {
            vehicles[idx] = vehicle;
        }
    } else {
        // Add new
        vehicle.id = "v_" + Date.now();
        vehicles.push(vehicle);
    }
    localStorage.setItem("cw_vehicles", JSON.stringify(vehicles));
    return vehicle;
}

function deleteVehicle(id) {
    let vehicles = getVehicles();
    vehicles = vehicles.filter(v => v.id !== id);
    localStorage.setItem("cw_vehicles", JSON.stringify(vehicles));
}

// Bookings CRUD and queries
function getBookings() {
    initDB();
    return JSON.parse(localStorage.getItem("cw_bookings"));
}

function saveBooking(booking) {
    const bookings = getBookings();
    if (!booking.id) {
        booking.id = "BK-" + Math.floor(1000 + Math.random() * 9000);
        booking.bookingDate = new Date().toISOString().split("T")[0];
    }
    bookings.push(booking);
    localStorage.setItem("cw_bookings", JSON.stringify(bookings));

    // Update vehicle status to Rented in DB to simulate fleet changes (optional)
    return booking;
}

function updateBookingStatus(bookingId, status) {
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
        bookings[idx].status = status;
        localStorage.setItem("cw_bookings", JSON.stringify(bookings));
        return bookings[idx];
    }
    return null;
}

// Initialize the database on load
initDB();
