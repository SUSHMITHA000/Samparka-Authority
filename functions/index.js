const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function: Triggers when a new community update is created in Firestore
 * Sends push notifications to all Android users
 */
exports.notifyNewCommunityUpdate = functions.firestore
  .document("communityUpdates/{docId}")
  .onCreate(async (snap, context) => {
    const communityUpdate = snap.data();
    
    // Extract event details
    const { eventName, date, time, description } = communityUpdate;

    console.log(
      `New community update created: ${eventName} on ${date} at ${time}`
    );

    try {
      // Prepare notification payload
      const notificationPayload = {
        notification: {
          title: `📢 ${eventName}`,
          body: `${date} • ${time}`,
          // Android specific
          channelId: "community_updates"
        },
        android: {
          priority: "high",
          notification: {
            title: `📢 ${eventName}`,
            body: `${date} • ${time} - ${description.substring(0, 50)}...`,
            channelId: "community_updates",
            clickAction: "COMMUNITY_UPDATE_OPENED"
          },
          data: {
            eventName: eventName,
            date: date,
            time: time,
            description: description,
            updateId: context.params.docId,
            notificationType: "community_update"
          }
        },
        data: {
          eventName: eventName,
          date: date,
          time: time,
          description: description,
          updateId: context.params.docId,
          notificationType: "community_update"
        }
      };

      // Get all user device tokens from Firestore
      const usersSnapshot = await admin
        .firestore()
        .collection("users")
        .where("deviceTokens", "!=", null)
        .get();

      if (usersSnapshot.empty) {
        console.log("No users with device tokens found");
        return null;
      }

      // Collect all device tokens
      const deviceTokens = [];
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userData.deviceTokens && Array.isArray(userData.deviceTokens)) {
          deviceTokens.push(...userData.deviceTokens);
        }
      });

      if (deviceTokens.length === 0) {
        console.log("No device tokens available");
        return null;
      }

      console.log(`Sending notifications to ${deviceTokens.length} devices`);

      // Send multicast notification
      const response = await admin
        .messaging()
        .sendMulticast({
          ...notificationPayload,
          tokens: deviceTokens
        });

      console.log(`${response.successCount} notifications sent successfully`);
      console.log(`${response.failureCount} notifications failed`);

      // Log failed tokens for cleanup
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(deviceTokens[idx]);
          }
        });
        console.log("Failed tokens:", failedTokens);
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.error("Error sending notifications:", error);
      throw error;
    }
  });

/**
 * Cloud Function: Manual trigger to test sending notifications
 * Usage: POST to /sendTestNotification
 */
exports.sendTestNotification = functions.https.onRequest(
  async (req, res) => {
    const { eventName, date, time, description } = req.body;

    if (!eventName || !date || !time || !description) {
      return res.status(400).json({
        error: "Missing required fields: eventName, date, time, description"
      });
    }

    try {
      // Save to Firestore (this will trigger notifyNewCommunityUpdate)
      const docRef = await admin.firestore().collection("communityUpdates").add({
        eventName,
        date,
        time,
        description,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({
        success: true,
        message: "Community update created and notifications sent",
        docId: docRef.id
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        error: "Failed to create community update",
        details: error.message
      });
    }
  }
);

/**
 * Cloud Function: Handle user device token registration
 * Called when user logs in from Android app
 */
exports.updateUserDeviceToken = functions.https.onRequest(
  async (req, res) => {
    const { userId, deviceToken, platform } = req.body;

    if (!userId || !deviceToken) {
      return res.status(400).json({
        error: "Missing userId or deviceToken"
      });
    }

    try {
      const userRef = admin.firestore().collection("users").doc(userId);

      // Add or update device token
      await userRef.update({
        deviceTokens: admin.firestore.FieldValue.arrayUnion(deviceToken),
        lastDeviceTokenUpdate: admin.firestore.FieldValue.serverTimestamp(),
        platform: platform || "android"
      });

      res.status(200).json({
        success: true,
        message: "Device token registered successfully"
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        error: "Failed to update device token",
        details: error.message
      });
    }
  }
);

/**
 * Cloud Function: Remove device token when user logs out
 * Called when user logs out from Android app
 */
exports.removeUserDeviceToken = functions.https.onRequest(
  async (req, res) => {
    const { userId, deviceToken } = req.body;

    if (!userId || !deviceToken) {
      return res.status(400).json({
        error: "Missing userId or deviceToken"
      });
    }

    try {
      const userRef = admin.firestore().collection("users").doc(userId);

      // Remove device token from array
      await userRef.update({
        deviceTokens: admin.firestore.FieldValue.arrayRemove(deviceToken)
      });

      res.status(200).json({
        success: true,
        message: "Device token removed successfully"
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        error: "Failed to remove device token",
        details: error.message
      });
    }
  }
);
