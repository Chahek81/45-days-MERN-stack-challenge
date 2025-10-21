// Blog CMS Frontend JavaScript
class BlogCMS {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentUser = null;
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.loadPosts();
        this.setupNavigation();
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.getElementById('navToggle')?.addEventListener('click', this.toggleMobileMenu.bind(this));
        
        // Auth buttons
        document.getElementById('getStartedBtn')?.addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('learnMoreBtn')?.addEventListener('click', () => this.scrollToSection('about'));
        
        // Auth modals
        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('registerModal');
            this.showModal('loginModal');
        });
        
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('registerModal');
        });
        
        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Forms
        document.getElementById('loginForm')?.addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('registerForm')?.addEventListener('submit', this.handleRegister.bind(this));
        document.getElementById('createPostForm')?.addEventListener('submit', this.handleCreatePost.bind(this));
        
        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', this.handleLogout.bind(this));
        
        // Filters and search
        document.getElementById('categoryFilter')?.addEventListener('change', this.handleFilterChange.bind(this));
        document.getElementById('sortFilter')?.addEventListener('change', this.handleFilterChange.bind(this));
        document.getElementById('searchBtn')?.addEventListener('click', this.handleSearch.bind(this));
        document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // Load more
        document.getElementById('loadMoreBtn')?.addEventListener('click', this.loadMorePosts.bind(this));
        
        // Dashboard tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Create post button
        document.getElementById('createPostBtn')?.addEventListener('click', () => {
            this.switchTab('create');
        });
    }

    // Navigation
    setupNavigation() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });
        
        // Update active nav link
        window.addEventListener('scroll', this.updateActiveNavLink.bind(this));
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    updateActiveNavLink() {
        const sections = ['home', 'posts', 'about'];
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            const link = document.querySelector(`a[href="#${sectionId}"]`);
            
            if (section && link) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }

    toggleMobileMenu() {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    }

    // Authentication
    async checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await this.apiCall('/auth/me', 'GET', null, token);
                if (response.success) {
                    this.currentUser = response.data.user;
                    this.updateAuthUI();
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        this.updateAuthUI();
    }

    updateAuthUI() {
        const navAuth = document.getElementById('navAuth');
        if (!navAuth) return;

        if (this.currentUser) {
            navAuth.innerHTML = `
                <button class="btn btn-primary" onclick="blogCMS.showModal('dashboardModal')">
                    <i class="fas fa-user"></i>
                    Dashboard
                </button>
                <button class="btn btn-outline" onclick="blogCMS.handleLogout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            `;
        } else {
            navAuth.innerHTML = `
                <button class="btn btn-primary" onclick="blogCMS.showModal('loginModal')">
                    <i class="fas fa-sign-in-alt"></i>
                    Login
                </button>
                <button class="btn btn-outline" onclick="blogCMS.showModal('registerModal')">
                    <i class="fas fa-user-plus"></i>
                    Register
                </button>
            `;
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            this.showLoading();
            const response = await this.apiCall('/auth/login', 'POST', data);
            
            if (response.success) {
                localStorage.setItem('token', response.data.token);
                this.currentUser = response.data.user;
                this.updateAuthUI();
                this.hideModal('loginModal');
                this.showToast('Login successful!', 'success');
                e.target.reset();
            } else {
                this.showToast(response.message || 'Login failed', 'error');
            }
        } catch (error) {
            this.showToast('Login failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            this.showLoading();
            const response = await this.apiCall('/auth/register', 'POST', data);
            
            if (response.success) {
                localStorage.setItem('token', response.data.token);
                this.currentUser = response.data.user;
                this.updateAuthUI();
                this.hideModal('registerModal');
                this.showToast('Registration successful!', 'success');
                e.target.reset();
            } else {
                this.showToast(response.message || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showToast('Registration failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleLogout() {
        try {
            localStorage.removeItem('token');
            this.currentUser = null;
            this.updateAuthUI();
            this.hideModal('dashboardModal');
            this.showToast('Logged out successfully', 'success');
        } catch (error) {
            this.showToast('Logout failed', 'error');
        }
    }

    // Posts
    async loadPosts(page = 1, append = false) {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoading();
            
            const params = new URLSearchParams({
                page: page,
                limit: this.postsPerPage,
                category: document.getElementById('categoryFilter')?.value || '',
                sort: document.getElementById('sortFilter')?.value || 'newest',
                search: document.getElementById('searchInput')?.value || ''
            });

            const response = await this.apiCall(`/posts?${params}`, 'GET');
            
            if (response.success) {
                if (append) {
                    this.appendPosts(response.data.posts);
                } else {
                    this.displayPosts(response.data.posts);
                }
                
                this.updateLoadMoreButton(response.data.pagination);
                this.currentPage = page;
            } else {
                this.showToast('Failed to load posts', 'error');
            }
        } catch (error) {
            this.showToast('Failed to load posts', 'error');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    displayPosts(posts) {
        const postsGrid = document.getElementById('postsGrid');
        if (!postsGrid) return;

        if (posts.length === 0) {
            postsGrid.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-newspaper"></i>
                    <h3>No posts found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        postsGrid.innerHTML = posts.map(post => this.createPostCard(post)).join('');
    }

    appendPosts(posts) {
        const postsGrid = document.getElementById('postsGrid');
        if (!postsGrid) return;

        const noPostsDiv = postsGrid.querySelector('.no-posts');
        if (noPostsDiv) {
            noPostsDiv.remove();
        }

        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.innerHTML = this.createPostCard(post);
            postsGrid.appendChild(postCard.firstElementChild);
        });
    }

    createPostCard(post) {
        const publishedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString();
        const excerpt = post.excerpt || post.content.substring(0, 150) + '...';
        
        return `
            <div class="post-card" onclick="blogCMS.viewPost('${post._id}')">
                <img src="${post.featuredImage}" alt="${post.title}" class="post-image">
                <div class="post-content">
                    <div class="post-meta">
                        <span class="post-category">${post.category}</span>
                        <span>${publishedDate}</span>
                        <span>${post.readingTime || 5} min read</span>
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${excerpt}</p>
                    <div class="post-footer">
                        <div class="post-author">
                            <img src="${post.author.avatar}" alt="${post.author.username}" class="author-avatar">
                            <span>${post.author.username}</span>
                        </div>
                        <div class="post-stats">
                            <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                            <span><i class="fas fa-heart"></i> ${post.likeCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async viewPost(postId) {
        try {
            this.showLoading();
            const response = await this.apiCall(`/posts/${postId}`, 'GET');
            
            if (response.success) {
                // For now, just show the post in an alert
                // In a real app, you'd navigate to a post detail page
                alert(`Post: ${response.data.post.title}\n\n${response.data.post.content}`);
            } else {
                this.showToast('Failed to load post', 'error');
            }
        } catch (error) {
            this.showToast('Failed to load post', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadMorePosts() {
        await this.loadPosts(this.currentPage + 1, true);
    }

    handleFilterChange() {
        this.currentPage = 1;
        this.loadPosts();
    }

    handleSearch() {
        this.currentPage = 1;
        this.loadPosts();
    }

    updateLoadMoreButton(pagination) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        if (pagination.hasNext) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.disabled = false;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Dashboard
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Load data for specific tabs
        if (tabName === 'posts') {
            this.loadUserPosts();
        } else if (tabName === 'profile') {
            this.loadUserProfile();
        }
    }

    async loadUserProfile() {
        if (!this.currentUser) return;
        
        document.getElementById('userName').textContent = this.currentUser.username;
        document.getElementById('userEmail').textContent = this.currentUser.email;
        document.getElementById('userBio').textContent = this.currentUser.bio || 'No bio available';
        document.getElementById('userAvatar').src = this.currentUser.avatar;
    }

    async loadUserPosts() {
        if (!this.currentUser) return;
        
        try {
            this.showLoading();
            const response = await this.apiCall(`/posts/user/${this.currentUser._id}`, 'GET');
            
            if (response.success) {
                this.displayUserPosts(response.data.posts);
            } else {
                this.showToast('Failed to load your posts', 'error');
            }
        } catch (error) {
            this.showToast('Failed to load your posts', 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayUserPosts(posts) {
        const userPosts = document.getElementById('userPosts');
        if (!userPosts) return;

        if (posts.length === 0) {
            userPosts.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-edit"></i>
                    <h3>No posts yet</h3>
                    <p>Create your first post to get started!</p>
                </div>
            `;
            return;
        }

        userPosts.innerHTML = posts.map(post => `
            <div class="user-post">
                <div class="post-info">
                    <h4>${post.title}</h4>
                    <p>Status: ${post.status} | Views: ${post.views} | Created: ${new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="post-actions">
                    <button class="btn btn-sm btn-primary" onclick="blogCMS.editPost('${post._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="blogCMS.deletePost('${post._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    async handleCreatePost(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Convert tags string to array
        if (data.tags) {
            data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        try {
            this.showLoading();
            const response = await this.apiCall('/posts', 'POST', data);
            
            if (response.success) {
                this.showToast('Post created successfully!', 'success');
                e.target.reset();
                this.switchTab('posts');
                this.loadUserPosts();
            } else {
                this.showToast(response.message || 'Failed to create post', 'error');
            }
        } catch (error) {
            this.showToast('Failed to create post', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async editPost(postId) {
        // In a real app, you'd open an edit form
        this.showToast('Edit functionality coming soon!', 'info');
    }

    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post?')) return;
        
        try {
            this.showLoading();
            const response = await this.apiCall(`/posts/${postId}`, 'DELETE');
            
            if (response.success) {
                this.showToast('Post deleted successfully', 'success');
                this.loadUserPosts();
            } else {
                this.showToast('Failed to delete post', 'error');
            }
        } catch (error) {
            this.showToast('Failed to delete post', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // API Helper
    async apiCall(endpoint, method = 'GET', data = null, token = null) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token || this.currentUser) {
            options.headers['Authorization'] = `Bearer ${token || localStorage.getItem('token')}`;
        }

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        return await response.json();
    }

    // UI Helpers
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'flex';
        }
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize the application
const blogCMS = new BlogCMS();

// Global functions for inline event handlers
window.blogCMS = blogCMS;
