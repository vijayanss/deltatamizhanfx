import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

const products = [
    { id: 1, name: "After Effects Quality Enhancer CC", price: 199, img: "https://i.postimg.cc/Twc8YyYV/CC.jpg" },
    { id: 2, name: "Topaz AI High-Quality Settings", price: 199, img: "https://i.postimg.cc/QxCLhdLN/Topaz.jpg" },
    { id: 3, name: "Adobe Media Encoder Lossless", price: 99, img: "https://i.postimg.cc/qqm9y9K4/ME.jpg" }
];

const SECURE_LINKS = {
    1: "https://drive.google.com/drive/folders/1FiMYtDWVqecIKLbmMoWuvtVcx-Txrab6",
    2: "https://drive.google.com/drive/folders/1NUrYq4Xl8eN3uQJG80YQtshIGUjRAim_",
    3: "https://drive.google.com/drive/folders/1rYL3TLfQ0Tq7tS-0Rw71thHPD3IOCLYa"
};

const POLICIES = {
    terms: `
        <div class="policy-section">
            <h4>1. No Refund Policy</h4>
            <p>Due to the digital nature of assets, all sales are final. No refunds are provided once the payment is complete.</p>
            <h4>2. Software Requirements</h4>
            <p>Buyers must have <strong>Maxon</strong> and <strong>Adobe After Effects</strong> installed to use these project files.</p>
            <h4>3. Required Plugins</h4>
            <p>You confirm you have: <strong>S_Sharpen, Bcc Unsharp Mask, Looks, and S_SoftFocus</strong>.</p>
            <h4>4. Usage License</h4>
            <p>Files are for personal/commercial use in your own projects. Reselling or leaking is strictly forbidden.</p>
        </div>`,
    privacy: `<div class="policy-section"><h4>Privacy</h4><p>We only store your email to verify purchases and secure your account access.</p></div>`
};

let cart = [];
let purchasedAssets = []; 

// ✅ PASSWORD TOGGLE FIX (added)
document.addEventListener("DOMContentLoaded", () => {
    const togglePasswordBtn = document.getElementById("toggle-password");
    const passwordField = document.getElementById("login-password");

    if (togglePasswordBtn && passwordField) {
        togglePasswordBtn.addEventListener("click", () => {
            const isHidden = passwordField.type === "password";
            passwordField.type = isHidden ? "text" : "password";
            togglePasswordBtn.textContent = isHidden ? "HIDE" : "SHOW";
        });
    }
});

onAuthStateChanged(auth, async (user) => {
    if(user) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-profile').style.display = 'flex';
        document.getElementById('display-user-email').innerText = user.email;
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) purchasedAssets = snap.data().purchases || [];
    } else {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('user-profile').style.display = 'none';
        purchasedAssets = [];
    }
});

const toggleDrawer = (id, show) => {
    const el = document.getElementById(id);
    if(show) el.classList.add('open'); else el.classList.remove('open');
    document.getElementById('ui-overlay').style.display = show ? 'block' : 'none';
};

// Listeners
document.getElementById('menu-open').onclick = () => toggleDrawer('nav-drawer', true);
document.getElementById('menu-close').onclick = () => toggleDrawer('nav-drawer', false);
document.getElementById('cart-open').onclick = () => { toggleDrawer('cart-drawer', true); renderCart(); };
document.getElementById('cart-close').onclick = () => toggleDrawer('cart-drawer', false);
document.getElementById('policy-close').onclick = () => toggleDrawer('policies-drawer', false);
document.getElementById('ui-overlay').onclick = () => {
    ['nav-drawer', 'cart-drawer', 'policies-drawer'].forEach(id => toggleDrawer(id, false));
};

// Policy Drawer Actions
document.getElementById('terms-btn').onclick = () => {
    document.getElementById('policy-title').innerText = "Terms & Conditions";
    document.getElementById('policy-content').innerHTML = POLICIES.terms;
    toggleDrawer('policies-drawer', true);
};
document.getElementById('privacy-btn').onclick = () => {
    document.getElementById('policy-title').innerText = "Privacy Policy";
    document.getElementById('policy-content').innerHTML = POLICIES.privacy;
    toggleDrawer('policies-drawer', true);
};

