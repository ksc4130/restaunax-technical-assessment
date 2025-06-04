import * as fs from "fs";
import * as path from "path";
import { Controller, Inject } from "@tsed/di";
import { NotFound } from "@tsed/exceptions";
import type { Request, Response } from "express";
import multer from "multer";
import { BodyParams, Context, PathParams, QueryParams } from "@tsed/platform-params";
import { Delete, Description, Get, Groups, Post, Put, Returns, Summary } from "@tsed/schema";
import { promisify } from "util";

import { PrismaService } from "../../services/index.js";
import { MenuItemsSocketController } from "../ws/MenuItemsSocketController.js";


const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadMiddleware = upload.single("image");
const uploadMiddlewareAsync = promisify(uploadMiddleware);

@Controller("/menu-items")
export class MenuItemController {
  constructor(
    private prisma: PrismaService,
    @Inject() private menuItemsSocket: MenuItemsSocketController
  ) {}

  @Get("/")
  @Summary("Get all menu items")
  @Description("Returns a list of all menu items")
  @Returns(200, Array)
  async getAllMenuItems(@QueryParams("category") category?: string) {
    if (category) {
      return this.prisma.menuItem.findMany({
        where: {
          category
        }
      });
    }
    return this.prisma.menuItem.findMany();
  }

