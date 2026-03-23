import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBndxR-j5FSCNd0RUtvTruQUxUx6-p_EW4",
  authDomain: "deltatamizhanfx.firebaseapp.com",
  projectId: "deltatamizhanfx",
  storageBucket: "deltatamizhanfx.firebasestorage.app",
  messagingSenderId: "379499130954",
  appId: "1:379499130954:web:c324ca67d47f993bd3b6b3",
  measurementId: "G-PN7HJNF0W5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const products = [
    { 
        id: 1, 
        name: "After Effects Quality Enhancer CC", 
        price: 1, 
        img: "https://i.postimg.cc/Twc8YyYV/CC.jpg",
        link: "https://drive.google.com/drive/folders/1FiMYtDWVqecIKLbmMoWuvtVcx-Txrab6"
    },
    { 
        id: 2, 
        name: "Topaz AI High-Quality Settings", 
        price: 1, 
        img: "https://i.postimg.cc/QxCLhdLN/Topaz.jpg",
        link: "https://drive.google.com/drive/folders/1NUrYq4Xl8eN3uQJG80YQtshIGUjRAim_"
    },
    { 
        id: 3, 
        name: "Adobe Media Encoder Lossless", 
        price: 1, 
        img: "https://i.postimg.cc/qqm9y9K4/ME.jpg",
        link: "https://drive.google.com/drive/folders/1rYL3TLfQ0Tq7tS-0Rw71thHPD3IOCLYa"
    }
];

let cart = [];
let purchasedAssets = []; 

const toggleDrawer = (id, show) => {
    const el = document.getElementById(id);
    if(show) el.classList.add('open'); else el.classList.remove('open');
    document.getElementById('ui-overlay').style.display = show ? 'block' : 'none';
};

document.getElementById('menu-open').onclick = () => toggleDrawer('nav-drawer', true);
document.getElementById('menu-close').onclick = () => toggleDrawer('nav-drawer', false);
document.getElementById('cart-open').onclick = () => { toggleDrawer('cart-drawer', true); renderCart(); };
document.getElementById('cart-close').onclick = () => toggleDrawer('cart-drawer', false);
document.getElementById('ui-overlay').onclick = () => { 
    toggleDrawer('nav-drawer', false); 
    toggleDrawer('cart-drawer', false); 
};

// --- AUTH ---
document.getElementById('login-trigger').onclick = async () => {
    const e = document.getElementById('login-email').value.trim();
    const p = document.getElementById('login-password').value.trim();
    try { await signInWithEmailAndPassword(auth, e, p); } catch(err) { alert(err.message); }
};

document.getElementById('signup-trigger').onclick = async () => {
    const e = document.getElementById('login-email').value.trim();
    const p = document.getElementById('login-password').value.trim();
    try { 
        await createUserWithEmailAndPassword(auth, e, p); 
        document.getElementById('success-popup').style.display = 'flex';
    } catch(err) { alert(err.message); }
};

document.getElementById('logout-trigger').onclick = () => {
    signOut(auth);
    purchasedAssets = [];
};

onAuthStateChanged(auth, (user) => {
    document.getElementById('auth-section').style.display = user ? 'none' : 'block';
    document.getElementById('user-profile').style.display = user ? 'flex' : 'none';
    document.getElementById('purchases-view').style.display = 'none';
    if(user) document.getElementById('display-user-email').innerText = user.email;
});

// --- PURCHASES VIEW LOGIC ---
document.getElementById('my-purchases-btn').onclick = () => {
    document.getElementById('user-profile').style.display = 'none';
    document.getElementById('purchases-view').style.display = 'block';
    
    const container = document.getElementById('purchased-list-container');
    if(purchasedAssets.length === 0) {
        container.innerHTML = `<p style="color:var(--text-dim); margin-top:10px; font-size:0.85rem;">No assets purchased yet.</p>`;
    } else {
        container.innerHTML = purchasedAssets.map(item => `
            <div style="background:var(--surface-light); padding:15px; border-radius:12px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.05);">
                <span style="font-size:0.85rem; display:block; margin-bottom:10px; font-weight:600;">${item.name}</span>
                <a href="${item.link}" target="_blank" class="action-btn login-primary" style="display:inline-block; text-decoration:none; padding:8px 15px; font-size:0.75rem; width:auto; margin-top:0;">Download</a>
            </div>
        `).join('');
    }
};

document.getElementById('back-to-profile').onclick = () => {
    document.getElementById('user-profile').style.display = 'flex';
    document.getElementById('purchases-view').style.display = 'none';
};

// --- CART LOGIC ---
window.addItem = (id) => {
    const item = products.find(p => p.id === id);
    if (!cart.find(c => c.id === id)) {
        cart.push(item);
        document.getElementById('cart-count').innerText = cart.length;
    }
    toggleDrawer('cart-drawer', true);
    renderCart();
};

window.removeItem = (id) => {
    cart = cart.filter(item => item.id !== id);
    document.getElementById('cart-count').innerText = cart.length;
    renderCart();
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    let total = 0;
    if (cart.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:var(--text-dim); margin-top:20px;">Empty</p>`;
    } else {
        list.innerHTML = cart.map(item => {
            total += item.price;
            return `
                <div class="cart-item">
                    <div>
                        <span style="font-size:0.85rem;">${item.name}</span>
                        <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
                    </div>
                    <span style="font-weight:700;"><span class="r-sym">₹</span>${item.price}</span>
                </div>
            `;
        }).join('');
    }
    document.getElementById('cart-total').innerHTML = `<span class="r-sym">₹</span>${total}`;
}

// --- RAZORPAY ---
document.getElementById('checkout-trigger').onclick = () => {
    const user = auth.currentUser;
    if (cart.length === 0) return alert("Cart is empty");
    if (!user) {
        alert("Please login first");
        toggleDrawer('nav-drawer', true);
        toggleDrawer('cart-drawer', false);
        return;
    }

    const total = cart.reduce((s, i) => s + i.price, 0);

    const options = {
        "key": "rzp_live_SUb1nskZR2DxTy", 
        "amount": total * 100, 
        "currency": "INR",
        "name": "Delta Tamizhan Fx",
        "description": "Premium Asset Purchase",
        "handler": function (response) {
            purchasedAssets = [...purchasedAssets, ...cart];
            cart = [];
            document.getElementById('cart-count').innerText = 0;
            renderCart();
            toggleDrawer('cart-drawer', false);
            toggleDrawer('nav-drawer', true);
            document.getElementById('my-purchases-btn').click();
            alert("Payment Success! Links unlocked in 'My Purchases'.");
        },
        "prefill": { "email": user.email },
        "theme": { "color": "#00f2ff" }
    };
    new Razorpay(options).open();
};

// Render Products
document.getElementById('product-list').innerHTML = products.map(p => `
    <div class="card">
        <div class="thumb-container"><img src="${p.img}" class="product-img"></div>
        <div class="card-content">
            <h4 style="margin-bottom:10px;">${p.name}</h4>
            <span class="price" style="color:var(--primary); font-weight:700; display:block; margin-bottom:15px;">
                <span class="r-sym">₹</span>${p.price}
            </span>
            <button class="action-btn login-primary" onclick="addItem(${p.id})">Add to Cart</button>
        </div>
    </div>
`).join('');

document.getElementById('close-popup').onclick = () => {
    document.getElementById('success-popup').style.display = 'none';
};