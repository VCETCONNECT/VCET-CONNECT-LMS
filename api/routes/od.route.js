import express from "express";
import {
  createOdRequest,
  getodrequestbyUserId,
  getodrequestbyMentorId,
  getodrequestbyclassinchargeid,
  updateOdRequestStatusByMentorId,
  updateOdRequestStatusByClassInchargeId,
  mentors,
  getodrequestsbySectionId,
  updateOdRequestStatusByHODId,
  getFolderPath,
  deleteodbyId,
} from "../controllers/od.controller.js";
import ODRequest from "../models/od.model.js";
import multer from "multer";

const router = express.Router();

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

router.post("/od-request", createOdRequest);
router.get("/getodrequest/:id", getodrequestbyUserId);
router.delete("/deleteod/:id", deleteodbyId);
router.get("/getodrequestbymentorid/:id", getodrequestbyMentorId);
router.get("/getodrequestbyclassinchargeid/:id", getodrequestbyclassinchargeid);

router.get("/mentors", mentors);
router.get("/odrequestsbysectionid/:id", getodrequestsbySectionId);

router.post(
  "/od-requestsbymentorid/:id/status",
  updateOdRequestStatusByMentorId
);
router.post(
  "/od-requestsbyclassinchargeid/:id/status",
  updateOdRequestStatusByClassInchargeId
);
router.post("/od-requestsbyhodid/:id/status", updateOdRequestStatusByHODId);

router.post("/getFolderPath", getFolderPath);

router.post("/od/:id/update-proof", async (req, res) => {
  try {
    const { id } = req.params;
    const { completionProof, resourceType, format } = req.body;

    const odRequest = await ODRequest.findById(id);
    if (!odRequest) {
      return res.status(404).json({ message: "OD request not found" });
    }

    odRequest.completionProof = completionProof;
    odRequest.proofMetadata = {
      resourceType,
      format,
      uploadPath: completionProof.split("/upload/")[1].split("/")[0], // Extract folder path
    };

    await odRequest.save();

    res.status(200).json({
      message: "Completion proof updated successfully",
      fileUrl: completionProof,
    });
  } catch (error) {
    console.error("Error updating completion proof:", error);
    res.status(500).json({ message: "Error updating completion proof" });
  }
});

export default router;
