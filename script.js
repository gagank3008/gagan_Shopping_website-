
// Get HTML Elements

const productContainer = document.getElementById("productContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const cartButton = document.getElementById("cartButton");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const checkoutBtn = document.getElementById("checkoutBtn");

// Store products and cart data

let products = [];
let cart = [];

// Format price in Indian Rupees

function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(price);
}

// Load Products from JSON file

async function loadProducts() {

    try {

        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Unable to load products.");
        }

        products = await response.json();

        displayProducts(products);

    } catch (error) {

        productContainer.innerHTML =
            `<p class="no-products">
                Failed to load products. Please run the project using Live Server.
            </p>`;

        console.error(error);

    }

}

// Display Products Dynamically

function displayProducts(productList) {

    productContainer.innerHTML = "";

    if (productList.length === 0) {

        productContainer.innerHTML =
            `<p class="no-products">No products found!</p>`;

        return;

    }

    productList.forEach(product => {

        const productCard = document.createElement("div");

        productCard.className = "product-card";

        const imageContainer = document.createElement("div");
        imageContainer.className = "product-image";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        image.onerror = function () {
            this.src = "https://placehold.co/400x300?text=Product";
        };

        imageContainer.appendChild(image);

        const info = document.createElement("div");
        info.className = "product-info";

        const category = document.createElement("p");
        category.className = "product-category";
        category.textContent = product.category;

        const name = document.createElement("h3");
        name.textContent = product.name;

        const rating = document.createElement("div");
        rating.className = "rating";

        rating.textContent =
            "★".repeat(Math.floor(product.rating)) +
            (product.rating % 1 >= 0.5 ? "½" : "");

        const ratingText = document.createElement("span");
        ratingText.textContent = `(${product.rating}/5)`;

        rating.appendChild(ratingText);

        const bottom = document.createElement("div");
        bottom.className = "product-bottom";

        const price = document.createElement("div");
        price.className = "price";
        price.textContent = formatPrice(product.price);

        const addButton = document.createElement("button");
        addButton.className = "add-cart";
        addButton.textContent = "Add to Cart";

        addButton.addEventListener("click", () => {
            addToCart(product.id);
        });

        bottom.appendChild(price);
        bottom.appendChild(addButton);

        info.appendChild(category);
        info.appendChild(name);
        info.appendChild(rating);
        info.appendChild(bottom);

        productCard.appendChild(imageContainer);
        productCard.appendChild(info);

        productContainer.appendChild(productCard);

    });

}

// Search Products

function searchProducts() {

    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredProducts = products.filter(product => {

        return (
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );

    });

    displayProducts(filteredProducts);

}

searchBtn.addEventListener("click", searchProducts);

searchInput.addEventListener("input", searchProducts);

// Add Product to Cart

function addToCart(productId) {

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        const product = products.find(
            item => item.id === productId
        );

        if (!product) return;

        cart.push({
            ...product,
            quantity: 1
        });

    }

    updateCart();

}

// Update Cart

function updateCart() {

    cartItems.innerHTML = "";

    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {

        cartItems.innerHTML =
            `<p class="empty-cart">Your cart is empty!</p>`;

    }

    cart.forEach(item => {

        totalItems += item.quantity;

        totalPrice += item.price * item.quantity;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.name;

        const info = document.createElement("div");
        info.className = "cart-item-info";

        const name = document.createElement("h4");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = formatPrice(item.price);

        const quantityControls = document.createElement("div");
        quantityControls.className = "cart-quantity";

        const decreaseBtn = document.createElement("button");
        decreaseBtn.textContent = "-";

        decreaseBtn.addEventListener("click", () => {
            changeQuantity(item.id, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const increaseBtn = document.createElement("button");
        increaseBtn.textContent = "+";

        increaseBtn.addEventListener("click", () => {
            changeQuantity(item.id, 1);
        });

        quantityControls.appendChild(decreaseBtn);
        quantityControls.appendChild(quantity);
        quantityControls.appendChild(increaseBtn);

        info.appendChild(name);
        info.appendChild(price);
        info.appendChild(quantityControls);

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-item";
        removeBtn.textContent = "✕";
        removeBtn.setAttribute("aria-label", `Remove ${item.name}`);

        removeBtn.addEventListener("click", () => {
            removeFromCart(item.id);
        });

        cartItem.appendChild(image);
        cartItem.appendChild(info);
        cartItem.appendChild(removeBtn);

        cartItems.appendChild(cartItem);

    });

    cartCount.textContent = totalItems;

    cartTotal.textContent = formatPrice(totalPrice);

}

// Change Product Quantity

function changeQuantity(productId, change) {

    const item = cart.find(
        product => product.id === productId
    );

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {

        removeFromCart(productId);

    } else {

        updateCart();

    }

}

// Remove Product from Cart

function removeFromCart(productId) {

    cart = cart.filter(
        item => item.id !== productId
    );

    updateCart();

}

// Open Cart

cartButton.addEventListener("click", () => {

    cartOverlay.classList.add("active");

});

// Close Cart

closeCart.addEventListener("click", () => {

    cartOverlay.classList.remove("active");

});

// Close Cart when clicking outside

cartOverlay.addEventListener("click", (event) => {

    if (event.target === cartOverlay) {

        cartOverlay.classList.remove("active");

    }

});

// Checkout Button

checkoutBtn.addEventListener("click", () => {

    if (cart.length === 0) {

        alert("Your shopping cart is empty!");

        return;

    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    alert(
        `Thank you for shopping at ShopZone!\n\n` +
        `Total Amount: ${formatPrice(total)}\n\n` +
        `This is a demo checkout. No payment has been processed.`
    );

    cart = [];

    updateCart();

    cartOverlay.classList.remove("active");

});

// Start Website

loadProducts();

updateCart();
