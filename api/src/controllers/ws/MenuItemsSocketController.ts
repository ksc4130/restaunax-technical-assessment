import { Inject, Injectable } from "@tsed/di";
import { Args, Input, IO, Namespace, Server, Socket, SocketService, SocketSession } from "@tsed/socketio";

@SocketService("/menu-items")
@Injectable()
export class MenuItemsSocketController {
  constructor(@IO private io: Server) {
    console.log("✅ MenuItemsSocketController instantiated with namespace");
  }

  $onConnection(@Socket socket: Socket, @SocketSession session: SocketSession): void {
    console.log("Client connected to menu-items namespace");
  }

  $onDisconnect(@Socket socket: Socket): void {
    console.log("Client disconnected from menu-items namespace");
  }

  emitMenuItemCreated(menuItem: any): void {
    this.io.of("/menu-items").emit("menuItem:created", menuItem);
    console.log(`Emitted menuItem:created event for menu item ID ${menuItem.id}`);
  }

  emitMenuItemUpdated(menuItem: any): void {
    this.io.of("/menu-items").emit("menuItem:updated", menuItem);
    console.log(`Emitted menuItem:updated event for menu item ID ${menuItem.id}`);
  }

  emitMenuItemDeleted(id: number): void {
    this.io.of("/menu-items").emit("menuItem:deleted", { id });
    console.log(`Emitted menuItem:deleted event for menu item ID ${id}`);
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
