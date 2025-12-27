const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Your DB connection file
const { startWork } = require('../worklog/worklog.controller');

const WorkLog = sequelize.define('WorkLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  technicianId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Todo', 'In Progress', 'Completed'),
    defaultValue: 'Todo'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPreventive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = worklog;
