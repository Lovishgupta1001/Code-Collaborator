require('dotenv').config();

const express = require('express');
const path = require('path');
const http = require('http');

const Data = require('./models/roomDetails');
const connectDB = require('./db/connect');
const roomRoute = require('./routes/room');

const app = express();
var cors = require('cors');
app.use(cors())
app.use(express.static(path.resolve("")));
app.use('/api', roomRoute);
const server = http.createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log("socket is connected");
    socket.on("join-room", async (roomName) => {
        socket.join(roomName);
        console.log(`A user requested to join room with roomName ${roomName}`);
    })

    // Accepting update from a client.
    socket.on("coding", (e) => {
        const roomName = e.room;
        // Sending accepted update to all the clients
        io.to(roomName).emit("coding", e);
    })

    // saving Room
    socket.on("saveRoom", async (e) => {
        try {
            await Data.updateOne({ _id: e.room }, { HtmlData: e.html, CssData: e.css, JavaScriptData: e.js });
        }
        catch (err) {
            console.log("Unable to update the file : ", err);
        }
    })
})

// Connecting to Database
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL);
        console.log("MONGODB is connected");
        server.listen(process.env.PORT, () => {
            console.log(`server is listening at port ${process.env.PORT}`);
        })
    }
    catch (error) {
        console.log(error);
    }
}
start();

