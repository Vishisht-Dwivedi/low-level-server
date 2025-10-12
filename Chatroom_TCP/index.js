import net from "node:net";
const PORT = 8124;

// username: socket
const clients = new Map();
// roomname: Set(sockets)
const rooms = new Map();

const server = net.createServer((socket) => {
    socket.write("Hello!! Welcome to chat room!\n");
    const state = {
        username: null,
        roomname: null,
        step: "username",
        socket,
    };

    let dataBuffer = Buffer.alloc(0);
    socket.write("Please enter your username: ");

    socket.on("data", (data) => {
        dataBuffer = Buffer.concat([dataBuffer, data]);
        let newlineIndex = dataBuffer.indexOf(0x0A);

        while (newlineIndex !== -1) {
            const messageLine = dataBuffer.subarray(0, newlineIndex).toString().trim();
            dataBuffer = dataBuffer.subarray(newlineIndex + 1);
            handleLine(messageLine, state);
            newlineIndex = dataBuffer.indexOf(0x0A);
        }
    });

    socket.on("end", () => {
        if (state.username) {
            clients.delete(socket);
            if (state.roomname && rooms.has(state.roomname)) {
                rooms.get(state.roomname).delete(socket);
                if (rooms.get(state.roomname).size === 0)
                    rooms.delete(state.roomname);
            }
        }
    });
});
const commands = ["/help", "/rooms", "/clients", "/leave"];
function handleLine(messageLine, state) {
    const { socket } = state;

    switch (state.step) {
        case "username":
            if ([...clients.values()].some(u => u.username === messageLine)) {
                socket.write(`Username "${messageLine}" is already taken, try again:\n`);
                return;
            }
            state.username = messageLine;
            clients.set(socket, { username: state.username, room: null });
            socket.write(`\nHi ${state.username}! Enter room name or create a new one: `);
            state.step = "roomname";
            break;

        case "roomname":
            state.roomname = messageLine || "Lobby";
            joinRoom(state.roomname, state);
            state.step = "chat";
            socket.write(`\nYou joined ${state.roomname}! Start chatting:\n`);
            break;
        case "chat":
            if (commands.includes(messageLine)) {
                handleCommands(messageLine, state);
            } else {
                broadcast(state.roomname, `${state.username}: ${messageLine}`, socket);
            }
            break;
    }
}

function joinRoom(roomname, state) {
    if (!rooms.has(roomname)) rooms.set(roomname, new Set());
    rooms.get(roomname).add(state.socket);
    const userData = clients.get(state.socket);
    userData.room = roomname;
    state.socket.write(`Successfully joined the room: ${roomname}\n`);
}

function broadcast(roomname, message, senderSocket) {
    const room = rooms.get(roomname);
    if (!room) return;
    for (const client of room) {
        if (client !== senderSocket) {
            client.write(message + "\n");
        }
    }
}

function handleCommands(command, state) {
    switch (command) {
        case "/help":
            state.socket.write("/rooms : Get a list of all rooms\n/clients : Get a list of all active clients\n/leave : Leave the room");
            break;
        case "/rooms":
            for (const room of rooms.keys()) {
                state.socket.write(room);
                state.socket.write("\t");
            }
            state.socket.write("\n");
            break;
        case "/clients":
            for (const client of clients.values()) {
                state.socket.write(client.username);
                state.socket.write("\t");
            }
            state.socket.write("\n");
            break;
        case "/leave":
            broadcast(state.roomname, `${state.username} disconnected.`, state.socket);
            state.socket.write("Terminating Connection... We'll miss you!");
            state.socket.end();
            break;
    }
}

server.listen(PORT, () => {
    console.log("Server set up on port:", PORT);
});
