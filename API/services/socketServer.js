// // socketServer.js
// import { Server } from 'socket.io';
// function configureSocketServer(server) {
//     const io = new Server(server, {
//         cors: {
//             origin: "https://velhodalancha.onrender.com",
//             methods: ["GET", "POST"],
//         }
//     });

//     io.on('connection', (socket) => {
//         console.log('Um cliente se conectou:', socket.id);
        
//         socket.on('disconnect', () => {
//             console.log('Um cliente se desconectou:', socket.id);
//         });
//     });

//     return io;
// }

// export default configureSocketServer;
