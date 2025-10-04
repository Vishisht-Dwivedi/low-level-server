import net from "node:net";
const server = net.createServer();
server.listen(3000, () => {
    console.log("Server listening on port 3000");
});
server.on("connection", (socket) => {
    console.log("Connection established");
    console.log(`Client connected from ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on("data", (chunk) => {
        console.log("Received data:", chunk.toString());
        socket.write(`You said: ${chunk}`);
    });
    socket.on("error", (err) => {
        console.log("Socket error:", err);
    });
    socket.on("close", () => {
        console.log(`Client ${socket.remoteAddress}:${socket.remotePort} disconnected`);
    });
});
server.on("close", () => {
    console.log("Server closed");
});
