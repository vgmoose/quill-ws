var express = require('express');
var app = express();
var mongojs = require("mongojs");
var server = require('http').Server(app);
var io = require('socket.io').listen(server);


var uri = "localhost",
    db = mongojs.connect(uri, ["proxi"]);

server.listen(80);

app.use(express.static(process.cwd() + '/'));

counter = 0;

function getAllNearbyPeople(socket)
{
    console.log("Finding people near " + socket.id + " at " + socket.lat + ", " + socket.long);
    var ids = [];
    
    for (x in smatrix)
    {
        console.log("Checking " + smatrix[x].id + " against " + socket.id);
        if (smatrix[x].id !== socket.id)
            if (isInCircle(socket.lat, socket.long, 1, smatrix[x].lat, smatrix[x].long, 1))
                ids.push(smatrix[x].id);
    
    }
    console.log("ID list: " + ids);
    return ids;
}

function isInCircle(x1, y1, r1, x2, y2, r2)
{
    r = r1;
    // take smaller radius
    if (r1 > r2)
        r = r2;
    
    // radius is in km, convert to long/lat
    r /= 111;
    
    // get differences in x and y
    xd = x1 - x2;
    xd *= xd;
    yd = y1 - y2;
    yd *= yd
    
    return Math.sqrt(xd + yd) < r;
}

//db.proxi.save({"counter": "red"}, function(err, records) {
//    console.log("error");
//});
//
//db.proxi.find({"color": "red"}, function(err, records) {
//    console.log(records);
//    if (err)
//        console.log("couldn't find your thing");
//    else
//        console.log("no");
//});

function newColor()
{
    return '#'+'0123456789abcdef'.split('').map(function(v,i,a){
  return i>5 ? null : a[Math.floor(Math.random()*16)] }).join('');
}

// handle incoming connections from clients
io.sockets.on('connection', function(socket)
{
    counter++;
    socket.name = "Guest"+counter;
    socket.color = newColor();
    socket.emit("init_connect", {name: socket.name, color: socket.color});
    
    socket.on("get_new_id", function(data) {
        counter += 1;
        socket.emit("assign_id", {id : counter});
        console.log("Client requested ID, sent them " + counter);
        smatrix[counter] = socket;
    });
    
    console.log("New client connected.");
    
    socket.on("set_pic", function(data) {
        console.log("Received pic: " + data);
        socket.pic = data;
    });
    
    socket.on("login", function(data) {
        console.log("Got login request from client " + data);
        socket.id = data;
        smatrix[socket.id] = socket;
        //TODO: mark this client as online
    });
    
    socket.on("set_status", function(data) {
        socket.status = data;
        socket.radius = 1;
        console.log("set " + socket.id + "'s status to " + data);
    });
    
    socket.on("set_coordinates", function(data) {
        socket.lat = data.split(" ")[0];
        socket.long = data.split(" ")[1];
        
        console.log("set " + socket.id + "'s coor to " + socket.lat + " " + socket.long);
    }); 
    
    socket.on("get_people", function(data) {
        near = getAllNearbyPeople(socket);
        returnme = []
        for (var val in near)
            returnme[val] = smatrix[near[val]];
        socket.emit("new_people", returnme);
    });
    
    socket.on("send_message", function(data) {
        var target = data.id;
        var message = data.message;
        
        socket.emit("get_message", data);
    });

    socket.on('get_move', function(data) {
//        data.id = id;
        console.log(data);
        socket.broadcast.emit('recv_move', data);
    });

    socket.on('disconnect', function(){
        counter--;
//        io.sockets.emit('drop_player', {'id' : id});
    });
});
