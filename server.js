let cart = [];

// YOUR RAZORPAY TEST KEY INTEGRATED
const RAZORPAY_KEY = "rzp_test_SUOptp0MfsLpo2";

// MAP PRODUCT NAMES TO YOUR DRIVE LINKS
const productDatabase = {
    "After Effects Quality Enhancer CC": "https://drive.google.com/uc?id=FILE_ID_1",
    "Topaz AI High-Quality Settings": "https://drive.google.com/uc?id=FILE_ID_2",
    "Adobe Media Encoder Lossless": "https://drive.google.com/uc?id=FILE_ID_3"
};

// UI CONTROLS
function toggleMenu(s) { document.getElementById('nav-drawer').classList.toggle('open', s); showOverlay(s); }
function toggleCart(s) { document.getElementById('cart-drawer').classList.toggle('open', s); showOverlay(s); if(s) renderCart(); }
function toggleDownloads(s) { closeAll(); document.getElementById('downloads-drawer').classList.toggle('open', s); showOverlay(s); }
function showOverlay(s) { document.getElementById('ui-overlay').style.display = s ? 'block' : 'none'; }
function closeAll() { ['nav-drawer', 'cart-drawer', 'downloads-drawer'].forEach(id => document.getElementById(id).classList.remove('open')); showOverlay(false); }

// CART LOGIC
function addItem(name, price) {
    // EACH PRODUCT CAN ADD ONLY ONE TIME
    if (cart.some(item => item.name === name)) {
        alert("This item is already in your cart.");
        toggleCart(true);
        return;
    }
    cart.push({ name, price });
    updateCartIcon();
    toggleCart(true);
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartIcon();
    renderCart();
}

function updateCartIcon() {
    // UPDATES COUNT TO 0 CORRECTLY
    document.getElementById('cart-count').innerText = cart.length;
}

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const totalDisp = document.getElementById('cart-total');
    let total = 0;
    
    if (cart.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding: 40px; color:#555;">Your cart is empty.</div>`;
        totalDisp.innerText = "₹0";
        return;
    }

    list.innerHTML = "";
    cart.forEach((item, index) => {
        total += item.price;
        list.innerHTML += `
            <div class="cart-item-row">
                <div>
                    <span style="font-size:0.85rem; font-weight:500;">${item.name}</span>
                    <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
                </div>
                <span style="font-weight:700; color: var(--primary);">₹${item.price}</span>
            </div>`;
    });
    totalDisp.innerText = `₹${total}`;
}

// CHECKOUT & REDIRECT
function startCheckout() {
    if (cart.length === 0) return;
    const amount = cart.reduce((sum, item) => sum + item.price, 0);

    const options = {
        "key": RAZORPAY_KEY,
        "amount": amount * 100, // INR in paise
        "currency": "INR",
        "name": "Delta Tamizhan Fx",
        "description": "Premium Asset Purchase",
        "handler": function (response) {
            handlePaymentSuccess();
        },
        "theme": { "color": "#00f2ff" }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

function handlePaymentSuccess() {
    // ONCE FINISH PAYMENT NEED TO REDIRECT TO GOOGLE DRIVE
    if (cart.length === 1) {
        const link = productDatabase[cart[0].name];
        window.location.href = link;
    } else {
        alert("Success! Your downloads are available in the sidebar.");
        toggleCart(false);
        toggleDownloads(true);
    }

    // RESET CART TO 0
    cart = [];
    updateCartIcon();
}

function checkAccess() {
    const id = document.getElementById('order-id-input').value.toUpperCase().trim();
    if (id.startsWith("DTX")) {
        document.getElementById('files-list').style.display = "block";
        document.getElementById('available-links').innerHTML = `
            <div style="background:#1c1f24; padding:15px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.8rem;">Unlocked Asset</span>
                <a href="#" style="color:var(--primary); font-weight:700; text-decoration:none;">DOWNLOAD</a>
            </div>`;
    } else {
        alert("Invalid ID.");
    }
}