  @Get("/popular")
  @Summary("Get popular menu items")
  @Description("Returns a list of popular menu items")
  @Returns(200, Array)
  async getPopularMenuItems(@QueryParams("limit") limit: number = 5) {
    return this.prisma.menuItem.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });
  }

  @Get("/:id")
  @Summary("Get a menu item by ID")
  @Description("Returns a single menu item by its ID")
  @Returns(200)
  @(Returns(404).Description("Menu item not found"))
  async getMenuItemById(@PathParams("id") id: number) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id }
    });

    if (!menuItem) {
      throw new NotFound("Menu item not found");
    }

    return menuItem;
  }

  @Post("/")
  @Summary("Create a new menu item")
  @Description("Creates a new menu item and returns it")
  @Returns(201)
  async createMenuItem(
    @BodyParams()
    @Groups("creation")
    data: {
      name: string;
      price: number;
      imagePath?: string;
      description?: string;
      category?: string;
    }
  ) {
    const menuItem = await this.prisma.menuItem.create({
      data: {
        name: data.name,
        price: data.price,
        imagePath: data.imagePath,
        description: data.description,
        category: data.category
      }
    });

    // Emit socket event for real-time updates
    this.menuItemsSocket.emitMenuItemCreated(menuItem);

    return menuItem;
  }

  @Post("/upload")
  @Summary("Create a new menu item with image upload")
  @Description("Creates a new menu item with an uploaded image and returns it")
  @Returns(201)
  async createMenuItemWithImage(@Context() ctx: Context) {
    try {
      const req = ctx.getRequest<Request>();
      const res = ctx.getResponse<Response>();
      
      // Process the multipart form data
      await uploadMiddlewareAsync(req, res);
      
      const file = req.file;
      const formData = req.body;
      
      if (!file) {
        throw new Error("No image file uploaded");
      }

      // Create directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "assets", "menuIcons");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate a unique filename
      const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      const filePath = path.join(uploadDir, filename);
      
      // Save the file
      fs.writeFileSync(filePath, file.buffer);
      
      // Create relative path for database
      const relativePath = `/public/menuIcons/${filename}`;
      
      // Create menu item in database
      const menuItem = await this.prisma.menuItem.create({
        data: {
          name: formData.name,
          price: parseFloat(formData.price),
          imagePath: relativePath,
          description: formData.description,
          category: formData.category
        }
      });

      // Emit socket event for real-time updates
      this.menuItemsSocket.emitMenuItemCreated(menuItem);

      return menuItem;
    } catch (error) {
      console.error("Error creating menu item with image:", error);
      throw error;
    }
  }

  @Put("/:id")
  @Summary("Update a menu item")
  @Description("Updates an existing menu item and returns it")
  @Returns(200)
  @(Returns(404).Description("Menu item not found"))
  async updateMenuItem(
    @PathParams("id") id: number,
    @BodyParams()
    @Groups("update")
    data: {
      name?: string;
      price?: number;
      imagePath?: string;
      description?: string;
      category?: string;
    }
  ) {
    // Check if menu item exists
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id }
    });

    if (!menuItem) {
      throw new NotFound("Menu item not found");
    }

    const updatedMenuItem = await this.prisma.menuItem.update({
      where: { id },
      data
    });

    // Emit socket event for real-time updates
    this.menuItemsSocket.emitMenuItemUpdated(updatedMenuItem);

    return updatedMenuItem;
  }

  @Put("/:id/upload")
  @Summary("Update a menu item with image upload")
  @Description("Updates an existing menu item with an uploaded image and returns it")
  @Returns(200)
  @(Returns(404).Description("Menu item not found"))
  async updateMenuItemWithImage(@PathParams("id") id: number, @Context() ctx: Context) {
    try {
      // Check if menu item exists
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id }
      });

      if (!menuItem) {
        throw new NotFound("Menu item not found");
      }

      const req = ctx.getRequest<Request>();
      const res = ctx.getResponse<Response>();
      
      // Process the multipart form data
      await uploadMiddlewareAsync(req, res);
      
      const file = req.file;
      const formData = req.body;
      
      if (!file) {
        throw new Error("No image file uploaded");
      }

      // Create directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "assets", "menuIcons");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate a unique filename
      const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      const filePath = path.join(uploadDir, filename);
      
      // Save the file
      fs.writeFileSync(filePath, file.buffer);
      
      // Create relative path for database
      const relativePath = `/public/menuIcons/${filename}`;
      
      // Update menu item in database
      const updatedMenuItem = await this.prisma.menuItem.update({
        where: { id },
        data: {
          name: formData.name,
          price: parseFloat(formData.price),
          imagePath: relativePath,
          description: formData.description,
          category: formData.category
        }
      });

      // Emit socket event for real-time updates
      this.menuItemsSocket.emitMenuItemUpdated(updatedMenuItem);

      return updatedMenuItem;
    } catch (error) {
      console.error("Error updating menu item with image:", error);
      throw error;
    }
  }

  @Get("/image/:id")
  @Summary("Get a menu item image")
  @Description("Returns the image for a menu item by its ID")
  @(Returns(200).Description("Menu item image"))
  @(Returns(404).Description("Menu item image not found"))
  async getMenuItemImage(@PathParams("id") id: number) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id }
    });

    if (!menuItem || !menuItem.imagePath) {
      throw new NotFound("Menu item image not found");
    }

    // Dynamically import fs and path modules (ES module compatible)
    const fs = await import("fs");
    const path = await import("path");

    // Remove leading slash if present
    const imagePath = menuItem.imagePath.startsWith("/") ? menuItem.imagePath.substring(1) : menuItem.imagePath;
    console.log(`Image path: ${imagePath}`);

    // Construct the absolute path to the image file
    const imageFilePath = path.join(process.cwd(), imagePath);
    console.log(`Absolute image file path: ${imageFilePath}`);

    // Check if the file exists
    if (!fs.existsSync(imageFilePath)) {
      throw new NotFound(`Image file not found at path: ${imageFilePath}`);
    }

    // Read the file and determine its content type
    const imageBuffer = fs.readFileSync(imageFilePath);
    const contentType = this.getContentType(path.extname(imageFilePath));

    // Return the image with appropriate content type
    return {
      headers: {
        "Content-Type": contentType
      },
      body: imageBuffer
    };
  }

  // Helper method to determine content type based on file extension
  private getContentType(extension: string): string {
    switch (extension.toLowerCase()) {
      case ".png":
        return "image/png";
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".gif":
        return "image/gif";
      case ".svg":
        return "image/svg+xml";
      default:
        return "application/octet-stream";
    }
  }

  @Delete("/:id")
  @Summary("Delete a menu item")
  @Description("Deletes a menu item by its ID")
  @(Returns(204).Description("Menu item successfully deleted"))
  @(Returns(404).Description("Menu item not found"))
  async deleteMenuItem(@PathParams("id") id: number) {
    // Check if menu item exists
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id }
    });

    if (!menuItem) {
      throw new NotFound("Menu item not found");
    }

    await this.prisma.menuItem.delete({
      where: { id }
    });

    // Emit socket event for real-time updates
    this.menuItemsSocket.emitMenuItemDeleted(id);

    return null;
  }
}
