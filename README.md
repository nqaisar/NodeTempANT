# NodeTempANT
This is a Node.js project which stores in real-time ANT+ sensor data in MongoDB while keeping temporal values in the sub-documents.

#Idea
The idea is based upon storing the <a href="www.thisisant.com">ANT+ sensor</a>data (such as from ANT Heart rate monitor, temperature or footpod monitor). This node server will expose the <a href="http://socket.io">Socket.IO </a> (based upon WebSockets) interface to openup a permanent connection with the client, and the socket.io client will send the JSON data objects along the events periodically through the <a href="http://mongoosejs.com">Mongoose ORM </a> for permanent storage. The client-server uses an event-driven architecture. Upon each different event the server behaves separately based upon a document-per-hour storage technique, as described in the online blog : <a href="https://www.mongodb.com/blog/post/schema-design-for-time-series-data-in-mongodb">"Schema Design for Time Series Data in MongoDB"</a>


#Dependencies
<ol>
  <li><a href="http://socket.io">Socket.IO </a> (based upon WebSockets)</li>
  <li><a href="http://mongoosejs.com">Mongoose ORM </a></li>
  <li>MongoDB</li>
  <li>Node.js</li>
</ol>



#Package.json
{
  "name": "SocketIO4Net-Test-Server",
  "author": "J. Stott",
  "version": "0.0.3",
  "description": "Simple server to demonstrate SocketIO4Net.Client connectivity",
  "homepage": "http://socketio4net.codeplex.com/",
  "main": "server.js",
  "dependencies": {
    "body-parser": "^1.14.1",
    "debug": "~0.7.2",
    "email-validator": "~0.1.2",
    "express": "~3.4.4",
    "express-mongoose": "^0.1.0",
    "moment": "^2.10.6",
    "mongoose": "^4.2.10",
    "socket.io": "~0.9.16",
    "socket.io-wildcard": "~0.1.1"
  },
  "devDependencies": {
    "grunt": "~0.4.1",
    "grunt-contrib-jshint": "~0.6.4"
  }
}
