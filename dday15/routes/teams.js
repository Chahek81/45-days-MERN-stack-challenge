const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/database');

const router = express.Router();

// Get all teams
router.get('/', authenticateToken, async (req, res) => {
  try {
    const teams = await db.all(`
      SELECT t.*, 
             COUNT(tm.user_id) as member_count,
             COUNT(tsk.id) as task_count,
             COUNT(CASE WHEN tsk.status = 'done' THEN 1 END) as completed_tasks
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN tasks tsk ON t.id = tsk.team_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    res.json({
      success: true,
      data: { teams }
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get team by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const team = await db.get(`
      SELECT t.*, 
             COUNT(tm.user_id) as member_count,
             COUNT(tsk.id) as task_count,
             COUNT(CASE WHEN tsk.status = 'done' THEN 1 END) as completed_tasks
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN tasks tsk ON t.id = tsk.team_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [id]);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get team members
    const members = await db.all(`
      SELECT u.id, u.name, u.email, u.role, u.avatar, tm.role as team_role, tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ?
      ORDER BY tm.joined_at
    `, [id]);

    // Get team tasks
    const tasks = await db.all(`
      SELECT t.*, 
             u.name as assignee_name, 
             u.avatar as assignee_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.team_id = ?
      ORDER BY t.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: { 
        team: {
          ...team,
          members,
          tasks
        }
      }
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new team
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 1 }).withMessage('Team name is required'),
  body('description').optional().trim(),
  body('members').optional().isArray().withMessage('Members must be an array')
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

    const { name, description = '', members = [] } = req.body;

    // Create team
    const result = await db.run(`
      INSERT INTO teams (name, description, created_by)
      VALUES (?, ?, ?)
    `, [name, description, req.user.userId]);

    // Add creator as team member
    await db.run(`
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (?, ?, ?)
    `, [result.id, req.user.userId, 'lead']);

    // Add other members
    for (const memberId of members) {
      await db.run(`
        INSERT INTO team_members (team_id, user_id, role)
        VALUES (?, ?, ?)
      `, [result.id, memberId, 'member']);
    }

    // Log activity
    await db.run(`
      INSERT INTO activities (user_id, team_id, action, description)
      VALUES (?, ?, ?, ?)
    `, [req.user.userId, result.id, 'created', `Created team "${name}"`]);

    // Get created team with details
    const team = await db.get(`
      SELECT t.*, 
             COUNT(tm.user_id) as member_count,
             COUNT(tsk.id) as task_count,
             COUNT(CASE WHEN tsk.status = 'done' THEN 1 END) as completed_tasks
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN tasks tsk ON t.id = tsk.team_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [result.id]);

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: { team }
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update team
router.put('/:id', authenticateToken, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Team name cannot be empty'),
  body('description').optional().trim()
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

    const team = await db.get('SELECT * FROM teams WHERE id = ?', [id]);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
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
      UPDATE teams 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, values);

    // Log activity
    await db.run(`
      INSERT INTO activities (user_id, team_id, action, description)
      VALUES (?, ?, ?, ?)
    `, [req.user.userId, id, 'updated', `Updated team "${team.name}"`]);

    res.json({
      success: true,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add member to team
router.post('/:id/members', authenticateToken, [
  body('user_id').isInt().withMessage('User ID is required'),
  body('role').optional().isIn(['member', 'lead']).withMessage('Role must be member or lead')
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
    const { user_id, role = 'member' } = req.body;

    // Check if team exists
    const team = await db.get('SELECT * FROM teams WHERE id = ?', [id]);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user exists
    const user = await db.get('SELECT * FROM users WHERE id = ?', [user_id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const existingMember = await db.get(
      'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?',
      [id, user_id]
    );
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team'
      });
    }

    // Add member
    await db.run(`
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (?, ?, ?)
    `, [id, user_id, role]);

    // Log activity
    await db.run(`
      INSERT INTO activities (user_id, team_id, action, description)
      VALUES (?, ?, ?, ?)
    `, [req.user.userId, id, 'member_added', `Added ${user.name} to team`]);

    res.json({
      success: true,
      message: 'Member added to team successfully'
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Remove member from team
router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = await db.run(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in team'
      });
    }

    // Log activity
    await db.run(`
      INSERT INTO activities (user_id, team_id, action, description)
      VALUES (?, ?, ?, ?)
    `, [req.user.userId, id, 'member_removed', `Removed member from team`]);

    res.json({
      success: true,
      message: 'Member removed from team successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete team
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const team = await db.get('SELECT * FROM teams WHERE id = ?', [id]);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    await db.run('DELETE FROM teams WHERE id = ?', [id]);

    // Log activity
    await db.run(`
      INSERT INTO activities (user_id, action, description)
      VALUES (?, ?, ?)
    `, [req.user.userId, 'deleted', `Deleted team "${team.name}"`]);

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
