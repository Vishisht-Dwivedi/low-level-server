import dgram from "node:dgram";
const socket = dgram.createSocket("udp4");
socket.on("listening", () => {
    console.log("Listening on port 8081");
})
socket.on("message", (msg, rinfo) => {
    console.log(msg);
})
socket.bind(8081);