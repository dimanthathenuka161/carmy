// Ceylon Wheels - Booking Wizard Logic

document.addEventListener('DOMContentLoaded', () => {
    // URL Query Params
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('carId');
    const urlPickup = urlParams.get('pickup');
    const urlDropoff = urlParams.get('dropoff');
    const urlPickupDate = urlParams.get('pickupDate');
    const urlDropoffDate = urlParams.get('dropoffDate');

    // UI Panels
    const warningPanel = document.getElementById('no-vehicle-selected-warning');
    const bookingFlow = document.getElementById('main-booking-flow');
    const successFlow = document.getElementById('booking-success-container');

    // Steppers and Panes
    const indicators = {
        1: document.getElementById('indicator-step-1'),
        2: document.getElementById('indicator-step-2'),
        3: document.getElementById('indicator-step-3'),
    };
    const panes = {
        1: document.getElementById('pane-step-1'),
        2: document.getElementById('pane-step-2'),
        3: document.getElementById('pane-step-3'),
    };

    // Form inputs
    const inputPickupLoc = document.getElementById('booking-pickup');
    const inputDropoffLoc = document.getElementById('booking-dropoff');
    const inputPickupDate = document.getElementById('booking-pickup-date');
    const inputPickupTime = document.getElementById('booking-pickup-time');
    const inputDropoffDate = document.getElementById('booking-dropoff-date');
    const inputDropoffTime = document.getElementById('booking-dropoff-time');

    const optSelf = document.getElementById('driver-opt-self');
    const optDriver = document.getElementById('driver-opt-driver');
    
    // Customer Inputs
    const inputName = document.getElementById('cust-name');
    const inputEmail = document.getElementById('cust-email');
    const inputPhone = document.getElementById('cust-phone');
    const inputNIC = document.getElementById('cust-nic');
    const inputLicense = document.getElementById('cust-license');

    // Card Inputs
    const inputCardNum = document.getElementById('pay-card-num');
    const inputCardExpiry = document.getElementById('pay-card-expiry');
    const inputCardCvv = document.getElementById('pay-card-cvv');

    // Summary Elements
    const sumCarDetails = document.getElementById('summary-car-details');
    const sumPickup = document.getElementById('sum-pickup-loc');
    const sumDropoff = document.getElementById('sum-dropoff-loc');
    const sumDuration = document.getElementById('sum-duration');
    const sumDriver = document.getElementById('sum-driver');
    const sumBaseRent = document.getElementById('sum-base-rent');
    const sumDriverCharge = document.getElementById('sum-driver-charge');
    const sumTax = document.getElementById('sum-tax');
    const sumDeposit = document.getElementById('sum-deposit');
    const sumTotalPrice = document.getElementById('sum-total-price');
    const btnPayAmount = document.getElementById('btn-pay-amount');

    // Success Invoice elements
    const sucBookingId = document.getElementById('suc-booking-id');
    const sucVehicleName = document.getElementById('suc-vehicle-name');
    const sucCustName = document.getElementById('suc-cust-name');
    const sucDates = document.getElementById('suc-dates');
    const sucTotalPrice = document.getElementById('suc-total-price');

    let currentStep = 1;
    let selectedCar = null;
    let bookingCalculation = {
        days: 1,
        driverOption: 'self',
        baseRent: 0,
        driverCharge: 0,
        tax: 0,
        deposit: 0,
        total: 0
    };

    // Initialize Page State
    if (!carId) {
        warningPanel.style.display = 'block';
        bookingFlow.style.display = 'none';
        return;
    } else {
        selectedCar = getVehicleById(carId);
        if (!selectedCar) {
            warningPanel.style.display = 'block';
            bookingFlow.style.display = 'none';
            return;
        }
        warningPanel.style.display = 'none';
        bookingFlow.style.display = 'grid';
    }

    // Set Default Dates and values (or read query values)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2); // 2 days default

    inputPickupDate.value = urlPickupDate || today.toISOString().split('T')[0];
    inputDropoffDate.value = urlDropoffDate || tomorrow.toISOString().split('T')[0];
    
    // Limits
    inputPickupDate.min = today.toISOString().split('T')[0];
    inputDropoffDate.min = inputPickupDate.value;

    if (urlPickup) inputPickupLoc.value = urlPickup;
    if (urlDropoff) inputDropoffLoc.value = urlDropoff;

    // Render Car card inside Sidebar
    sumCarDetails.innerHTML = `
        <img class="summary-car-img" src="${selectedCar.image}" alt="${selectedCar.name}">
        <div class="summary-car-info">
            <h4>${selectedCar.name}</h4>
            <p>${selectedCar.category} | ${selectedCar.transmission}</p>
            <p style="color: var(--primary); font-weight: 700; margin-top: 4px;">${formatLKR(selectedCar.pricePerDay)}/day</p>
        </div>
    `;

    // Calculate dates & LKR amounts
    function calculateInvoice() {
        const pDate = new Date(inputPickupDate.value);
        const dDate = new Date(inputDropoffDate.value);
        
        let diffTime = dDate.getTime() - pDate.getTime();
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) diffDays = 1; // Min 1 day rental

        bookingCalculation.days = diffDays;
        
        // Base Rent
        bookingCalculation.baseRent = selectedCar.pricePerDay * diffDays;

        // Driver Cost (LKR 3,000/day in Sri Lanka)
        if (bookingCalculation.driverOption === 'driver') {
            bookingCalculation.driverCharge = 3000 * diffDays;
            bookingCalculation.deposit = 0; // Waived!
        } else {
            bookingCalculation.driverCharge = 0;
            // Security deposit based on car type
            if (selectedCar.category === 'SUV' || selectedCar.category === 'Van') {
                bookingCalculation.deposit = 30000; // LKR 30,000 for SUVs and Vans
            } else {
                bookingCalculation.deposit = 15000; // LKR 15,000 for Hatchbacks and Sedans
            }
        }

        // Tax (8% VAT)
        bookingCalculation.tax = Math.round((bookingCalculation.baseRent + bookingCalculation.driverCharge) * 0.08);

        // Grand Total
        bookingCalculation.total = bookingCalculation.baseRent + bookingCalculation.driverCharge + bookingCalculation.tax + bookingCalculation.deposit;

        // Write outputs
        sumPickup.textContent = inputPickupLoc.value;
        sumDropoff.textContent = inputDropoffLoc.value;
        sumDuration.textContent = `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
        sumDriver.textContent = bookingCalculation.driverOption === 'driver' ? 'With Driver' : 'Self-Drive';

        sumBaseRent.textContent = formatLKR(bookingCalculation.baseRent);
        sumDriverCharge.textContent = formatLKR(bookingCalculation.driverCharge);
        sumTax.textContent = formatLKR(bookingCalculation.tax);
        sumDeposit.textContent = formatLKR(bookingCalculation.deposit);
        sumTotalPrice.textContent = formatLKR(bookingCalculation.total);
        btnPayAmount.textContent = formatLKR(bookingCalculation.total);
    }

    // Navigation and step control
    function goToStep(step) {
        indicators[currentStep].classList.remove('active');
        panes[currentStep].classList.remove('active');

        if (step > currentStep) {
            indicators[currentStep].classList.add('completed');
        } else {
            indicators[step].classList.remove('completed');
        }

        indicators[step].classList.add('active');
        panes[step].classList.add('active');
        
        currentStep = step;
        window.scrollTo(0, 0);
    }

    // Step 1 buttons
    document.getElementById('btn-next-1').addEventListener('click', () => {
        const pDate = new Date(inputPickupDate.value);
        const dDate = new Date(inputDropoffDate.value);
        if (dDate < pDate) {
            showToast('Drop-off date cannot be before pickup date!', 'error');
            return;
        }
        goToStep(2);
    });

    // Step 2 buttons
    document.getElementById('btn-back-2').addEventListener('click', () => {
        goToStep(1);
    });

    document.getElementById('btn-next-2').addEventListener('click', () => {
        const name = inputName.value.trim();
        const email = inputEmail.value.trim();
        const phone = inputPhone.value.trim();
        const nic = inputNIC.value.trim();
        const license = inputLicense.value.trim();

        // Validation
        if (!name || !email || !phone || !nic) {
            showToast('Please fill all required personal fields!', 'error');
            return;
        }

        if (bookingCalculation.driverOption === 'self' && !license) {
            showToast('Driving License is required for self-drive options!', 'error');
            return;
        }

        goToStep(3);
    });

    // Step 3 buttons
    document.getElementById('btn-back-3').addEventListener('click', () => {
        goToStep(2);
    });

    // Checkout process
    document.getElementById('btn-pay-now').addEventListener('click', () => {
        const cardNum = inputCardNum.value.trim();
        const cardExpiry = inputCardExpiry.value.trim();
        const cardCvv = inputCardCvv.value.trim();
        
        // Simple card validation check
        const payMethodCheckbox = document.querySelector('input[name="payment-method"]:checked');
        const isWallet = payMethodCheckbox && payMethodCheckbox.value === 'wallet';

        if (!isWallet) {
            if (!cardNum || !cardExpiry || !cardCvv) {
                showToast('Please enter your credit/debit card details!', 'error');
                return;
            }
        }

        // Simulating Booking API save
        const newBooking = {
            vehicleId: selectedCar.id,
            vehicleName: selectedCar.name,
            customerName: inputName.value.trim(),
            customerEmail: inputEmail.value.trim(),
            customerPhone: inputPhone.value.trim(),
            nic: inputNIC.value.trim(),
            licenseNumber: inputLicense.value.trim() || 'N/A (Hired Driver)',
            pickupLocation: inputPickupLoc.value,
            dropoffLocation: inputDropoffLoc.value,
            pickupDate: inputPickupDate.value,
            pickupTime: inputPickupTime.value,
            dropoffDate: inputDropoffDate.value,
            dropoffTime: inputDropoffTime.value,
            days: bookingCalculation.days,
            driverOption: bookingCalculation.driverOption,
            driverCost: bookingCalculation.driverCharge,
            subtotal: bookingCalculation.baseRent,
            tax: bookingCalculation.tax,
            deposit: bookingCalculation.deposit,
            totalPrice: bookingCalculation.total,
            status: "Pending",
            paymentMethod: isWallet ? "Mobile Wallet" : "Card"
        };

        const saved = saveBooking(newBooking);

        // Populating receipt
        sucBookingId.textContent = saved.id;
        sucVehicleName.textContent = saved.vehicleName;
        sucCustName.textContent = saved.customerName;
        sucDates.textContent = `${saved.pickupDate} (${saved.pickupTime}) to ${saved.dropoffDate} (${saved.dropoffTime})`;
        sucTotalPrice.textContent = formatLKR(saved.totalPrice);

        // Success Transition
        bookingFlow.style.display = 'none';
        successFlow.style.display = 'block';
        window.scrollTo(0, 0);

        showToast('Payment Simulated Successfully! Booking created.', 'success');
    });

    // Listeners for calculator recalculations
    inputPickupDate.addEventListener('change', () => {
        inputDropoffDate.min = inputPickupDate.value;
        if (inputDropoffDate.value < inputPickupDate.value) {
            inputDropoffDate.value = inputPickupDate.value;
        }
        calculateInvoice();
    });
    inputDropoffDate.addEventListener('change', calculateInvoice);
    inputPickupLoc.addEventListener('change', calculateInvoice);
    inputDropoffLoc.addEventListener('change', calculateInvoice);

    // Driver options select listeners
    optSelf.addEventListener('click', () => {
        optSelf.classList.add('selected');
        optDriver.classList.remove('selected');
        bookingCalculation.driverOption = 'self';
        calculateInvoice();
    });

    optDriver.addEventListener('click', () => {
        optDriver.classList.add('selected');
        optSelf.classList.remove('selected');
        bookingCalculation.driverOption = 'driver';
        calculateInvoice();
    });

    // Run first calculations
    calculateInvoice();
});
