const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/database');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get task statistics
    const taskStats = await db.get(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'review' THEN 1 END) as review_tasks
      FROM tasks
    `);

    // Get team statistics
    const teamStats = await db.get(`
      SELECT 
        COUNT(*) as total_teams,
        COUNT(DISTINCT tm.user_id) as total_members
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
    `);

    // Get user statistics
    const userStats = await db.get(`
      SELECT COUNT(*) as total_users
      FROM users
    `);

    // Get recent activities
    const activities = await db.all(`
      SELECT a.*, u.name as user_name, t.title as task_title, tm.name as team_name
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN tasks t ON a.task_id = t.id
      LEFT JOIN teams tm ON a.team_id = tm.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        tasks: taskStats,
        teams: teamStats,
        users: userStats,
        activities
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get task completion trends
router.get('/tasks/trends', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const trends = await db.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as created,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed
      FROM tasks
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    console.error('Get task trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get team performance
router.get('/teams/performance', authenticateToken, async (req, res) => {
  try {
    const performance = await db.all(`
      SELECT 
        t.id,
        t.name,
        COUNT(tsk.id) as total_tasks,
        COUNT(CASE WHEN tsk.status = 'done' THEN 1 END) as completed_tasks,
        COUNT(tm.user_id) as member_count,
        ROUND(
          CASE 
            WHEN COUNT(tsk.id) > 0 
            THEN (COUNT(CASE WHEN tsk.status = 'done' THEN 1 END) * 100.0 / COUNT(tsk.id))
            ELSE 0 
          END, 2
        ) as completion_rate
      FROM teams t
      LEFT JOIN tasks tsk ON t.id = tsk.team_id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      GROUP BY t.id, t.name
      ORDER BY completion_rate DESC
    `);

    res.json({
      success: true,
      data: { performance }
    });
  } catch (error) {
    console.error('Get team performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user productivity
router.get('/users/productivity', authenticateToken, async (req, res) => {
  try {
    const productivity = await db.all(`
      SELECT 
        u.id,
        u.name,
        u.role,
        COUNT(tsk.id) as total_tasks,
        COUNT(CASE WHEN tsk.status = 'done' THEN 1 END) as completed_tasks,
        COUNT(tm.team_id) as team_count,
        ROUND(
          CASE 
            WHEN COUNT(tsk.id) > 0 
            THEN (COUNT(CASE WHEN tsk.status = 'done' THEN 1 END) * 100.0 / COUNT(tsk.id))
            ELSE 0 
          END, 2
        ) as completion_rate
      FROM users u
      LEFT JOIN tasks tsk ON u.id = tsk.assignee_id
      LEFT JOIN team_members tm ON u.id = tm.user_id
      GROUP BY u.id, u.name, u.role
      ORDER BY completion_rate DESC
    `);

    res.json({
      success: true,
      data: { productivity }
    });
  } catch (error) {
    console.error('Get user productivity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get priority distribution
router.get('/tasks/priority-distribution', authenticateToken, async (req, res) => {
  try {
    const distribution = await db.all(`
      SELECT 
        priority,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tasks), 2) as percentage
      FROM tasks
      GROUP BY priority
      ORDER BY 
        CASE priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END
    `);

    res.json({
      success: true,
      data: { distribution }
    });
  } catch (error) {
    console.error('Get priority distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get overdue tasks
router.get('/tasks/overdue', authenticateToken, async (req, res) => {
  try {
    const overdueTasks = await db.all(`
      SELECT 
        t.*,
        u.name as assignee_name,
        tm.name as team_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE t.due_date < date('now') 
        AND t.status != 'done'
      ORDER BY t.due_date
    `);

    res.json({
      success: true,
      data: { overdueTasks }
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get activity summary
router.get('/activity/summary', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const summary = await db.all(`
      SELECT 
        action,
        COUNT(*) as count
      FROM activities
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY action
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
