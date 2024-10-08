import pkg from 'socket.io';


function configureSocketServer(server) {
    const io = new pkg(server, {
        cors: {
            origin: "wss://velhodalancha.onrender.com",
            methods: ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"],
        }
    });

    io.on('connection', (socket) => {
        console.log('Um cliente se conectou:', socket.id);
        
        socket.on('disconnect', () => {
            console.log('Um cliente se desconectou:', socket.id);
        });
    });

    return io;
}

export default configureSocketServer;
