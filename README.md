# NodeTempANT
This is a Node.js project which stores in real-time ANT+ sensor data in MongoDB while keeping temporal values in the sub-documents.

#Idea
The idea is based upon storing the ANT+ sensor data (such as from ANT Heart rate monitor, temperature or footpod monitor). This node server will expose the WebSockets interface to openup a permanent connection with the client, and the socket.io client will send the JSON data objects along the events periodically through the Mongoose ORM for permanent storage. The client-server uses an event-driven architecture. Upon each different event the server behaves separately based upon a document-per-hour storage technique, as described in the online blog : "Schema Design for Time Series Data in MongoDB"
