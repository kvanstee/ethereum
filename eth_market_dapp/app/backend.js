/*! require("source-map-support").install(); */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/javascripts/server.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/javascripts/server.js":
/*!***********************************!*\
  !*** ./src/javascripts/server.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var  express = __webpack_require__(/*! express */ \"express\"),\n     app = express(),\n     socketIO = __webpack_require__(/*! socket.io */ \"socket.io\"),\n     //http = require('http'),\n     //crypto = require('crypto'),\n     //key = \"ladkfjeoijiejoef9878euofjopd6y7e452vjl\",\n     server = __webpack_require__(/*! http */ \"http\").createServer(app),\n     io = socketIO(server);\n\nvar generateMessage = function(from, text){\n    return {\n        from,\n        text\n    };\n};\nvar isRealString = function(str) {\n    return typeof str === 'string' && str.trim().length > 0;\n};\nvar users = [];\nfunction addUser(id, name, room){\n    var user = {id, name, room};\n    users.push(user);\n    return user;\n};\nfunction removeUser(id){\n    var user = getUser(id);\n    if(user){\n        users = users.filter((user) => user.id !== id);\n    };\n    return user;\n};\nfunction getUser(id){\n    return users.filter((user) => user.id === id)[0]\n};\nfunction getUserByName(name){\n    return users.filter((user) => user.name === name)[0]\n};\nfunction getUserList(room){\n    var _users = users.filter((user) => user.room === room);\n    var namesArray = _users.map((user) => user.name);\n    return namesArray;\n};\nvar port = process.env.PORT || 8080;\n\napp.use(express.static('app/public'));\n\nio.on('connection', function(socket){\n    console.log('New user connected');\n\n    socket.on('join', function(params, callback){\n        var prev_user = getUser(socket.id);\n        if (prev_user) {//previously in another room/currency\n          users = users.filter((user) => user.id !== prev_user.id);\n          io.to(prev_user.room).emit('updateUserList', getUserList(prev_user.room));\n          socket.broadcast.to(prev_user.room).emit('newMessage', generateMessage('Admin',  `${prev_user.name} has left`));\n          socket.leave(prev_user.room);\n        }\n        socket.join(params.curr);\n        addUser(socket.id, params.account, params.curr);\n        io.to(params.curr).emit('updateUserList', getUserList(params.curr));\n        socket.emit('newMessage', generateMessage('Admin', 'Welcome to eth trading with ' + params.curr + '. Click on row to interact or add new contract.'));\n        socket.broadcast.to(params.curr).emit('newMessage', generateMessage('Admin',  `${params.account} joined`));\n\n        callback();\n    });\n\n    socket.on('createMessage', function(message, callback) {\n        var sender = getUser(socket.id);\n\tvar receiver = getUserByName(message.to);\n        //var enc = crypto.createCipher(\"aes-256-ctr\", key).update(message.text, \"utf-8\", \"hex\");\n        //var dec = crypto.createDecipher(\"aes-256-ctr\", key).update(enc, \"hex\", \"utf-8\");\n        if(sender && isRealString(message.text)){\n       \t    if(receiver){\n\t        io.to(receiver.id).emit('newMessage', generateMessage(sender.name, message.text/*dec*/));\n\t\tsocket.emit('newMessage', generateMessage(sender.name,message.text/*dec*/));\n            } else if(!isRealString(message.to)) io.to(sender.room).emit('newMessage', generateMessage(sender.name, message.text/*dec*/));\n        }\n\n        callback();\n    });\n\n    socket.on('disconnect', function(){\n        var user = removeUser(socket.id);\n\n        if(user){\n            io.to(user.room).emit('updateUserList', getUserList(user.room));\n            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));\n        }\n    });\n});\n\n\nserver.listen(port, function(){\n    console.log(`Server running on ${port}`);\n});\n\n\n//# sourceURL=webpack:///./src/javascripts/server.js?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"http\");\n\n//# sourceURL=webpack:///external_%22http%22?");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"socket.io\");\n\n//# sourceURL=webpack:///external_%22socket.io%22?");

/***/ })

/******/ });