import { Controller, Inject } from "@tsed/di";
import { NotFound } from "@tsed/exceptions";
import { BodyParams, PathParams, QueryParams } from "@tsed/platform-params";
import { Delete, Description, Get, Groups, Post, Put, Returns, Summary } from "@tsed/schema";

import { PrismaService } from "../../services/index.js";
import { OrdersSocketController } from "../ws/OrdersSocketController.js";

@Controller("/orders")
export class OrderController {
  constructor(
    private prisma: PrismaService,
    @Inject() private ordersSocketController: OrdersSocketController
  ) {}

  @Get("/")
  @Summary("Get all orders")
  @Description("Returns a list of all orders")
  @Returns(200, Array)
  async getAllOrders(@QueryParams("status") status?: string) {
    if (status) {
      return this.prisma.order.findMany({
        where: { status },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      });
    }
    return this.prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });
  }

  @Get("/:id")
  @Summary("Get an order by ID")
  @Description("Returns a single order by its ID")
  @Returns(200)
  @(Returns(404).Description("Order not found"))
  async getOrderById(@PathParams("id") id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFound("Order not found");
    }

    return order;
  }

  @Post("/")
  @Summary("Create a new order")
  @Description("Creates a new order and returns it")
  @Returns(201)
  async createOrder(
    @BodyParams()
    @Groups("creation")
    data: {
      customer: string;
      address: string;
      type?: string;
      promotionCode?: string;
      deliveryFee?: number;
      userId?: number;
      items: Array<{
        menuItemId: number;
        quantity: number;
        price: number;
      }>;
    }
  ) {
    // Calculate total based on items
    const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = data.deliveryFee || 0;
    const finalTotal = total + deliveryFee;

    // Create the order with items in a transaction
    const order = await this.prisma.$transaction(async (tx: PrismaService) => {
      // Create the order
      const createdOrder = await tx.order.create({
        data: {
          customer: data.customer,
          address: data.address,
          type: data.type || "Delivery",
          total: finalTotal,
          deliveryFee: data.deliveryFee,
          promotionCode: data.promotionCode,
          userId: data.userId,
          orderItems: {
            create: data.items.map((item) => ({
              quantity: item.quantity,
              price: item.price,
              menuItemId: item.menuItemId
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      });

      return createdOrder;
    });

    // Emit event for new order
    this.ordersSocketController.emitOrderCreated(order);
    return order;
  }

  @Put("/:id")
  @Summary("Update an order")
  @Description("Updates an existing order and returns it")
  @Returns(200)
  @(Returns(404).Description("Order not found"))
  async updateOrder(
    @PathParams("id") id: number,
    @BodyParams()
    @Groups("update")
    data: {
      customer?: string;
      status?: string;
      type?: string;
      address?: string;
      promotionCode?: string;
      deliveryFee?: number;
    }
  ) {
    // Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      throw new NotFound("Order not found");
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data,
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });
    // Emit event for updated order
    this.ordersSocketController.emitOrderUpdated(updatedOrder);
    return updatedOrder;
  }

  @Delete("/:id")
  @Summary("Delete an order")
  @Description("Deletes an order by its ID")
  @(Returns(204).Description("Order successfully deleted"))
  @(Returns(404).Description("Order not found"))
  async deleteOrder(@PathParams("id") id: number) {
    // Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      throw new NotFound("Order not found");
    }

    // Delete the order (cascade will handle order items)
    await this.prisma.order.delete({
      where: { id }
    });
    // Emit event for deleted order
    this.ordersSocketController.emitOrderDeleted(id);
    return null;
  }

  @Get("/user/:userId")
  @Summary("Get orders by user ID")
  @Description("Returns a list of orders for a specific user")
  @Returns(200, Array)
  async getOrdersByUserId(@PathParams("userId") userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  @Post("/:id/items")
  @Summary("Add items to an order")
  @Description("Adds new items to an existing order")
  @Returns(200)
  @(Returns(404).Description("Order not found"))
  async addItemsToOrder(
    @PathParams("id") id: number,
    @BodyParams()
    items: Array<{
      menuItemId: number;
      quantity: number;
      price: number;
    }>
  ) {
    // Use a transaction to ensure all operations succeed or fail together
    return this.prisma.$transaction(async (tx: PrismaService) => {
      // Check if order exists
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          orderItems: true
        }
      });

      if (!order) {
        throw new NotFound("Order not found");
      }

      // Calculate additional total
      const additionalTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newTotal = Number(order.total) + additionalTotal;

      // Create order items
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            quantity: item.quantity,
            price: item.price,
            orderId: id,
            menuItemId: item.menuItemId
          }
        });
      }

      // Update order total
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { total: newTotal },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      });

      // Emit event for updated order (when items are added)
      this.ordersSocketController.emitOrderUpdated(updatedOrder);
      return updatedOrder;
    });
  }

  @Delete("/:orderId/items/:itemId")
  @Summary("Remove an item from an order")
  @Description("Removes a specific item from an order")
  @(Returns(200).Description("Item successfully removed"))
  @(Returns(404).Description("Order or item not found"))
  async removeItemFromOrder(@PathParams("orderId") orderId: number, @PathParams("itemId") itemId: number) {
    // Use a transaction to ensure all operations succeed or fail together
    return this.prisma.$transaction(async (tx: PrismaService) => {
      // Check if order item exists
      const orderItem = await tx.orderItem.findUnique({
        where: {
          id: itemId
        },
        include: {
          order: true
        }
      });

      if (!orderItem || orderItem.orderId !== Number(orderId)) {
        throw new NotFound("Order item not found");
      }

      // Calculate new total
      const itemTotal = Number(orderItem.price) * orderItem.quantity;
      const newTotal = Number(orderItem.order.total) - itemTotal;

      // Delete the item
      await tx.orderItem.delete({
        where: { id: itemId }
      });

      // Update order total
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { total: newTotal },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      });

      // Emit event for updated order (when items are removed)
      this.ordersSocketController.emitOrderUpdated(updatedOrder);
      return updatedOrder;
    });
  }
}
