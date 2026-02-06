const http = require("node:http");
const fs = require("fs");
const WebSocket = require("ws");

const server = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync("index.html"));
    }
});

const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (ws) => {

    if (clients.length === 0) {
        ws.send(JSON.stringify({ role: "caller" }));
        console.log("Caller joined");
    } else {
        ws.send(JSON.stringify({ role: "callee" }));
        console.log("Callee joined");
    }

    clients.push(ws);

    ws.on("message", msg => {
        clients.forEach(c => {
            if (c !== ws && c.readyState === WebSocket.OPEN) {
                c.send(msg.toString());
            }
        });
    });

    ws.on("close", () => {
        clients = clients.filter(c => c !== ws);
    });

});

server.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
});
