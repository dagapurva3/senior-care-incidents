import express from "express";
import { Op } from "sequelize";
import Incident from "../models/incident";
import { authenticateToken } from "../middleware/auth";
import { AuthRequest, CreateIncidentRequest } from "../types";
import { summarizeIncident } from "../services/openai";

const router = express.Router();

// Create new incident
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { type, description, status = "open" }: CreateIncidentRequest = req.body;

    // Enhanced validation
    if (!type || !description) {
      return res
        .status(400)
        .json({ error: "Type and description are required" });
    }

    if (typeof type !== 'string' || typeof description !== 'string') {
      return res
        .status(400)
        .json({ error: "Type and description must be strings" });
    }

    if (description.trim().length < 10) {
      return res
        .status(400)
        .json({ error: "Description must be at least 10 characters long" });
    }

    const validTypes = ["fall", "behaviour", "medication", "other"];
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json({ error: `Type must be one of: ${validTypes.join(', ')}` });
    }

    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const incident = await Incident.create({
      userId: req.user!.uid,
      type,
      description: description.trim(),
      status,
    });

    res.status(201).json(incident);
  } catch (error) {
    console.error("Create incident error:", error);
    res.status(500).json({ error: "Failed to create incident" });
  }
});

// Get all incidents for authenticated user with pagination, search, and filters
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      type = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "DESC"
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause: any = { userId: req.user!.uid };

    if (search) {
      whereClause.description = {
        [Op.iLike]: `%${search}%`
      };
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    // Validate sortBy
    const validSortFields = ["createdAt", "updatedAt", "type", "status"];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : "createdAt";
    const sortDirection = sortOrder === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await Incident.findAndCountAll({
      where: whereClause,
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      incidents: rows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Get incidents error:", error);
    res.status(500).json({ error: "Failed to retrieve incidents" });
  }
});

// Update incident status
router.patch("/:id/status", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Incident ID is required" });
    }

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const incident = await Incident.findOne({
      where: { id, userId: req.user!.uid },
    });

    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    incident.status = status;
    await incident.save();

    res.json(incident);
  } catch (error) {
    console.error("Update incident status error:", error);
    res.status(500).json({ error: "Failed to update incident status" });
  }
});

// Export incidents
router.get("/export", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { format = "json" } = req.query;

    const incidents = await Incident.findAll({
      where: { userId: req.user!.uid },
      order: [["createdAt", "DESC"]],
    });

    if (format === "csv") {
      const csvHeader = "ID,Type,Description,Status,Summary,Created At,Updated At\n";
      const csvData = incidents.map(incident => 
        `"${incident.id}","${incident.type}","${incident.description.replace(/"/g, '""')}","${incident.status}","${incident.summary?.replace(/"/g, '""') || ''}","${incident.createdAt}","${incident.updatedAt}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="incidents.csv"');
      res.send(csvHeader + csvData);
    } else {
      res.json(incidents);
    }
  } catch (error) {
    console.error("Export incidents error:", error);
    res.status(500).json({ error: "Failed to export incidents" });
  }
});

// Summarize incident
router.post(
  "/:id/summarize",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Incident ID is required" });
      }

      const incident = await Incident.findOne({
        where: { id, userId: req.user!.uid },
      });

      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }

      if (incident.summary) {
        return res.json(incident);
      }

      const summary = await summarizeIncident(
        incident.description,
        incident.type
      );

      incident.summary = summary;
      await incident.save();

      res.json(incident);
    } catch (error) {
      console.error("Summarize incident error:", error);
      res.status(500).json({ error: "Failed to summarize incident" });
    }
  }
);

export default router;
