const express = require('express');
const mongoose = require('mongoose');
const app = express();



app.get('/', (req, res) => {
    res.send("Hello from Node API Server");
});


mongoose.connect("mongodb+srv://oskarbayy:MvbNfgvsAkk1TNy9@petsdb.dyezw73.mongodb.net/Node-API?retryWrites=true&w=majority&appName=PetsDB")
.then(() => {
    console.log("Connected to database!");
    app.listen(4000, () => {
        console.log("Server is running on port 4000");
    });
})
.catch(() => {
    console.log("Connection Failed!");
})