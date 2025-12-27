const WorkLog = require('../models/worklog.model');

// Start Timer
exports.startWork = async (req, res) => {
  try {
    const log = await WorkLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found" });

    await log.update({ 
      startTime: new Date(), 
      status: 'In Progress' 
    });
    
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Stop Timer & Calculate Duration
exports.stopWork = async (req, res) => {
  try {
    const log = await WorkLog.findByPk(req.params.id);
    const endTime = new Date();
    
    // SQL/JS Time Calculation
    const diffInMs = endTime - new Date(log.startTime);
    const diffInMins = Math.round(diffInMs / 60000);

    await log.update({
      endTime: endTime,
      durationMinutes: diffInMins,
      status: 'Completed'
    });

    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch for UI Views
exports.getLogs = async (req, res) => {
  const logs = await WorkLog.findAll();
  res.json(logs);
};