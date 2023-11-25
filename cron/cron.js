const Task = require('../models/taskModel')

async function taskDeleter(){
    try{
        //deleting tasks older than 90 days
        console.log("Cron Intiated")
        const age = new Date(Date.now() -  3 * 30 * 24 * 60 * 60 * 1000)
        const deletedTasks = await Task.deleteMany({ createdAt: { $lt: age } });
        console.log(`Deleted ${deletedTasks.deletedCount} old Tasks.`);

  } catch (error) {
        console.error('Error deleting old messages:', error);
  }
}
module.exports = {taskDeleter}