// Auth Actions
document.getElementById('login-trigger').onclick = async () => {
    const e = document.getElementById('login-email').value, p = document.getElementById('login-password').value;
    try { await signInWithEmailAndPassword(auth, e, p); } catch(err) { alert(err.message); }
};
document.getElementById('signup-trigger').onclick = async () => {
    const e = document.getElementById('login-email').value, p = document.getElementById('login-password').value;
    try { await createUserWithEmailAndPassword(auth, e, p); document.getElementById('success-popup').style.display = 'flex'; } catch(err) { alert(err.message); }
};
document.getElementById('logout-trigger').onclick = () => signOut(auth);

// Render Purchases
document.getElementById('my-purchases-btn').onclick = () => {
    document.getElementById('user-profile').style.display = 'none';
    document.getElementById('purchases-view').style.display = 'block';
    const container = document.getElementById('purchased-list-container');
    container.innerHTML = purchasedAssets.length === 0 ? '<p style="color:var(--text-dim); padding:10px; font-size:0.8rem;">No assets found.</p>' : 
        purchasedAssets.map(item => `
            <div class="purchase-card">
                <span class="purchase-name">${item.name}</span>
                <a href="${SECURE_LINKS[item.id] || "#"}" target="_blank" class="action-btn login-primary small-btn">Download</a>
            </div>
        `).join('');
};

document.getElementById('back-to-profile').onclick = () => {
    document.getElementById('user-profile').style.display = 'flex';
    document.getElementById('purchases-view').style.display = 'none';
};

// Cart Actions
window.addItem = (id) => {
    const item = products.find(p => p.id === id);
    if (!cart.find(c => c.id === id)) { cart.push(item); document.getElementById('cart-count').innerText = cart.length; }
    toggleDrawer('cart-drawer', true); renderCart();
};
window.removeItem = (id) => {
    cart = cart.filter(item => item.id !== id);
    document.getElementById('cart-count').innerText = cart.length; renderCart();
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    let total = 0;
    list.innerHTML = cart.length === 0 ? `<p class="empty-msg" style="padding:20px; color:var(--text-dim);">Cart is empty</p>` : 
        cart.map(item => { total += item.price; return `<div class="cart-item"><div><span>${item.name}</span><button class="remove-btn" onclick="removeItem(${item.id})">Remove</button></div><span class="price-tag">₹${item.price}</span></div>`; }).join('');
    document.getElementById('cart-total').innerHTML = `<span class="r-sym">₹</span>${total}`;
}

// Checkout
document.getElementById('checkout-trigger').onclick = () => {
    if (!auth.currentUser) { alert("Login first"); toggleDrawer('nav-drawer', true); return; }
    if (cart.length === 0) return;
    document.getElementById('terms-confirmation-popup').style.display = 'flex';
};

document.getElementById('cancel-payment').onclick = () => {
    document.getElementById('terms-confirmation-popup').style.display = 'none';
};

document.getElementById('accept-terms-payment').onclick = () => {
    document.getElementById('terms-confirmation-popup').style.display = 'none';
    const user = auth.currentUser;
    const options = {
        "key": "rzp_live_SUb1nskZR2DxTy",
        "amount": cart.reduce((s, i) => s + i.price, 0) * 100,
        "currency": "INR",
        "name": "Delta Tamizhan Fx",
        "handler": async function () {
            const ref = doc(db, "users", user.uid);
            const snap = await getDoc(ref);
            if (!snap.exists()) await setDoc(ref, { purchases: cart });
            else await updateDoc(ref, { purchases: arrayUnion(...cart) });
            purchasedAssets = [...purchasedAssets, ...cart];
            cart = []; document.getElementById('cart-count').innerText = 0; renderCart();
            toggleDrawer('cart-drawer', false); toggleDrawer('nav-drawer', true);
            document.getElementById('my-purchases-btn').click();
        },
        "prefill": { "email": user.email },
        "theme": { "color": "#00f2ff" }
    };
    new Razorpay(options).open();
};

// Init Grid
document.getElementById('product-list').innerHTML = products.map(p => `
    <div class="card">
        <div class="thumb-container"><img src="${p.img}" class="product-img"></div>
        <div class="card-content">
            <h4>${p.name}</h4>
            <span class="price"><span class="r-sym">₹</span>${p.price}</span>
            <button class="action-btn login-primary" onclick="addItem(${p.id})">Add to Cart</button>
        </div>
    </div>
`).join('');

document.getElementById('close-popup').onclick = () => document.getElementById('success-popup').style.display = 'none';