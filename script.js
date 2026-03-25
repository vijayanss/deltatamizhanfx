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
        <div class="policy-section"><h4 style="color:var(--primary); font-size:0.85rem; margin-bottom:8px;">1. No Refund Policy</h4><p style="font-size:0.8rem; color:var(--text-dim);">Digital assets are non-refundable. Once accessed, we cannot issue a refund.</p></div>
        <div class="policy-section"><h4 style="color:var(--primary); font-size:0.85rem; margin-bottom:8px;">2. Plugin Requirements</h4><p style="font-size:0.8rem; color:var(--text-dim);">Requires: S_Sharpen, Bcc Unsharp Mask, Looks, and S_SoftFocus.</p></div>
        <div class="policy-section"><h4 style="color:var(--primary); font-size:0.85rem; margin-bottom:8px;">3. Software Requirements</h4><p style="font-size:0.8rem; color:var(--text-dim);">Requires Maxon and After Effects.</p></div>
        <div class="policy-section"><h4 style="color:var(--primary); font-size:0.85rem; margin-bottom:8px;">4. Usage Rights</h4><p style="font-size:0.8rem; color:var(--text-dim);">Personal use only. Reselling raw files is prohibited.</p></div>`,
    privacy: `<div class="policy-section"><h4 style="color:var(--primary); font-size:0.85rem; margin-bottom:8px;">Data Protection</h4><p style="font-size:0.8rem; color:var(--text-dim);">We store email for account access only. Payments are processed securely via Razorpay.</p></div>`
};

let cart = [];
let purchasedAssets = []; 

// --- UTILS ---
const toggleDrawer = (id, show) => {
    const el = document.getElementById(id);
    if(show) el.classList.add('open'); else el.classList.remove('open');
    document.getElementById('ui-overlay').style.display = show ? 'block' : 'none';
};

const showInputError = (id, msg) => {
    const el = document.getElementById(id);
    el.classList.add('input-error', 'shake');
    el.value = ''; el.placeholder = msg;
    setTimeout(() => el.classList.remove('shake'), 300);
};

const showSuccess = (title, msg) => {
    document.getElementById('success-title').innerText = title;
    document.getElementById('success-message').innerText = msg;
    document.getElementById('success-popup').style.display = 'flex';
};

// --- RENDER ASSETS ---
const renderPurchases = () => {
    const container = document.getElementById('purchased-list-container');
    container.innerHTML = purchasedAssets.length === 0 ? '<p style="color:var(--text-dim);">No assets purchased.</p>' : 
        purchasedAssets.map(item => `
            <div class="purchase-card">
                <span class="purchase-name">${item.name}</span>
                <a href="${SECURE_LINKS[item.id]}" target="_blank" class="action-btn login-primary small-btn">Download</a>
            </div>`).join('');
};

// --- AUTH ---
onAuthStateChanged(auth, async (user) => {
    if(user) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-profile').style.display = 'flex';
        document.getElementById('display-user-email').innerText = user.email;
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) { purchasedAssets = snap.data().purchases || []; renderPurchases(); }
    } else {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('user-profile').style.display = 'none';
        purchasedAssets = [];
    }
});

document.getElementById('login-trigger').onclick = async () => {
    const e = document.getElementById('login-email').value, p = document.getElementById('login-password').value;
    if(!e) return showInputError('login-email', 'Username Required');
    if(!p) return showInputError('login-password', 'Password Required');
    try { 
        await signInWithEmailAndPassword(auth, e, p); 
        showSuccess("Login Successful", "Dashboard ready.");
    } catch(err) { 
        document.getElementById('error-message-text').innerText = "Incorrect details.";
        document.getElementById('error-popup').style.display = 'flex';
    }
};

document.getElementById('signup-trigger').onclick = async () => {
    const e = document.getElementById('login-email').value, p = document.getElementById('login-password').value;
    if(!e) return showInputError('login-email', 'Username Required');
    if(!p) return showInputError('login-password', 'Password Required');
    try { 
        await createUserWithEmailAndPassword(auth, e, p); 
        showSuccess("Welcome!", "Account created.");
    } catch(err) { 
        document.getElementById('error-message-text').innerText = err.message;
        document.getElementById('error-popup').style.display = 'flex';
    }
};

document.getElementById('logout-trigger').onclick = () => signOut(auth);

// --- CART ---
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
    list.innerHTML = cart.length === 0 ? `<p style="padding:20px; color:var(--text-dim);">Empty</p>` : 
        cart.map(item => { total += item.price; return `<div class="cart-item"><div><span>${item.name}</span><br><button class="remove-btn" onclick="removeItem(${item.id})">Remove</button></div><span>₹${item.price}</span></div>`; }).join('');
    document.getElementById('cart-total').innerHTML = `₹${total}`;
}

document.getElementById('checkout-trigger').onclick = () => {
    if (!auth.currentUser) { toggleDrawer('nav-drawer', true); return; }
    if (cart.length > 0) document.getElementById('terms-confirmation-popup').style.display = 'flex';
};

document.getElementById('accept-terms-payment').onclick = () => {
    document.getElementById('terms-confirmation-popup').style.display = 'none';
    const user = auth.currentUser;
    const totalAmount = cart.reduce((s, i) => s + i.price, 0) * 100;

    const options = {
        "key": "rzp_live_SUb1nskZR2DxTy", 
        "amount": totalAmount, "currency": "INR", "name": "Delta Tamizhan Fx",
        "handler": async function (response) {
            const ref = doc(db, "users", user.uid);
            const snap = await getDoc(ref);
            if (!snap.exists()) await setDoc(ref, { purchases: cart });
            else await updateDoc(ref, { purchases: arrayUnion(...cart) });
            purchasedAssets = [...purchasedAssets, ...cart]; cart = []; renderCart();
            document.getElementById('cart-count').innerText = 0; toggleDrawer('cart-drawer', false);
            showSuccess("Success!", "Assets added.");
        },
        "prefill": { "email": user.email }, "theme": { "color": "#00f2ff" }
    };
    new Razorpay(options).open();
};

// --- REFRESH ---
document.getElementById('refresh-purchases').onclick = async () => {
    const user = auth.currentUser; if (!user) return;
    const btn = document.getElementById('refresh-purchases'); btn.classList.add('spin-anim');
    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) { purchasedAssets = snap.data().purchases || []; renderPurchases(); }
    } catch (err) { console.error("Refresh failed:", err); }
    setTimeout(() => btn.classList.remove('spin-anim'), 800);
};

// --- EVENTS ---
document.getElementById('menu-open').onclick = () => toggleDrawer('nav-drawer', true);
document.getElementById('menu-close').onclick = () => toggleDrawer('nav-drawer', false);
document.getElementById('cart-open').onclick = () => { toggleDrawer('cart-drawer', true); renderCart(); };
document.getElementById('cart-close').onclick = () => toggleDrawer('cart-drawer', false);
document.getElementById('policy-close').onclick = () => toggleDrawer('policies-drawer', false);
document.getElementById('cancel-payment').onclick = () => document.getElementById('terms-confirmation-popup').style.display = 'none';
document.getElementById('close-popup').onclick = () => document.getElementById('success-popup').style.display = 'none';
document.getElementById('close-error').onclick = () => document.getElementById('error-popup').style.display = 'none';
document.getElementById('ui-overlay').onclick = () => { ['nav-drawer', 'cart-drawer', 'policies-drawer'].forEach(id => toggleDrawer(id, false)); };

document.getElementById('terms-btn').onclick = () => { document.getElementById('policy-title').innerText = "Terms & Conditions"; document.getElementById('policy-content').innerHTML = POLICIES.terms; toggleDrawer('policies-drawer', true); };
document.getElementById('privacy-btn').onclick = () => { document.getElementById('policy-title').innerText = "Privacy Policy"; document.getElementById('policy-content').innerHTML = POLICIES.privacy; toggleDrawer('policies-drawer', true); };

document.getElementById('my-purchases-btn').onclick = () => {
    document.getElementById('user-profile').style.display = 'none';
    document.getElementById('purchases-view').style.display = 'block';
    renderPurchases();
};

document.getElementById('back-to-profile').onclick = () => {
    document.getElementById('user-profile').style.display = 'flex';
    document.getElementById('purchases-view').style.display = 'none';
};

document.getElementById('toggle-password').onclick = () => {
    const p = document.getElementById('login-password'); p.type = p.type === 'password' ? 'text' : 'password';
    document.getElementById('toggle-password').innerText = p.type === 'password' ? 'SHOW' : 'HIDE';
};

document.getElementById('product-list').innerHTML = products.map(p => `
    <div class="card"><div class="thumb-container"><img src="${p.img}" class="product-img"></div>
    <div class="card-content"><h4>${p.name}</h4><span class="price">₹${p.price}</span>
    <button class="action-btn login-primary" onclick="addItem(${p.id})">Add to Cart</button></div></div>`).join('');