const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, 'taskflow.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Teams table
      `CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )`,

      // Team members junction table
      `CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(team_id, user_id)
      )`,

      // Tasks table
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'todo',
        assignee_id INTEGER,
        team_id INTEGER,
        due_date DATE,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignee_id) REFERENCES users (id),
        FOREIGN KEY (team_id) REFERENCES teams (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )`,

      // Activity log table
      `CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        team_id INTEGER,
        task_id INTEGER,
        action TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (team_id) REFERENCES teams (id),
        FOREIGN KEY (task_id) REFERENCES tasks (id)
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_team ON tasks(team_id)',
      'CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id)'
    ];

    for (const index of indexes) {
      await this.run(index);
    }

    // Insert sample data
    await this.insertSampleData();
  }

  async insertSampleData() {
    // Check if data already exists
    const userCount = await this.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) return;

    console.log('Inserting sample data...');

    // Create sample users
    const users = [
      { name: 'John Doe', email: 'john@taskflow.com', password: await bcrypt.hash('password123', 10), role: 'admin' },
      { name: 'Jane Smith', email: 'jane@taskflow.com', password: await bcrypt.hash('password123', 10), role: 'user' },
      { name: 'Mike Johnson', email: 'mike@taskflow.com', password: await bcrypt.hash('password123', 10), role: 'user' },
      { name: 'Sarah Wilson', email: 'sarah@taskflow.com', password: await bcrypt.hash('password123', 10), role: 'user' },
      { name: 'David Brown', email: 'david@taskflow.com', password: await bcrypt.hash('password123', 10), role: 'user' }
    ];

    for (const user of users) {
      await this.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, user.password, user.role]
      );
    }

    // Create sample teams
    const teams = [
      { name: 'Frontend Team', description: 'Responsible for user interface development', created_by: 1 },
      { name: 'Backend Team', description: 'Handles server-side development and APIs', created_by: 1 },
      { name: 'Design Team', description: 'UI/UX design and user experience', created_by: 1 }
    ];

    for (const team of teams) {
      const result = await this.run(
        'INSERT INTO teams (name, description, created_by) VALUES (?, ?, ?)',
        [team.name, team.description, team.created_by]
      );
    }

    // Add team members
    const teamMembers = [
      { team_id: 1, user_id: 1, role: 'lead' },
      { team_id: 1, user_id: 2, role: 'member' },
      { team_id: 1, user_id: 3, role: 'member' },
      { team_id: 2, user_id: 1, role: 'lead' },
      { team_id: 2, user_id: 4, role: 'member' },
      { team_id: 2, user_id: 5, role: 'member' },
      { team_id: 3, user_id: 3, role: 'lead' },
      { team_id: 3, user_id: 4, role: 'member' }
    ];

    for (const member of teamMembers) {
      await this.run(
        'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
        [member.team_id, member.user_id, member.role]
      );
    }

    // Create sample tasks
    const tasks = [
      {
        title: 'Implement user authentication',
        description: 'Create login and registration functionality with JWT tokens',
        priority: 'high',
        status: 'in-progress',
        assignee_id: 2,
        team_id: 1,
        due_date: '2024-03-15',
        created_by: 1
      },
      {
        title: 'Design mobile responsive layout',
        description: 'Ensure all pages work perfectly on mobile devices',
        priority: 'medium',
        status: 'todo',
        assignee_id: 3,
        team_id: 1,
        due_date: '2024-03-20',
        created_by: 1
      },
      {
        title: 'Set up database schema',
        description: 'Design and implement the database structure',
        priority: 'high',
        status: 'done',
        assignee_id: 5,
        team_id: 2,
        due_date: '2024-02-28',
        created_by: 1
      },
      {
        title: 'Create API documentation',
        description: 'Document all REST API endpoints',
        priority: 'low',
        status: 'review',
        assignee_id: 4,
        team_id: 2,
        due_date: '2024-03-25',
        created_by: 1
      },
      {
        title: 'User interface mockups',
        description: 'Create high-fidelity mockups for all pages',
        priority: 'medium',
        status: 'done',
        assignee_id: 3,
        team_id: 3,
        due_date: '2024-02-15',
        created_by: 1
      }
    ];

    for (const task of tasks) {
      await this.run(
        'INSERT INTO tasks (title, description, priority, status, assignee_id, team_id, due_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [task.title, task.description, task.priority, task.status, task.assignee_id, task.team_id, task.due_date, task.created_by]
      );
    }

    console.log('Sample data inserted successfully!');
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();
