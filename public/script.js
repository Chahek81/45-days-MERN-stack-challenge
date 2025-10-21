// TaskFlow - Complete Task Management System with Backend Integration
class TaskFlow {
    constructor() {
        this.apiBaseUrl = '/api';
        this.token = localStorage.getItem('token');
        this.currentUser = null;
        
        this.initializeApp();
        this.bindEvents();
        this.checkAuth();
    }

    async initializeApp() {
        // Initialize theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Initialize sidebar
        this.initializeSidebar();
        
        // Initialize search
        this.initializeSearch();
        
        // Initialize notifications
        this.initializeNotifications();
        
        // Initialize WebSocket connection
        this.initializeWebSocket();
    }

    async checkAuth() {
        if (!this.token) {
            this.showLoginModal();
            return;
        }

        try {
            const response = await this.apiCall('/auth/me', 'GET');
            if (response.success) {
                this.currentUser = response.data.user;
                this.updateUserProfile();
                await this.loadDashboardData();
            } else {
                this.showLoginModal();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLoginModal();
        }
    }

    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Login to TaskFlow</h3>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" id="loginEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        <div class="form-group">
                            <button type="button" id="showRegister">Don't have an account? Register</button>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="loginCancel">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="loginSubmit">Login</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Bind login events
        document.getElementById('loginSubmit').addEventListener('click', () => this.handleLogin());
        document.getElementById('showRegister').addEventListener('click', () => this.showRegisterModal());
        document.getElementById('loginCancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    showRegisterModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Register for TaskFlow</h3>
                </div>
                <div class="modal-body">
                    <form id="registerForm">
                        <div class="form-group">
                            <label for="registerName">Name</label>
                            <input type="text" id="registerName" required>
                        </div>
                        <div class="form-group">
                            <label for="registerEmail">Email</label>
                            <input type="email" id="registerEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="registerPassword">Password</label>
                            <input type="password" id="registerPassword" required>
                        </div>
                        <div class="form-group">
                            <button type="button" id="showLogin">Already have an account? Login</button>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="registerCancel">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="registerSubmit">Register</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Bind register events
        document.getElementById('registerSubmit').addEventListener('click', () => this.handleRegister());
        document.getElementById('showLogin').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showLoginModal();
        });
        document.getElementById('registerCancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.token = data.data.token;
                this.currentUser = data.data.user;
                localStorage.setItem('token', this.token);
                
                // Remove login modal
                const modal = document.querySelector('.modal');
                if (modal) document.body.removeChild(modal);
                
                this.updateUserProfile();
                await this.loadDashboardData();
                this.showNotification('Login successful!', 'success');
            } else {
                this.showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.token = data.data.token;
                this.currentUser = data.data.user;
                localStorage.setItem('token', this.token);
                
                // Remove register modal
                const modal = document.querySelector('.modal');
                if (modal) document.body.removeChild(modal);
                
                this.updateUserProfile();
                await this.loadDashboardData();
                this.showNotification('Registration successful!', 'success');
            } else {
                this.showNotification(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        }
    }

    updateUserProfile() {
        if (this.currentUser) {
            const userName = document.querySelector('.user-name');
            const userRole = document.querySelector('.user-role');
            
            if (userName) userName.textContent = this.currentUser.name;
            if (userRole) userRole.textContent = this.currentUser.role;
        }
    }

    async loadDashboardData() {
        try {
            // Load dashboard analytics
            const analyticsResponse = await this.apiCall('/analytics/dashboard', 'GET');
            if (analyticsResponse.success) {
                this.updateDashboardStats(analyticsResponse.data);
            }

            // Load tasks
            const tasksResponse = await this.apiCall('/tasks', 'GET');
            if (tasksResponse.success) {
                this.tasks = tasksResponse.data.tasks;
                this.updateMyTasks();
                this.updateKanbanBoard();
            }

            // Load teams
            const teamsResponse = await this.apiCall('/teams', 'GET');
            if (teamsResponse.success) {
                this.teams = teamsResponse.data.teams;
                this.updateTeamOverview();
            }

            // Load users
            const usersResponse = await this.apiCall('/users', 'GET');
            if (usersResponse.success) {
                this.users = usersResponse.data.users;
            }

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showNotification('Failed to load data. Please refresh the page.', 'error');
        }
    }

