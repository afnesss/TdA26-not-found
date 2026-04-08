import { Response } from "express";
import type { Locale } from "../schemas";

type FeedEvent = {
  event: string;
  data: any;
};

type SseClient = {
  res: Response;
  locale: Locale;
};

class SSEManager {
  private clients: Map<string, SseClient[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor() {
    // Send a heartbeat every 30 seconds to keep connections alive
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000);
  }

  addClient(courseId: string, res: Response, locale: Locale = "en") {
    if (!this.clients.has(courseId)) {
      this.clients.set(courseId, []);
    }
    const courseClients = this.clients.get(courseId)!;
    courseClients.push({ res, locale });

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
        courseClients.filter((client) => client.res !== res)
      );
    }
  }

  broadcast(
    courseId: string,
    event: string,
    data: any,
    localize?: (data: any, locale: Locale) => any,
  ) {
    const courseClients = this.clients.get(courseId);
    if (courseClients) {
      courseClients.forEach((client) => {
        const payload = localize ? localize(data, client.locale) : data;
        const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
        client.res.write(message);
      });
    }
  }

  private sendHeartbeat() {
    this.clients.forEach((clients) => {
      clients.forEach((client) => {
        client.res.write(": heartbeat\n\n");
      });
    });
  }
}

export const sseManager = new SSEManager();
