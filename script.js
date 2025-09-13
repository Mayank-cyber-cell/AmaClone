// Global Variables
let currentSlide = 0;
let cartItems = [];
let wishlistItems = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load cart from localStorage
    loadCartFromStorage();
    updateCartCount();
    
    // Load wishlist from localStorage
    loadWishlistFromStorage();
    
    // Initialize banner carousel
    initializeBannerCarousel();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Initialize modal handlers
    initializeModalHandlers();
    
    // Initialize page-specific functionality
    initializePageSpecific();
}

// Banner Carousel Functions
function initializeBannerCarousel() {
    const slides = document.querySelectorAll('.banner-slide');
    if (slides.length > 1) {
        setInterval(nextSlide, 5000); // Auto-advance every 5 seconds
    }
}

function nextSlide() {
    const slides = document.querySelectorAll('.banner-slide');
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

function previousSlide() {
    const slides = document.querySelectorAll('.banner-slide');
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

// Cart Functions
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    const existingItem = cartItems.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            id: productId,
            ...product,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartCount();
    showNotification('Product added to cart!', 'success');
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartCount();
    updateCartDisplay();
    showNotification('Product removed from cart!', 'success');
}

function updateQuantity(selectElement, price) {
    const quantity = parseInt(selectElement.value);
    const cartItem = selectElement.closest('.cart-item');
    const productId = parseInt(cartItem.dataset.productId || '1');
    
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        saveCartToStorage();
        updateCartCount();
        updateCartDisplay();
    }
}

function updateCartCount() {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function updateCartDisplay() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElement = document.querySelector('.subtotal-amount');
    
    if (!cartItemsContainer) return;
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        if (subtotalElement) subtotalElement.textContent = '$0.00';
        return;
    }
    
    let subtotal = 0;
    cartItemsContainer.innerHTML = '';
    
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItemHTML = `
            <div class="cart-item" data-product-id="${item.id}" data-price="${item.price}">
                <input type="checkbox" class="item-checkbox" checked>
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3><a href="product.html">${item.name}</a></h3>
                    <p class="item-status in-stock">In Stock</p>
                    <p class="shipping-info">FREE Shipping</p>
                    <p class="eligibility">Eligible for FREE Shipping</p>
                    
                    <div class="item-actions">
                        <div class="quantity-selector">
                            <select onchange="updateQuantity(this, ${item.price})">
                                ${[1,2,3,4,5].map(num => 
                                    `<option value="${num}" ${num === item.quantity ? 'selected' : ''}>Qty: ${num}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <button class="action-btn" onclick="removeFromCart(${item.id})">Delete</button>
                        <button class="action-btn" onclick="saveForLater(this)">Save for later</button>
                        <button class="action-btn" onclick="compareItems()">Compare with similar items</button>
                        <button class="action-btn" onclick="shareItem()">Share</button>
                    </div>
                </div>
                <div class="item-price">
                    <span class="price">$${itemTotal.toFixed(2)}</span>
                </div>
            </div>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
    });
    
    if (subtotalElement) {
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
}

function saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
    }
}

// Wishlist Functions
function addToWishlist(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    const existingItem = wishlistItems.find(item => item.id === productId);
    
    if (!existingItem) {
        wishlistItems.push({
            id: productId,
            ...product,
            addedDate: new Date().toISOString()
        });
        
        saveWishlistToStorage();
        showNotification('Product added to wishlist!', 'success');
    } else {
        showNotification('Product already in wishlist!', 'warning');
    }
}

function removeFromWishlist(button) {
    const wishlistItem = button.closest('.wishlist-item');
    const productId = parseInt(wishlistItem.dataset.productId || '1');
    
    wishlistItems = wishlistItems.filter(item => item.id !== productId);
    saveWishlistToStorage();
    wishlistItem.remove();
    showNotification('Product removed from wishlist!', 'success');
}

function moveToCart(button) {
    const wishlistItem = button.closest('.wishlist-item, .saved-item');
    const productId = parseInt(wishlistItem.dataset.productId || '1');
    
    addToCart(productId);
    
    if (wishlistItem.classList.contains('wishlist-item')) {
        removeFromWishlist(wishlistItem.querySelector('.remove-from-wishlist'));
    }
}

function saveWishlistToStorage() {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
}

function loadWishlistFromStorage() {
    const savedWishlist = localStorage.getItem('wishlistItems');
    if (savedWishlist) {
        wishlistItems = JSON.parse(savedWishlist);
    }
}