    updateDashboardStats(data) {
        // Update stats cards
        if (data.tasks) {
            document.getElementById('totalTasks').textContent = data.tasks.total_tasks || 0;
            document.getElementById('completedTasks').textContent = data.tasks.completed_tasks || 0;
        }
        if (data.teams) {
            document.getElementById('activeTeams').textContent = data.teams.total_teams || 0;
        }
        if (data.users) {
            document.getElementById('activeProjects').textContent = data.users.total_users || 0;
        }

        // Update activity feed
        if (data.activities) {
            this.updateActivityFeed(data.activities);
        }
    }

    updateActivityFeed(activities) {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${this.getActivityIcon(activity.action)}">
                    <i class="fas fa-${this.getActivityIcon(activity.action)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.description}</div>
                    <div class="activity-time">${this.getRelativeTime(activity.created_at)}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(action) {
        const icons = {
            'created': 'plus',
            'updated': 'edit',
            'deleted': 'trash',
            'status_changed': 'exchange-alt',
            'member_added': 'user-plus',
            'member_removed': 'user-minus'
        };
        return icons[action] || 'info';
    }

    initializeSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.querySelector('.sidebar');
        const menuItems = document.querySelectorAll('.menu-item');

        // Desktop sidebar toggle
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }

        // Mobile menu toggle
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Menu navigation
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.showSection(section);
                
