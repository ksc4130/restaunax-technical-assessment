import { Inject, Injectable } from "@tsed/di";
import { Args, Input, IO, Namespace, Server, Socket, SocketService, SocketSession } from "@tsed/socketio";

@SocketService("/orders")
@Injectable()
export class OrdersSocketController {
  constructor(@IO private io: Server) {
    console.log("✅ OrdersSocketController instantiated with namespace");
  }

  $onConnection(@Socket socket: Socket, @SocketSession session: SocketSession): void {
    console.log("Client connected to orders namespace");
  }

  $onDisconnect(@Socket socket: Socket): void {
    console.log("Client disconnected from orders namespace");
  }

  emitOrderCreated(order: any): void {
    this.io.of("/orders").emit("order:created", order);
    console.log(`Emitted order:created event for order ID ${order.id}`);
  }

  emitOrderUpdated(order: any): void {
    this.io.of("/orders").emit("order:updated", order);
    console.log(`Emitted order:updated event for order ID ${order.id}`);
  }

  emitOrderDeleted(id: number): void {
    this.io.of("/orders").emit("order:deleted", { id });
    console.log(`Emitted order:deleted event for order ID ${id}`);
  }

  emitToClient(socket: Socket, event: string, data: any): void {
    socket.emit(event, data);
    console.log(`Emitted ${event} event to client ${socket.id}`);
  }

  emitToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
    console.log(`Emitted ${event} event to room ${room}`);
  }

  joinRoom(socket: Socket, room: string): void {
    socket.join(room);
    console.log(`Client ${socket.id} joined room ${room}`);
  }

  leaveRoom(socket: Socket, room: string): void {
    socket.leave(room);
    console.log(`Client ${socket.id} left room ${room}`);
  }
}