// Product Functions
function getProductById(id) {
    // Mock product data - in a real app, this would come from an API
    const products = {
        1: { id: 1, name: 'Wireless Bluetooth Headphones', price: 79.99, image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=200' },
        2: { id: 2, name: 'Smart Watch Series 8', price: 299.99, image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=200' },
        3: { id: 3, name: 'Laptop Backpack', price: 49.99, image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=200' },
        4: { id: 4, name: 'Coffee Maker Pro', price: 149.99, image: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=200' },
        5: { id: 5, name: 'Wireless Charging Pad', price: 29.99, image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=200' },
        6: { id: 6, name: 'Bluetooth Speaker', price: 89.99, image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=200' },
        7: { id: 7, name: 'Gaming Mouse', price: 59.99, image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=200' },
        8: { id: 8, name: 'Desk Lamp LED', price: 39.99, image: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=200' }
    };
    
    return products[id];
}

function changeImage(thumbnail) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = thumbnail.src.replace('w=100', 'w=600');
        
        // Update active thumbnail
        document.querySelectorAll('.thumbnail-images img').forEach(img => {
            img.classList.remove('active-thumbnail');
        });
        thumbnail.classList.add('active-thumbnail');
    }
}

function showTab(tabName) {
    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab panel
    const selectedPanel = document.getElementById(tabName);
    if (selectedPanel) {
        selectedPanel.classList.add('active');
    }
    
    // Add active class to clicked tab button
    event.target.classList.add('active');
}

// Checkout Functions
function proceedToCheckout() {
    if (cartItems.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }
    
    window.location.href = 'checkout.html';
}

function nextStep(stepNumber) {
    // Hide current step
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show next step
    const nextStep = document.getElementById(`step-${stepNumber}`);
    if (nextStep) {
        nextStep.classList.add('active');
    }
    
    // Update progress bar
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
    });
    
    const progressStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (progressStep) {
        progressStep.classList.add('active');
    }
}

function previousStep(stepNumber) {
    nextStep(stepNumber);
}

function goToStep(stepNumber) {
    nextStep(stepNumber);
}

function placeOrder() {
    // Simulate order placement
    showNotification('Order placed successfully!', 'success');
    
    // Clear cart
    cartItems = [];
    saveCartToStorage();
    updateCartCount();
    
    // Redirect to orders page
    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 2000);
}

function buyNow() {
    // Add current product to cart and go to checkout
    const productId = 1; // This would be dynamic in a real app
    addToCart(productId);
    proceedToCheckout();
}

// Order Functions
function filterOrders(status) {
    const orderCards = document.querySelectorAll('.order-card');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter orders
    orderCards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function showTracking(orderId) {
    const modal = document.getElementById('tracking-modal');
    const trackingId = document.getElementById('tracking-id');
    
    if (modal && trackingId) {
        trackingId.textContent = `1Z999AA${orderId}`;
        modal.style.display = 'block';
    }
}

function closeTrackingModal() {
    const modal = document.getElementById('tracking-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function reorder() {
    showNotification('Items added to cart for reorder!', 'success');
}

function writeReview() {
    showNotification('Review form opened!', 'info');
}

function returnItem() {
    showNotification('Return process initiated!', 'info');
}

function cancelOrder() {
    if (confirm('Are you sure you want to cancel this order?')) {
        showNotification('Order cancelled successfully!', 'success');
    }
}

function contactCarrier() {
    showNotification('Redirecting to carrier website...', 'info');
}

function reportProblem() {
    showNotification('Problem report form opened!', 'info');
}

// Wishlist Functions
function filterWishlist(filter) {
    const wishlistItems = document.querySelectorAll('.wishlist-item');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter wishlist items
    wishlistItems.forEach(item => {
        const availability = item.dataset.availability;
        
        if (filter === 'all' || availability === filter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function notifyWhenAvailable(button) {
    const modal = document.getElementById('notification-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeNotificationModal() {
    const modal = document.getElementById('notification-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function findSimilar() {
    showNotification('Showing similar items...', 'info');
}

function compareItems() {
    showNotification('Compare feature coming soon!', 'info');
}

function shareItem() {
    if (navigator.share) {
        navigator.share({
            title: 'Check out this product',
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard!', 'success');
    }
}

function addAllToCart() {
    const availableItems = document.querySelectorAll('.wishlist-item[data-availability="available"]');
    let addedCount = 0;
    
    availableItems.forEach(item => {
        const productId = parseInt(item.dataset.productId || '1');
        addToCart(productId);
        addedCount++;
    });
    
    if (addedCount > 0) {
        showNotification(`${addedCount} items added to cart!`, 'success');
    }
}

function deleteAll() {
    if (confirm('Are you sure you want to delete all items from your wishlist?')) {
        wishlistItems = [];
        saveWishlistToStorage();
        
        const wishlistGrid = document.querySelector('.wishlist-grid');
        const emptyWishlist = document.querySelector('.empty-wishlist');
        
        if (wishlistGrid && emptyWishlist) {
            wishlistGrid.style.display = 'none';
            emptyWishlist.classList.remove('hidden');
        }
        
        showNotification('All items removed from wishlist!', 'success');
    }
}

// Profile Functions
function showLoginSecurity() {
    const modal = document.getElementById('login-security-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showAddresses() {
    const modal = document.getElementById('addresses-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showPaymentMethods() {
    const modal = document.getElementById('payment-methods-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showPreferences() {
    const modal = document.getElementById('preferences-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function editField(field) {
    showNotification(`Edit ${field} form opened!`, 'info');
}

function enableTwoFactor() {
    showNotification('Two-factor authentication setup started!', 'info');
}

function addNewAddress() {
    showNotification('Add new address form opened!', 'info');
}

function addPaymentMethod() {
    showNotification('Add payment method form opened!', 'info');
}

// Seller Dashboard Functions
function showAddProduct() {
    const modal = document.getElementById('add-product-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showOrders() {
    const modal = document.getElementById('orders-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showInventory() {
    const modal = document.getElementById('inventory-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showReports() {
    showNotification('Reports section opened!', 'info');
}

function viewOrder(orderId) {
    showNotification(`Viewing order ${orderId}`, 'info');
}

function processOrder(orderId) {
    showNotification(`Processing order ${orderId}`, 'info');
}

function updateOrderStatus(orderId) {
    showNotification(`Updating status for order ${orderId}`, 'info');
}

function filterSellerOrders(status) {
    const orderRows = document.querySelectorAll('#seller-orders-tbody tr');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter orders (simplified - in real app would filter by actual status)
    orderRows.forEach(row => {
        row.style.display = 'table-row';
    });
}

function editProduct(sku) {
    showNotification(`Editing product ${sku}`, 'info');
}

function deleteProduct(sku) {
    if (confirm('Are you sure you want to delete this product?')) {
        showNotification(`Product ${sku} deleted!`, 'success');
    }
}

function restockProduct(sku) {
    showNotification(`Restocking product ${sku}`, 'info');
}

// Admin Functions
function showAdminSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(`admin-${sectionName}`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.admin-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

function approveProduct(productId) {
    showNotification(`Product ${productId} approved!`, 'success');
}

function rejectProduct(productId) {
    if (confirm('Are you sure you want to reject this product?')) {
        showNotification(`Product ${productId} rejected!`, 'warning');
    }
}

function viewProduct(productId) {
    showNotification(`Viewing product ${productId}`, 'info');
}

function suspendProduct(productId) {
    if (confirm('Are you sure you want to suspend this product?')) {
        showNotification(`Product ${productId} suspended!`, 'warning');
    }
}

function reconsiderProduct(productId) {
    showNotification(`Product ${productId} moved to review!`, 'info');
}

function viewUser(userId) {
    showNotification(`Viewing user ${userId}`, 'info');
}

function suspendUser(userId) {
    if (confirm('Are you sure you want to suspend this user?')) {
        showNotification(`User ${userId} suspended!`, 'warning');
    }
}

function verifyUser(userId) {
    showNotification(`User ${userId} verified!`, 'success');
}

function rejectUser(userId) {
    if (confirm('Are you sure you want to reject this user?')) {
        showNotification(`User ${userId} rejected!`, 'warning');
    }
}

function reactivateUser(userId) {
    showNotification(`User ${userId} reactivated!`, 'success');
}

function resolveOrder(orderId) {
    showNotification(`Order ${orderId} resolved!`, 'success');
}

function trackOrder(orderId) {
    showTracking(orderId);
}

// Help Functions
function showFAQ(category) {
    // Hide all FAQ sections
    document.querySelectorAll('.faq-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected FAQ section
    const selectedSection = document.getElementById(`faq-${category}`);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }
}

function toggleFAQ(button) {
    const faqItem = button.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const toggle = button.querySelector('.faq-toggle');
    
    if (answer.classList.contains('active')) {
        answer.classList.remove('active');
        button.classList.remove('active');
        toggle.textContent = '+';
    } else {
        // Close all other FAQs
        document.querySelectorAll('.faq-answer.active').forEach(activeAnswer => {
            activeAnswer.classList.remove('active');
        });
        document.querySelectorAll('.faq-question.active').forEach(activeQuestion => {
            activeQuestion.classList.remove('active');
            activeQuestion.querySelector('.faq-toggle').textContent = '+';
        });
        
        // Open clicked FAQ
        answer.classList.add('active');
        button.classList.add('active');
        toggle.textContent = '−';
    }
}

function startChat() {
    const chatWidget = document.getElementById('chat-widget');
    if (chatWidget) {
        chatWidget.style.display = 'block';
    }
}

function closeChat() {
    const chatWidget = document.getElementById('chat-widget');
    if (chatWidget) {
        chatWidget.style.display = 'none';
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input-field');
    const messagesContainer = document.querySelector('.chat-messages');
    
    if (input && messagesContainer && input.value.trim()) {
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message user';
        userMessage.innerHTML = `<p>${input.value}</p>`;
        messagesContainer.appendChild(userMessage);
        
        // Simulate bot response
        setTimeout(() => {
            const botMessage = document.createElement('div');
            botMessage.className = 'chat-message bot';
            botMessage.innerHTML = '<p>Thank you for your message. A support agent will be with you shortly.</p>';
            messagesContainer.appendChild(botMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
        
        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function callSupport() {
    showNotification('Calling support: 1-800-123-4567', 'info');
}

function showContactForm() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeContactForm() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Form Handlers
function initializeFormHandlers() {
    // Auth forms
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Add product form
    const addProductForm = document.querySelector('.add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
    
    // Address form
    const addressForm = document.querySelector('.address-form form');
    if (addressForm) {
        addressForm.addEventListener('submit', handleAddAddress);
    }
    
    // Notification form
    const notificationForm = document.querySelector('.notification-form');
    if (notificationForm) {
        notificationForm.addEventListener('submit', handleNotificationForm);
    }
}

function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }
    
    // Simulate account creation
    showNotification('Account created successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!email || !password) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }
    
    // Simulate login
    showNotification('Login successful!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function handleContactForm(e) {
    e.preventDefault();
    showNotification('Message sent successfully! We will get back to you soon.', 'success');
    e.target.reset();
    setTimeout(() => {
        closeContactForm();
    }, 2000);
}

function handleAddProduct(e) {
    e.preventDefault();
    showNotification('Product added successfully!', 'success');
    setTimeout(() => {
        closeModal('add-product-modal');
    }, 2000);
}

function handleAddAddress(e) {
    e.preventDefault();
    showNotification('Address saved successfully!', 'success');
    hideAddressForm();
}

function handleNotificationForm(e) {
    e.preventDefault();
    showNotification('Notification saved! We will email you when the item is available.', 'success');
    setTimeout(() => {
        closeNotificationModal();
    }, 2000);
}

// Address Functions
function showAddressForm() {
    const form = document.getElementById('new-address-form');
    if (form) {
        form.classList.remove('hidden');
    }
}

function hideAddressForm() {
    const form = document.getElementById('new-address-form');
    if (form) {
        form.classList.add('hidden');
    }
}

// Modal Handlers
function initializeModalHandlers() {
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            
            const chatWidget = document.getElementById('chat-widget');
            if (chatWidget && chatWidget.style.display === 'block') {
                chatWidget.style.display = 'none';
            }
        }
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease-out;
            }
            
            .notification.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .notification.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .notification.warning {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
            }
            
            .notification.info {
                background: #e7f3ff;
                color: #0c5460;
                border: 1px solid #b8daff;
            }
            
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .notification-close:hover {
                background: rgba(0,0,0,0.1);
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function saveForLater(button) {
    const cartItem = button.closest('.cart-item');
    const productName = cartItem.querySelector('h3 a').textContent;
    
    showNotification(`${productName} saved for later!`, 'success');
    
    // Move item to saved for later section (simplified)
    cartItem.remove();
    updateCartCount();
}

function deleteSaved(button) {
    const savedItem = button.closest('.saved-item');
    savedItem.remove();
    showNotification('Item removed from saved items!', 'success');
}

// Page-specific initialization
function initializePageSpecific() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'cart.html':
            updateCartDisplay();
            break;
        case 'checkout.html':
            initializeCheckout();
            break;
        case 'product.html':
            initializeProductPage();
            break;
        case 'help.html':
            initializeHelpPage();
            break;
    }
}

function initializeCheckout() {
    // Update shipping cost based on delivery option
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    deliveryOptions.forEach(option => {
        option.addEventListener('change', updateShippingCost);
    });
    
    // Update total when shipping changes
    updateShippingCost();
}

function updateShippingCost() {
    const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
    const shippingCostElement = document.getElementById('shipping-cost');
    const totalAmountElement = document.getElementById('total-amount');
    
    if (!selectedDelivery || !shippingCostElement || !totalAmountElement) return;
    
    let shippingCost = 0;
    const deliveryValue = selectedDelivery.value;
    
    switch (deliveryValue) {
        case 'express':
            shippingCost = 9.99;
            break;
        case 'same-day':
            shippingCost = 19.99;
            break;
        default:
            shippingCost = 0;
    }
    
    const subtotal = 429.97; // This would be calculated from cart items
    const tax = 34.40;
    const total = subtotal + shippingCost + tax;
    
    shippingCostElement.textContent = shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`;
    totalAmountElement.textContent = `$${total.toFixed(2)}`;
}

function initializeProductPage() {
    // Initialize image gallery
    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => changeImage(thumbnail));
    });
    
    // Initialize variant options
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initializeHelpPage() {
    // Initialize FAQ toggles
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => toggleFAQ(question));
    });
    
    // Initialize chat input
    const chatInput = document.getElementById('chat-input-field');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Search functionality
function initializeSearch() {
    const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Search"]');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    });
    
    const searchButtons = document.querySelectorAll('.search-btn, .search-orders-btn, .help-search-btn');
    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling || this.parentElement.querySelector('input');
            if (input) {
                performSearch(input.value);
            }
        });
    });
}

function performSearch(query) {
    if (!query.trim()) return;
    
    showNotification(`Searching for "${query}"...`, 'info');
    
    // In a real app, this would perform actual search
    setTimeout(() => {
        showNotification(`Found results for "${query}"`, 'success');
    }, 1000);
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSearch);

// Accessibility improvements
function initializeAccessibility() {
    // Add keyboard navigation for modals
    document.addEventListener('keydown', function(e) {
        const openModal = document.querySelector('.modal[style*="block"]');
        if (openModal && e.key === 'Tab') {
            trapFocus(e, openModal);
        }
    });
    
    // Add ARIA labels to interactive elements
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
        if (button.textContent.trim()) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });
    
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content ID if not present
    const mainContent = document.querySelector('main, .main-content');
    if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
    }
}

function trapFocus(e, modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', initializeAccessibility);

// Performance optimizations
function initializePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Debounce search inputs
    const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Search"]');
    searchInputs.forEach(input => {
        let timeout;
        input.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Perform search suggestions
                if (this.value.length > 2) {
                    showSearchSuggestions(this.value);
                }
            }, 300);
        });
    });
}

function showSearchSuggestions(query) {
    // Mock search suggestions
    const suggestions = [
        'Wireless headphones',
        'Smart watch',
        'Laptop backpack',
        'Coffee maker',
        'Gaming mouse'
    ].filter(item => item.toLowerCase().includes(query.toLowerCase()));
    
    // In a real app, this would show a dropdown with suggestions
    console.log('Search suggestions:', suggestions);
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', initializePerformance);

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    showNotification('An error occurred. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('An error occurred. Please try again.', 'error');
});

// Service worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export functions for global access
window.AmaClone = {
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    showNotification,
    nextSlide,
    previousSlide,
    changeImage,
    showTab,
    proceedToCheckout,
    nextStep,
    previousStep,
    placeOrder,
    buyNow,
    filterOrders,
    showTracking,
    closeTrackingModal,
    filterWishlist,
    notifyWhenAvailable,
    closeNotificationModal,
    showLoginSecurity,
    showAddresses,
    showPaymentMethods,
    showPreferences,
    closeModal,
    showAddProduct,
    showOrders,
    showInventory,
    showAdminSection,
    showFAQ,
    toggleFAQ,
    startChat,
    closeChat,
    sendMessage,
    showContactForm,
    closeContactForm
};