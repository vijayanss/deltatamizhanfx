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
    { id: 1, name: "After Effects Quality Enhancer CC", price: 1, img: "https://i.postimg.cc/Twc8YyYV/CC.jpg", link: "https://drive.google.com/drive/folders/1FiMYtDWVqecIKLbmMoWuvtVcx-Txrab6" },
    { id: 2, name: "Topaz AI High-Quality Settings", price: 1, img: "https://i.postimg.cc/QxCLhdLN/Topaz.jpg", link: "https://drive.google.com/drive/folders/1NUrYq4Xl8eN3uQJG80YQtshIGUjRAim_" },
    { id: 3, name: "Adobe Media Encoder Lossless", price: 1, img: "https://i.postimg.cc/qqm9y9K4/ME.jpg", link: "https://drive.google.com/drive/folders/1rYL3TLfQ0Tq7tS-0Rw71thHPD3IOCLYa" }
];

let cart = [];
let purchasedAssets = []; 

async function loadUserPurchases(uid) {
    try {
        const docSnap = await getDoc(doc(db, "users", uid));
        if (docSnap.exists()) { purchasedAssets = docSnap.data().purchases || []; }
    } catch(e) { console.log(e); }
}

async function savePurchaseToDB(uid, newItems) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) { await setDoc(docRef, { purchases: newItems }); } 
    else { await updateDoc(docRef, { purchases: arrayUnion(...newItems) }); }
}

onAuthStateChanged(auth, async (user) => {
    if(user) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-profile').style.display = 'flex';
        document.getElementById('display-user-email').innerText = user.email;
        await loadUserPurchases(user.uid);
    } else {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('user-profile').style.display = 'none';
    }
});

document.getElementById('login-trigger').onclick = async () => {
    const e = document.getElementById('login-email').value;
    const p = document.getElementById('login-password').value;
    try { await signInWithEmailAndPassword(auth, e, p); } catch(err) { alert(err.message); }
};

document.getElementById('signup-trigger').onclick = async () => {
    const e = document.getElementById('login-email').value;
    const p = document.getElementById('login-password').value;
    try { 
        await createUserWithEmailAndPassword(auth, e, p); 
        document.getElementById('success-popup').style.display = 'flex';
    } catch(err) { alert(err.message); }
};

document.getElementById('logout-trigger').onclick = () => signOut(auth);

const toggleDrawer = (id, show) => {
    const el = document.getElementById(id);
    if(show) el.classList.add('open'); else el.classList.remove('open');
    document.getElementById('ui-overlay').style.display = show ? 'block' : 'none';
};

document.getElementById('menu-open').onclick = () => toggleDrawer('nav-drawer', true);
document.getElementById('menu-close').onclick = () => toggleDrawer('nav-drawer', false);
document.getElementById('cart-open').onclick = () => { toggleDrawer('cart-drawer', true); renderCart(); };
document.getElementById('cart-close').onclick = () => toggleDrawer('cart-drawer', false);
document.getElementById('ui-overlay').onclick = () => { toggleDrawer('nav-drawer', false); toggleDrawer('cart-drawer', false); };

document.getElementById('my-purchases-btn').onclick = () => {
    document.getElementById('user-profile').style.display = 'none';
    document.getElementById('purchases-view').style.display = 'block';
    const container = document.getElementById('purchased-list-container');
    container.innerHTML = purchasedAssets.length === 0 ? '<p style="color:var(--text-dim); font-size:0.8rem;">No assets.</p>' : 
        purchasedAssets.map(item => `
            <div style="background:var(--surface-light); padding:15px; border-radius:12px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.05);">
                <span style="font-size:0.85rem; display:block; margin-bottom:10px;">${item.name}</span>
                <a href="${item.link}" target="_blank" class="action-btn login-primary" style="padding:8px 15px; font-size:0.7rem; width:auto; text-decoration:none; display:inline-block; margin:0;">Download</a>
            </div>
        `).join('');
};

document.getElementById('back-to-profile').onclick = () => {
    document.getElementById('user-profile').style.display = 'flex';
    document.getElementById('purchases-view').style.display = 'none';
};

window.addItem = (id) => {
    const item = products.find(p => p.id === id);
    if (!cart.find(c => c.id === id)) { cart.push(item); document.getElementById('cart-count').innerText = cart.length; }
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
        list.innerHTML = `<p style="text-align:center; color:var(--text-dim); margin-top:20px; font-size:0.9rem;">Cart is empty</p>`;
    } else {
        list.innerHTML = cart.map(item => {
            total += item.price;
            return `
                <div class="cart-item">
                    <div style="display: flex; flex-direction: column; align-items: flex-start;">
                        <span style="font-size:0.85rem; font-weight:500;">${item.name}</span>
                        <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
                    </div>
                    <span style="font-weight:700;"><span class="r-sym">₹</span>${item.price}</span>
                </div>
            `;
        }).join('');
    }
    document.getElementById('cart-total').innerHTML = `<span class="r-sym">₹</span>${total}`;
}

document.getElementById('checkout-trigger').onclick = () => {
    const user = auth.currentUser;
    if (!user) { alert("Login first"); toggleDrawer('nav-drawer', true); return; }
    if (cart.length === 0) return;

    const options = {
        "key": "rzp_live_SUb1nskZR2DxTy",
        "amount": cart.reduce((s, i) => s + i.price, 0) * 100,
        "currency": "INR",
        "name": "Delta Tamizhan Fx",
        "handler": async function (response) {
            await savePurchaseToDB(user.uid, cart);
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

document.getElementById('product-list').innerHTML = products.map(p => `
    <div class="card">
        <div class="thumb-container"><img src="${p.img}" class="product-img"></div>
        <div class="card-content">
            <h4 style="margin-bottom:10px;">${p.name}</h4>
            <span class="price" style="color:var(--primary); font-weight:700; display:block; margin-bottom:15px;"><span class="r-sym">₹</span>${p.price}</span>
            <button class="action-btn login-primary" onclick="addItem(${p.id})">Add to Cart</button>
        </div>
    </div>
`).join('');

document.getElementById('close-popup').onclick = () => document.getElementById('success-popup').style.display = 'none';