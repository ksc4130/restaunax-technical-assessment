import { PrismaClient } from "@prisma/client";
import { Injectable } from "@tsed/di";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: process.env.NODE_ENV !== "production" ? ["query", "info", "warn", "error"] : ["error"]
    });
  }

  async $onInit() {
    await this.$connect();
    console.log("Prisma database connection initialized");
  }

  async $onDestroy() {
    await this.$disconnect();
    console.log("Prisma database connection closed");
  }
}
