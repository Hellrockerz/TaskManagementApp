const User = require('./models/userModel')
const Task = require('./models/taskModel')

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')
const tokenGenerator = require('./auth').tokenGenerator

const secretKey = "secretkey";
async function signup(req, res) {
    const { firstName, lastName, email, mobileNo, password, cPassword } = req.body
    let m = mobileNo.toString();
    const username = firstName.toLowerCase() + m.slice(-4); //Auto Generating username with first 4 letters of firstName and last 4 digits of Mobile Number.

    const mail = await User.findOne({
        email: email,
        status: "ACTIVE",
    });
    const number = await User.findOne({
        mobileNo: mobileNo,
        status: "ACTIVE",
    });
    const mailAndNumber = await User.findOne({
        email: email,
        mobileNo: mobileNo,
        status: "ACTIVE",
    });

    try {
        if (mail || number) {
            return res.status(201).json({ message: "User Already Exists" });
        }
        if (!mail && !number) {
            if (password == cPassword) {
                const hashedPassword = await bcrypt.hash(password, 10);
                const newUser = new User({
                    firstName,
                    lastName,
                    username,
                    password: hashedPassword,
                    email,
                    mobileNo,
                });

                await newUser.save();
                console.log(newUser)
                return res.status(201).json({ message: "Signed Up Successfully", data: newUser });
            } else {
                return res.status(403).json({ message: "Password and Confirm Password Must Be The Same." });
            }
        } else if ((mail && !number) || (mail && mail.mobileNo != mobileNo)) {
            return res.status(401).json({ message: "Enter Correct Number associated with the Email" });
        } else if ((!mail && number) || (number && number.email != email)) {
            return res.status(402).json({ message: "Enter Correct Email associated with the Number." });
        } else {
            return res.status(403).json({ message: "Password and Confirm Password must be the same" });
        }
    }
    catch (error) {
        console.error("Error saving user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }

}

async function login(req, res) {
    try {
        const { username, email, password } = req.body;
        const data = await User.findOne({ email, status: "ACTIVE" } || { username, status: "ACTIVE" });

        if (!data) {
            return res.status(404).json({ message: "User not found" });
        }
        const correct = await bcrypt.compare(password, data.password)
        if (correct) {
            return tokenGenerator(res, data);
        }
        return res.status(404).json({ message: "Incorrect Password" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function createTask(req, res) {

    const Id = req.user.id;
    const data = await User.findOne({ _id: Id })
    if (!data) {
        return res.status(404).json({ message: "User does not Exist" })
    }
    try {
        const { name, description, assignedUser, dueDate, completionStatus } = req.body
        //enter the date in dd/mm/yyyy format.
        const isoDueDate = new Date(dueDate.split('/').reverse().join('-')).toISOString();

        const nonExistingUsers = [];
        const existingUsrs = [];

        for (const identifier of assignedUser) {
            let user;
            if (mongoose.Types.ObjectId.isValid(identifier)) {
                user = await User.findOne({ _id: identifier });
            } else {
                user = await User.findOne({ username: identifier });
            }

            if (!user) {
                nonExistingUsers.push(identifier);
            } else {
                existingUsrs.push(user._id);
            }
        }

        if (nonExistingUsers.length > 0) {
            return res.status(404).json({ message: "Assigned users do not exist", nonExistingUsers });
        }

        const newTask = new Task({
            name,
            description,
            assignedUser: existingUsrs,
            dueDate: isoDueDate,
            completionStatus
        });
        const savedTask = await newTask.save()

        res.status(201).json({
            message: 'Task created successfully',
            task: newTask
        });
    } catch (error) {
        console.error("Error saving user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getTaksList(req, res) {
    const Id = req.user.id;
    const data = await User.findOne({ _id: Id })
    if (!data) {
        return res.status(404).json({ message: "User does not Exist" })
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const options = {
            page,
            limit,
            populate: {
                path: 'assignedUser',
                select: 'username email'
            }
        };
        const result = await Task.paginate({ status: "EXIST" }, options)
        const task = result.docs.map((i) => ({
            _id: i._id,
            name: i.name,
            description: i.description,
            assignedTo: i.assignedUser,
            completionStatus: i.completionStatus,
            status: i.status
        }))
        const pageInfo = {
            total: result.totalDocs,
            currentPage: result.page,
            perPage: result.limit,
            totalPages: result.pagingCounter,
        };
        return res.status(200).json({ message: task, pageInfo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
async function getTaskById(req, res) {
    const Id = req.user.id;
    const data = await User.findOne({ _id: Id, status: "ACTIVE" })
    if (!data) {
        return res.status(404).json({ message: "User does not Exist" })
    }
    try {
        const { id } = req.body
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const options = {
            page,
            limit,
            populate: {
                path: 'assignedUser',
                select: 'username email'
            }
        };
        const result = await Task.paginate({ _id: id }, options)
        const task = result.docs.map((i) => ({
            _id: i._id,
            name: i.name,
            description: i.description,
            assignedTo: i.assignedUser,
            completionStatus: i.completionStatus,
        }))
        const pageInfo = {
            total: result.totalDocs,
            currentPage: result.page,
            perPage: result.limit,
            totalPages: result.pagingCounter,
        };
        return res.status(200).json({ message: task, pageInfo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
async function updateTaskById(req, res) {
    const Id = req.user.id;
    const data = await User.findOne({ _id: Id, status: "ACTIVE" })
    if (!data) {
        return res.status(404).json({ message: "User does not Exist" })
    }
    try {
        const { taskId, name, description, dueDate, assignedUser, isCompleted } = req.body
        const task = await Task.findOne({ _id: taskId })
        if (task) {
            if (isCompleted) {
                const completed = isCompleted.toLowerCase() == "true" || "yes"
                if (completed) {
                    const update = await Task.findByIdAndUpdate({ _id: taskId },
                        {
                            $set: {
                                name: name,
                                description: description,
                                dueDate: dueDate,
                                assignedUser: assignedUser,
                                completionStatus: "COMPLETED",
                                completedAt: new Date()
                            }
                        },
                        { new: true })
                    return res.status(404).json({ message: "Task Updated", update })
                }
            } else {
                const update = await Task.findByIdAndUpdate({ _id: taskId },
                    {
                        $set: {
                            name: name,
                            description: description,
                            dueDate: dueDate,
                            assignedUser: assignedUser,
                            completionStatus: "PENDING"
                        }
                    },
                    { new: true })
                return res.status(201).json({ message: "Task Updated", update })
            }
        } else {
            return res.status(404).json({ message: "Specified Task Does Not Exist" })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
async function deleteTask(req, res) {
    const Id = req.user.id;
    const data = await User.findOne({ _id: Id, status: "EXIST" })
    if (!data) {
        return res.status(404).json({ message: "User does not Exist" })
    }
    try {
        const { taskId } = req.body
        const task = await Task.findOne({ _id: taskId })
        if (task) {
            await Task.findByIdAndUpdate({ _id: taskId },
                {
                    $set: {
                        status: "DELETED"
                    }
                },
                { new: true })
        } else {
            return res.status(404).json({ message: "Specified Task Does Not Exist" })
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
async function statistics(req, res) {
    const Id = req.user.id;
    const data = await User.findOne({ _id: Id, status: "ACTIVE" })
    if (!data) {
        return res.status(404).json({ message: "User does not Exist" })
    }
    try {
        const distinctUsers = await Task.distinct('assignedUser');
        const totalAssignedUsers = distinctUsers.length;
        const totalTasks = await Task.countDocuments();
        const totalComplteedTasks = await Task.countDocuments({ completionStatus: "COMPLETED" })
        const timeLimit = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        

        const totalCompletedTasks = await Task.countDocuments({
            completedAt: { $gte: timeLimit },
        });
        return res.status(404).json({
            message: {
                "Total Number of AssignedUser": totalAssignedUsers,
                "Total Number of Tasks": totalTasks,
                "Total Number of Completed Tasks": totalComplteedTasks,
                'Number of completed tasks in the last 7 days': totalCompletedTasks
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
module.exports = { signup, login, createTask, getTaksList, getTaskById, updateTaskById, deleteTask, statistics }