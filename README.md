JavaScript OPC UA client that connects to a server using the OPC UA communication protocol.  
The client subscribes to the server and continuously monitors a temperature sensor's value.  
Whenever the value changes, the new value is logged to the console and saved to a PostgreSQL database.  
The code uses the "node-opcua" and "os" libraries to implement the OPC UA client and obtain the hostname of the device running the code.  

Use: [Simulation of a PLC server that uses the OPC UA  ](https://github.com/iliareshetov/node-opcua-server)  
