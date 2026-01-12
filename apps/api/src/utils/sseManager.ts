import { Response } from "express";

type FeedEvent = {
  event: string;
  data: any;
};

class SSEManager {
  private clients: Map<string, Response[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor() {
    // Send a heartbeat every 30 seconds to keep connections alive
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000);
  }

  addClient(courseId: string, res: Response) {
    if (!this.clients.has(courseId)) {
      this.clients.set(courseId, []);
    }
    const courseClients = this.clients.get(courseId)!;
    courseClients.push(res);

    // Send initial ping to establish connection immediately
    res.write(": connected\n\n");

    // Remove client on close
    res.on("close", () => {
      this.removeClient(courseId, res);
    });
  }

  removeClient(courseId: string, res: Response) {
    const courseClients = this.clients.get(courseId);
    if (courseClients) {
      this.clients.set(
        courseId,
        courseClients.filter((client) => client !== res)
      );
    }
  }

  broadcast(courseId: string, event: string, data: any) {
    const courseClients = this.clients.get(courseId);
    if (courseClients) {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      courseClients.forEach((client) => {
        client.write(message);
      });
    }
  }

  private sendHeartbeat() {
    this.clients.forEach((clients, courseId) => {
      clients.forEach((client) => {
        client.write(": heartbeat\n\n");
      });
    });
  }
}

export const sseManager = new SSEManager();
