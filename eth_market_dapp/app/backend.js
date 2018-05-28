/*! require("source-map-support").install(); */!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},n.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=3)}([function(e,t){e.exports=require("http")},function(e,t){e.exports=require("socket.io")},function(e,t){e.exports=require("express")},function(e,t,n){var r=n(2),o=r(),i=n(1),c=n(0).createServer(o),u=i(c),a=function(e,t){return{from:e,text:t}},s=function(e){return"string"==typeof e&&e.trim().length>0},m=[];function f(e){return m.filter(t=>t.id===e)[0]}function d(e){return m.filter(t=>t.room===e).map(e=>e.name)}var l=process.env.PORT||8080;o.use(r.static("app/public")),u.on("connection",function(e){console.log("New user connected"),e.on("join",function(t,n){var r,o,i,c,s=f(e.id);s&&(m=m.filter(e=>e.id!==s.id),u.to(s.room).emit("updateUserList",d(s.room)),e.broadcast.to(s.room).emit("newMessage",a("Admin",`${s.name} has left`)),e.leave(s.room)),e.join(t.curr),r=e.id,o=t.account,i=t.curr,c={id:r,name:o,room:i},m.push(c),u.to(t.curr).emit("updateUserList",d(t.curr)),e.emit("newMessage",a("Admin","Welcome to eth trading with "+t.curr+". Click on row to interact or add new contract.")),e.broadcast.to(t.curr).emit("newMessage",a("Admin",`${t.account} joined`)),n()}),e.on("createMessage",function(t,n){var r,o=f(e.id),i=(r=t.to,m.filter(e=>e.name===r)[0]);o&&s(t.text)&&(i?(u.to(i.id).emit("newMessage",a(o.name,t.text)),e.emit("newMessage",a(o.name,t.text))):s(t.to)||u.to(o.room).emit("newMessage",a(o.name,t.text))),n()}),e.on("disconnect",function(){var t=function(e){var t=f(e);return t&&(m=m.filter(t=>t.id!==e)),t}(e.id);t&&(u.to(t.room).emit("updateUserList",d(t.room)),u.to(t.room).emit("newMessage",a("Admin",`${t.name} has left`)))})}),c.listen(l,function(){console.log(`Server running on ${l}`)})}]);