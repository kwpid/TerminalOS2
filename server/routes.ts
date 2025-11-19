import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFileSystemNodeSchema, insertAppSchema, systemStateSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // File System Routes
  app.get("/api/filesystem", async (req, res) => {
    try {
      const nodes = await storage.getFileSystem();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get file system" });
    }
  });

  app.get("/api/filesystem/:id", async (req, res) => {
    try {
      const node = await storage.getNodeById(req.params.id);
      if (!node) {
        return res.status(404).json({ error: "Node not found" });
      }
      res.json(node);
    } catch (error) {
      res.status(500).json({ error: "Failed to get node" });
    }
  });

  app.get("/api/filesystem/path/*", async (req, res) => {
    try {
      const path = "/" + (req.params[0] || "");
      const node = await storage.getNodeByPath(path);
      if (!node) {
        return res.status(404).json({ error: "Node not found" });
      }
      res.json(node);
    } catch (error) {
      res.status(500).json({ error: "Failed to get node by path" });
    }
  });

  app.get("/api/filesystem/:id/children", async (req, res) => {
    try {
      const children = await storage.getNodeChildren(req.params.id);
      res.json(children);
    } catch (error) {
      res.status(500).json({ error: "Failed to get children" });
    }
  });

  app.post("/api/filesystem", async (req, res) => {
    try {
      const validated = insertFileSystemNodeSchema.parse(req.body);
      const node = await storage.createNode(validated);
      res.status(201).json(node);
    } catch (error) {
      res.status(400).json({ error: "Invalid node data" });
    }
  });

  app.patch("/api/filesystem/:id/content", async (req, res) => {
    try {
      const { content } = req.body;
      if (typeof content !== "string") {
        return res.status(400).json({ error: "Content must be a string" });
      }
      const node = await storage.updateNodeContent(req.params.id, content);
      if (!node) {
        return res.status(404).json({ error: "Node not found" });
      }
      res.json(node);
    } catch (error) {
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  app.delete("/api/filesystem/:id", async (req, res) => {
    try {
      await storage.deleteNode(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete node" });
    }
  });

  // App Routes
  app.get("/api/apps", async (req, res) => {
    try {
      const apps = await storage.getApps();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ error: "Failed to get apps" });
    }
  });

  app.get("/api/apps/:id", async (req, res) => {
    try {
      const app = await storage.getAppById(req.params.id);
      if (!app) {
        return res.status(404).json({ error: "App not found" });
      }
      res.json(app);
    } catch (error) {
      res.status(500).json({ error: "Failed to get app" });
    }
  });

  app.post("/api/apps", async (req, res) => {
    try {
      const validated = insertAppSchema.parse(req.body);
      const app = await storage.createApp(validated);
      res.status(201).json(app);
    } catch (error) {
      res.status(400).json({ error: "Invalid app data" });
    }
  });

  app.patch("/api/apps/:id", async (req, res) => {
    try {
      const app = await storage.updateApp(req.params.id, req.body);
      if (!app) {
        return res.status(404).json({ error: "App not found" });
      }
      res.json(app);
    } catch (error) {
      res.status(500).json({ error: "Failed to update app" });
    }
  });

  app.delete("/api/apps/:id", async (req, res) => {
    try {
      await storage.deleteApp(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete app" });
    }
  });

  // System State Routes
  app.get("/api/system/state", async (req, res) => {
    try {
      const state = await storage.getSystemState();
      res.json(state || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get system state" });
    }
  });

  app.post("/api/system/state", async (req, res) => {
    try {
      const validated = systemStateSchema.parse(req.body);
      await storage.saveSystemState(validated);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid system state data" });
    }
  });

  // Desktop Icon Routes
  app.get("/api/desktop-icons", async (req, res) => {
    try {
      const icons = await storage.getDesktopIcons();
      res.json(icons);
    } catch (error) {
      res.status(500).json({ error: "Failed to get desktop icons" });
    }
  });

  app.post("/api/desktop-icons", async (req, res) => {
    try {
      const icon = await storage.createDesktopIcon(req.body);
      res.status(201).json(icon);
    } catch (error) {
      res.status(400).json({ error: "Invalid icon data" });
    }
  });

  app.patch("/api/desktop-icons/:id", async (req, res) => {
    try {
      const icon = await storage.updateDesktopIcon(req.params.id, req.body);
      if (!icon) {
        return res.status(404).json({ error: "Icon not found" });
      }
      res.json(icon);
    } catch (error) {
      res.status(500).json({ error: "Failed to update icon" });
    }
  });

  app.delete("/api/desktop-icons/:id", async (req, res) => {
    try {
      await storage.deleteDesktopIcon(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete icon" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
