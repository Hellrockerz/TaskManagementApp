const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobileNo: {
        type: Number,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCKED", "DELETED",],
        default: "ACTIVE",
    },
},

    { timestamps: true });

userSchema.plugin(mongoosePaginate);
const User = mongoose.model('User', userSchema);

module.exports = User;