                // Update active menu item
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    initializeSearch() {
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }
    }

    initializeNotifications() {
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotification('Notifications feature coming soon!', 'info');
            });
        }
    }

    initializeWebSocket() {
        // WebSocket connection will be established after authentication
        if (this.token) {
            this.connectWebSocket();
        }
    }

    connectWebSocket() {
        // WebSocket connection for real-time updates
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket');
            // Join user to their team rooms
            if (this.currentUser && this.teams) {
                const teamIds = this.teams.map(team => team.id);
                this.socket.emit('join-teams', teamIds);
            }
        });

        this.socket.on('task-changed', (data) => {
            console.log('Task changed:', data);
            this.showNotification(`Task "${data.title}" was updated`, 'info');
            this.loadDashboardData(); // Refresh data
        });

        this.socket.on('team-changed', (data) => {
            console.log('Team changed:', data);
            this.showNotification(`Team "${data.name}" was updated`, 'info');
            this.loadDashboardData(); // Refresh data
        });
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
        return await response.json();
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update content based on section
        switch(sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'kanban':
                this.updateKanbanBoard();
                break;
            case 'teams':
                this.updateTeams();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
        }
    }

    async updateDashboard() {
        try {
            const response = await this.apiCall('/analytics/dashboard', 'GET');
            if (response.success) {
                this.updateDashboardStats(response.data);
            }
        } catch (error) {
            console.error('Failed to update dashboard:', error);
        }
    }

    updateMyTasks() {
        const myTasksList = document.getElementById('myTasksList');
        if (!myTasksList || !this.tasks) return;

        const myTasks = this.tasks.filter(t => t.assignee_id === this.currentUser.id).slice(0, 5);
        
        if (myTasks.length === 0) {
            myTasksList.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><h3>No tasks assigned</h3><p>You don\'t have any tasks assigned to you.</p></div>';
            return;
        }
        
        myTasksList.innerHTML = myTasks.map(task => `
            <div class="task-item">
                <div class="task-priority ${task.priority}"></div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span>${task.assignee_name || 'Unassigned'}</span>
                        <span>${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                        <span class="task-status">${task.status.replace('-', ' ')}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action" onclick="taskFlow.editTask(${task.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action" onclick="taskFlow.deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateTeamOverview() {
        const teamOverview = document.getElementById('teamOverview');
        if (!teamOverview || !this.teams) return;
        
        teamOverview.innerHTML = this.teams.slice(0, 3).map(team => `
            <div class="team-card">
                <div class="team-avatar">${team.name.charAt(0)}</div>
                <div class="team-info">
                    <div class="team-name">${team.name}</div>
                    <div class="team-members">${team.member_count} members</div>
                </div>
            </div>
        `).join('');
    }

    async updateKanbanBoard() {
        if (!this.tasks) return;

        const columns = ['todo', 'in-progress', 'review', 'done'];
        
        columns.forEach(status => {
            const column = document.getElementById(`${status.replace('-', '')}Column`);
            const count = document.getElementById(`${status.replace('-', '')}Count`);
            const tasks = this.tasks.filter(t => t.status === status);
            
            if (count) count.textContent = tasks.length;
            
            if (column) {
                column.innerHTML = tasks.map(task => `
                    <div class="kanban-task" draggable="true" data-task-id="${task.id}">
                        <div class="task-header">
                            <div class="task-title">${task.title}</div>
                            <div class="task-priority-badge ${task.priority}">${task.priority}</div>
                        </div>
                        <div class="task-description">${task.description}</div>
                        <div class="task-footer">
                            <div class="task-assignee">
                                <i class="fas fa-user"></i>
                                <span>${task.assignee_name || 'Unassigned'}</span>
                            </div>
                            <div class="task-due-date">
                                <i class="fas fa-calendar"></i>
                                <span>${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                // Add drag event listeners
                column.querySelectorAll('.kanban-task').forEach(taskEl => {
                    taskEl.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', taskEl.getAttribute('data-task-id'));
                        taskEl.classList.add('dragging');
                    });
                    
                    taskEl.addEventListener('dragend', () => {
                        taskEl.classList.remove('dragging');
                    });
                });
            }
        });

        // Initialize drag and drop
        this.initializeKanbanDragDrop();
    }

    initializeKanbanDragDrop() {
        const columns = document.querySelectorAll('.kanban-column');
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });

            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });

            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                const taskId = parseInt(e.dataTransfer.getData('text/plain'));
                const newStatus = column.getAttribute('data-status');
                
                await this.moveTask(taskId, newStatus);
            });
        });
    }

    async moveTask(taskId, newStatus) {
        try {
            const response = await this.apiCall(`/tasks/${taskId}`, 'PUT', { status: newStatus });
            if (response.success) {
                // Update local data
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    task.status = newStatus;
                }
                
                this.updateKanbanBoard();
                this.showNotification(`Task moved to ${newStatus.replace('-', ' ')}`, 'success');
            } else {
                this.showNotification('Failed to move task', 'error');
            }
        } catch (error) {
            console.error('Move task error:', error);
            this.showNotification('Failed to move task', 'error');
        }
    }

    async updateTeams() {
        try {
            const response = await this.apiCall('/teams', 'GET');
            if (response.success) {
                this.teams = response.data.teams;
                this.renderTeams();
            }
        } catch (error) {
            console.error('Failed to load teams:', error);
        }
    }

    renderTeams() {
        const teamsGrid = document.getElementById('teamsGrid');
        if (!teamsGrid || !this.teams) return;
        
        teamsGrid.innerHTML = this.teams.map(team => `
            <div class="team-card-large">
                <div class="team-header">
                    <div class="team-avatar-large">${team.name.charAt(0)}</div>
                    <div class="team-info-large">
                        <h3>${team.name}</h3>
                        <p>${team.description}</p>
                    </div>
                </div>
                <div class="team-stats">
                    <div class="team-stat">
                        <div class="team-stat-value">${team.task_count || 0}</div>
                        <div class="team-stat-label">Tasks</div>
                    </div>
                    <div class="team-stat">
                        <div class="team-stat-value">${team.completed_tasks || 0}</div>
                        <div class="team-stat-label">Completed</div>
                    </div>
                    <div class="team-stat">
                        <div class="team-stat-value">${team.member_count || 0}</div>
                        <div class="team-stat-label">Members</div>
                    </div>
                </div>
                <div class="team-actions">
                    <button class="team-action primary" onclick="taskFlow.viewTeam(${team.id})">View</button>
                    <button class="team-action" onclick="taskFlow.editTeam(${team.id})">Edit</button>
                    <button class="team-action" onclick="taskFlow.deleteTeam(${team.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async updateAnalytics() {
        try {
            const response = await this.apiCall('/analytics/dashboard', 'GET');
            if (response.success) {
                this.updateAnalyticsData(response.data);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    }

    updateAnalyticsData(data) {
        // Update completion rate
        if (data.tasks) {
            const completionRate = data.tasks.total_tasks > 0 
                ? Math.round((data.tasks.completed_tasks / data.tasks.total_tasks) * 100) 
                : 0;
            
            document.getElementById('completionRate').textContent = `${completionRate}%`;
            document.querySelector('.progress-fill').style.width = `${completionRate}%`;
        }

        // Update productivity score (simulated)
        const score = Math.floor(Math.random() * 20) + 80;
        document.getElementById('productivityScore').textContent = score;
    }

    performSearch(query) {
        if (!query.trim()) return;
        
        // Search functionality can be enhanced with backend search endpoint
        console.log('Searching for:', query);
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }

    // Utility methods
    getRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    // Task management methods
    async editTask(taskId) {
        try {
            const response = await this.apiCall(`/tasks/${taskId}`, 'GET');
            if (response.success) {
                this.openTaskModal(response.data.task);
            }
        } catch (error) {
            console.error('Failed to load task:', error);
        }
    }

    async deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await this.apiCall(`/tasks/${taskId}`, 'DELETE');
                if (response.success) {
                    this.tasks = this.tasks.filter(t => t.id !== taskId);
                    this.updateDashboard();
                    this.updateKanbanBoard();
                    this.showNotification('Task deleted successfully!', 'success');
                } else {
                    this.showNotification('Failed to delete task', 'error');
                }
            } catch (error) {
                console.error('Delete task error:', error);
                this.showNotification('Failed to delete task', 'error');
            }
        }
    }

    openTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        
        if (task) {
            title.textContent = 'Edit Task';
            this.populateTaskForm(task);
        } else {
            title.textContent = 'Create Task';
            document.getElementById('taskForm').reset();
        }
        
        this.populateTaskSelects();
        modal.classList.add('active');
    }

    populateTaskForm(task) {
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskAssignee').value = task.assignee_id || '';
        document.getElementById('taskDueDate').value = task.due_date || '';
        document.getElementById('taskTeam').value = task.team_id || '';
    }

    async populateTaskSelects() {
        const assigneeSelect = document.getElementById('taskAssignee');
        const teamSelect = document.getElementById('taskTeam');
        
        // Populate assignees
        if (this.users) {
            assigneeSelect.innerHTML = '<option value="">Select Assignee</option>';
            this.users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                assigneeSelect.appendChild(option);
            });
        }
        
        // Populate teams
        if (this.teams) {
            teamSelect.innerHTML = '<option value="">Select Team</option>';
            this.teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.name;
                teamSelect.appendChild(option);
            });
        }
    }

    async saveTask() {
        const form = document.getElementById('taskForm');
        const formData = new FormData(form);
        
        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            assignee_id: parseInt(document.getElementById('taskAssignee').value) || null,
            due_date: document.getElementById('taskDueDate').value,
            team_id: parseInt(document.getElementById('taskTeam').value) || null
        };
        
        if (!taskData.title) {
            this.showNotification('Please enter a task title', 'error');
            return;
        }
        
        try {
            const response = await this.apiCall('/tasks', 'POST', taskData);
            if (response.success) {
                this.closeTaskModal();
                await this.loadDashboardData();
                this.showNotification('Task created successfully!', 'success');
            } else {
                this.showNotification(response.message || 'Failed to create task', 'error');
            }
        } catch (error) {
            console.error('Create task error:', error);
            this.showNotification('Failed to create task', 'error');
        }
    }

    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
        document.getElementById('taskForm').reset();
    }

    // Team management methods
    async viewTeam(teamId) {
        this.showNotification(`Viewing team details for team ${teamId}`, 'info');
    }

    async editTeam(teamId) {
        this.showNotification(`Edit team ${teamId}`, 'info');
    }

    async deleteTeam(teamId) {
        if (confirm('Are you sure you want to delete this team?')) {
            try {
                const response = await this.apiCall(`/teams/${teamId}`, 'DELETE');
                if (response.success) {
                    this.teams = this.teams.filter(t => t.id !== teamId);
                    this.updateTeams();
                    this.showNotification('Team deleted successfully!', 'success');
                } else {
                    this.showNotification('Failed to delete team', 'error');
                }
            } catch (error) {
                console.error('Delete team error:', error);
                this.showNotification('Failed to delete team', 'error');
            }
        }
    }

    bindEvents() {
        // Task modal events
        this.bindTaskModalEvents();
        
        // Team modal events
        this.bindTeamModalEvents();
        
        // Quick action buttons
        this.bindQuickActions();
    }

    bindTaskModalEvents() {
        const taskModal = document.getElementById('taskModal');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskModalClose = document.getElementById('taskModalClose');
        const taskModalCancel = document.getElementById('taskModalCancel');
        const taskModalSave = document.getElementById('taskModalSave');

        // Open modal
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.openTaskModal();
            });
        }

        // Close modal
        [taskModalClose, taskModalCancel].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.closeTaskModal();
                });
            }
        });

        // Save task
        if (taskModalSave) {
            taskModalSave.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveTask();
            });
        }

        // Close modal on backdrop click
        if (taskModal) {
            taskModal.addEventListener('click', (e) => {
                if (e.target === taskModal) {
                    this.closeTaskModal();
                }
            });
        }
    }

    bindTeamModalEvents() {
        const teamModal = document.getElementById('teamModal');
        const createTeamBtn = document.getElementById('createTeamBtn');
        const teamModalClose = document.getElementById('teamModalClose');
        const teamModalCancel = document.getElementById('teamModalCancel');
        const teamModalSave = document.getElementById('teamModalSave');

        // Open modal
        if (createTeamBtn) {
            createTeamBtn.addEventListener('click', () => {
                this.openTeamModal();
            });
        }

        // Close modal
        [teamModalClose, teamModalCancel].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.closeTeamModal();
                });
            }
        });

        // Save team
        if (teamModalSave) {
            teamModalSave.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveTeam();
            });
        }

        // Close modal on backdrop click
        if (teamModal) {
            teamModal.addEventListener('click', (e) => {
                if (e.target === teamModal) {
                    this.closeTeamModal();
                }
            });
        }
    }

    bindQuickActions() {
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                switch(action) {
                    case 'create-task':
                        this.openTaskModal();
                        break;
                    case 'create-team':
                        this.openTeamModal();
                        break;
                    case 'view-kanban':
                        this.showSection('kanban');
                        document.querySelector('[data-section="kanban"]').click();
                        break;
                    case 'view-analytics':
                        this.showSection('analytics');
                        document.querySelector('[data-section="analytics"]').click();
                        break;
                }
            });
        });
    }

    openTeamModal(teamId = null) {
        const modal = document.getElementById('teamModal');
        const title = document.getElementById('teamModalTitle');
        
        if (teamId) {
            title.textContent = 'Edit Team';
        } else {
            title.textContent = 'Create Team';
            document.getElementById('teamForm').reset();
        }
        
        modal.classList.add('active');
    }

    closeTeamModal() {
        const modal = document.getElementById('teamModal');
        modal.classList.remove('active');
        document.getElementById('teamForm').reset();
    }

    async saveTeam() {
        const teamName = document.getElementById('teamName').value;
        const teamDescription = document.getElementById('teamDescription').value;
        
        if (!teamName) {
            this.showNotification('Please enter a team name', 'error');
            return;
        }
        
        try {
            const response = await this.apiCall('/teams', 'POST', {
                name: teamName,
                description: teamDescription
            });
            
            if (response.success) {
                this.closeTeamModal();
                await this.updateTeams();
                this.showNotification('Team created successfully!', 'success');
            } else {
                this.showNotification(response.message || 'Failed to create team', 'error');
            }
        } catch (error) {
            console.error('Create team error:', error);
            this.showNotification('Failed to create team', 'error');
        }
    }
}

// Initialize the application
const taskFlow = new TaskFlow();