# NodeTempANT
This is a Node.js project which stores in real-time ANT+ sensor data in MongoDB while keeping temporal values in the sub-documents.

#Idea
The idea is based upon storing the <a href="www.thisisant.com">ANT+ sensor</a>data (such as from ANT Heart rate monitor, temperature or footpod monitor). This node server will expose the <a href="http://socket.io">Socket.IO </a> (based upon WebSockets) interface to openup a permanent connection with the client, and the socket.io client will send the JSON data objects along the events periodically through the <a href="http://mongoosejs.com">Mongoose ORM </a> for permanent storage. The client-server uses an event-driven architecture. Upon each different event the server behaves separately based upon a document-per-hour storage technique, as described in the online blog : <a href="https://www.mongodb.com/blog/post/schema-design-for-time-series-data-in-mongodb">"Schema Design for Time Series Data in MongoDB"</a>


#Dependencies
<ol>
  <li><a href="http://mongoosejs.com">Mongoose ORM </a></li>
  <li>MongoDB</li>
  <li>Node.js</li>
  <li><a href="http://socket.io">Socket.IO </a> (based upon WebSockets)</li>
</ol>


#Package.json
{
  "main": "server.js",<br>
  "dependencies": {<br>
    "body-parser": "^1.14.1",<br>
    "debug": "~0.7.2",<br>
    "email-validator": "~0.1.2",<br>
    "express": "~3.4.4",<br>
    "express-mongoose": "^0.1.0",<br>
    "moment": "^2.10.6",<br>
    "mongoose": "^4.2.10",<br>
    "socket.io": "~0.9.16",<br>
    "socket.io-wildcard": "~0.1.1"<br>
  },<br>
  "devDependencies": {<br>
    "grunt": "~0.4.1",<br>
    "grunt-contrib-jshint": "~0.6.4"<br>
  }
}

#How to Run


#.Net Client Configurations to send JSON messages with events

Console.WriteLine("Starting SocketIO4Net Client Events...");<br>
// url to the nodejs / socket.io instance<br>
url = "http://localhost:3002";<br>
SocketClient = new Client(url);<br>
SocketClient.Opened += SocketOpened;<br>
SocketClient.Message += SocketMessage;<br>
SocketClient.SocketConnectionClosed += SocketConnectionClosed;<br>
SocketClient.Error += SocketError;<br>
//register for 'connect' event with io server<br>
SocketClient.On("connect", (fn) =><br>
               {   Patient User = new Patient
                    {             
                    EmailID   = "Ben@oicts.com",
                    FirstName = "Benjamen",
                    LastName  = "Claren",
                    Age       = 65,
                    Weight    = 75 
                    };<br>
                   SocketClient.Emit("register", User.ToJsonString());<br>
                });<br>
