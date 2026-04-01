import { Socket } from "socket.io";

export const handleSocketConnection = (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-document", (documentId) => {
    socket.join(documentId);
    console.log(`User ${socket.id} joined document ${documentId}`);
  });

  socket.on("leave-document", (documentId) => {
    socket.leave(documentId);
  });

  socket.on("document:update", ({ documentId, content, title }) => {
    socket.to(documentId).emit("document:update", { content, title });
  });

  socket.on("document:typing", ({ documentId, user }) => {
    socket.to(documentId).emit("document:typing", { user });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};
