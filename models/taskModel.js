const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const taskSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String, 
    },
    assignedUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',      
    }],
    dueDate: {
        type: Date,
        required: true
    },
    completionStatus: {
        type: String,
        enum: ["COMPLETED", "PENDING"],
        default: "PENDING"
    },
    completedAt: {
        type: Date,
        default: null,
    },
    status:{
        type: String,
        enum: ["EXIST", "DELETED"],
        default: "EXIST"
    }
},

    { timestamps: true });

taskSchema.plugin(mongoosePaginate);
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

