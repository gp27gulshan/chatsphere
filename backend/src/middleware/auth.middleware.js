import { getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/backend";
import User from "../models/user.model.js";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let user = await User.findOne({ clerkId: userId });

    // Auto-create user if not found
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      const email =
        clerkUser.emailAddresses?.[0]?.emailAddress || "noemail@example.com";

      const fullName =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        clerkUser.username ||
        email.split("@")[0];

      user = await User.create({
        clerkId: userId,
        email,
        fullName,
        profilePic: clerkUser.imageUrl || "",
      });

      console.log(`Auto-created user: ${fullName}`);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}