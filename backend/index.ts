import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Configure CORS for Express and Socket.IO
app.use(cors());

const io = new Server(httpServer, {
  cors: {
    origin: '*', // Adjust this in production
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Server is running');
});

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // Example event listener
  socket.on('message', (data) => {
    console.log('Received message:', data);
    // Broadcast the message to all other clients
    socket.broadcast.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
