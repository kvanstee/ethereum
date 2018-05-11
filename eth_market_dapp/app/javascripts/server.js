var  express = require('express'),
     app = express(),
     socketIO = require('socket.io'),
     http = require('http'),
     time = require('moment')().valueOf(),
     crypto = require('crypto'),
     key = "ladkfjeoijiejoef9878euofjopd6y7e452vjl",
     server = http.createServer(app),
     io = socketIO(server);

var generateMessage = function(from, text){
    return {
        from,
        text,
        createdAt: time
    };
};
var isRealString = function(str) {
    return typeof str === 'string' && str.trim().length > 0;
};
var users = [];
function addUser(id, name, room){
    var user = {id, name, room};
    users.push(user);
    return user;
};
function removeUser(id){
    var user = getUser(id);
    if(user){
        users = users.filter((user) => user.id !== id);
    };
    return user;
};
function getUser(id){
    return users.filter((user) => user.id === id)[0]
};
function getUserByName(name){
    return users.filter((user) => user.name === name)[0]
};
function getUserList(room){
    var _users = users.filter((user) => user.room === room);
    var namesArray = _users.map((user) => user.name);
    return namesArray;
};
var port = process.env.PORT || 8080;

app.use(express.static('app'));

io.on('connection', function(socket){
    console.log('New user connected');

    socket.on('join', function(params, callback){
        var user = removeUser(socket.id);
        if (user) {
          // leave the current room (stored in session)
          socket.leave(user.curr);
          socket.broadcast.to(user.curr).emit('newMessage', generateMessage('Admin',  `${user.account} has left this room`));
        }
        socket.join(params.curr);
        addUser(socket.id, params.account, params.curr);
        io.to(params.curr).emit('updateUserList', getUserList(params.curr));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to eth trading with ' + params.curr + '. Click on row to interact or add new contract'));
        socket.broadcast.to(params.curr).emit('newMessage', generateMessage('Admin',  `${params.account} joined`));

        callback();
    });

    socket.on('createMessage', function(message, callback) {
        var sender = getUser(socket.id);
	var receiver = getUserByName(message.to);
        var enc = crypto.createCipher("aes-256-ctr", key).update(message.text, "utf-8", "hex");
        var dec = crypto.createDecipher("aes-256-ctr", key).update(enc, "hex", "utf-8");
        if(sender && isRealString(message.text)){
       	    if(receiver){
	        io.to(receiver.id).emit('newMessage', generateMessage(sender.name,dec));
		socket.emit('newMessage', generateMessage(sender.name,dec));
            } else if(!isRealString(message.to)) io.to(sender.room).emit('newMessage', generateMessage(sender.name,dec));
        }

        callback();
    });

    socket.on('disconnect', function(){
        var user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('updateUserList', getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
        }
    });
});


server.listen(port, function(){
    console.log(`Server running on ${port}`);
});
