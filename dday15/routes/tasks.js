const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/database');

const router = express.Router();

// Get all tasks for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, team_id, assignee_id } = req.query;
    let sql = `
      SELECT t.*, 
             u.name as assignee_name, 
             u.avatar as assignee_avatar,
             tm.name as team_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE 1=1
    `;
    const params = [];

    // Add filters
    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }
    if (team_id) {
      sql += ' AND t.team_id = ?';
      params.push(team_id);
    }
    if (assignee_id) {
      sql += ' AND t.assignee_id = ?';
      params.push(assignee_id);
    }

    sql += ' ORDER BY t.created_at DESC';

    const tasks = await db.all(sql, params);

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await db.get(`
      SELECT t.*, 
             u.name as assignee_name, 
             u.avatar as assignee_avatar,
             tm.name as team_name,
             creator.name as created_by_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN teams tm ON t.team_id = tm.id
      LEFT JOIN users creator ON t.created_by = creator.id
      WHERE t.id = ?
    `, [id]);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new task
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status'),
  body('assignee_id').optional().isInt().withMessage('Assignee ID must be a number'),
  body('team_id').optional().isInt().withMessage('Team ID must be a number'),
  body('due_date').optional().isISO8601().withMessage('Due date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description = '',
      priority = 'medium',
      status = 'todo',
      assignee_id,
      team_id,
      due_date
    } = req.body;

    const result = await db.run(`
      INSERT INTO tasks (title, description, priority, status, assignee_id, team_id, due_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, priority, status, assignee_id, team_id, due_date, req.user.userId]);

    // Log activity
    await db.run(`
      INSERT INTO activities (user_id, team_id, task_id, action, description)
      VALUES (?, ?, ?, ?, ?)
    `, [req.user.userId, team_id, result.id, 'created', `Created task "${title}"`]);

    // Get the created task with details
    const task = await db.get(`
      SELECT t.*, 
             u.name as assignee_name, 
             u.avatar as assignee_avatar,
             tm.name as team_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE t.id = ?
    `, [result.id]);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update task
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status'),
  body('assignee_id').optional().isInt().withMessage('Assignee ID must be a number'),
  body('team_id').optional().isInt().withMessage('Team ID must be a number'),
  body('due_date').optional().isISO8601().withMessage('Due date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Get current task
    const currentTask = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!currentTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Build update query
    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && updates[key] !== null) {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(`
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, values);

    // Log activity for status changes
    if (updates.status && updates.status !== currentTask.status) {
      await db.run(`
        INSERT INTO activities (user_id, team_id, task_id, action, description)
        VALUES (?, ?, ?, ?, ?)
      `, [req.user.userId, currentTask.team_id, id, 'status_changed', 
          `Changed status from "${currentTask.status}" to "${updates.status}"`]);
    }

    // Get updated task
    const task = await db.get(`
      SELECT t.*, 
             u.name as assignee_name, 
             u.avatar as assignee_avatar,
             tm.name as team_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE t.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await db.run('DELETE FROM tasks WHERE id = ?', [id]);

    // Log activity
    await db.run(`
      INSERT INTO activities (user_id, team_id, action, description)
      VALUES (?, ?, ?, ?)
    `, [req.user.userId, task.team_id, 'deleted', `Deleted task "${task.title}"`]);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get task statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'review' THEN 1 END) as review_tasks
      FROM tasks
    `);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
