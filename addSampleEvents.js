/**
 * Sample Community Events Script
 * This script adds sample community update events to Firestore
 * Run with: node addSampleEvents.js
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, "../firebase-key.json");
// Make sure to add your firebase-key.json in the project root

try {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:");
  console.error("Make sure firebase-key.json exists in your project root");
  console.error(error);
  process.exit(1);
}

const db = admin.firestore();

// Sample community events
const sampleEvents = [
  {
    eventName: "Community Cleanup Drive 2025",
    date: "2025-01-20",
    time: "09:00 AM",
    description:
      "Join us for a community cleanup drive at the central park. We'll be cleaning the premises and making it beautiful. All age groups are welcome. Bring your gloves and enthusiasm! Refreshments will be provided.",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    eventName: "Health Checkup Camp",
    date: "2025-02-05",
    time: "10:00 AM",
    description:
      "Free health checkup camp for all community members. Expert doctors will be available for consultation. Bring any necessary medical documents. Services include blood pressure check, blood sugar test, and general health screening.",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    eventName: "Cultural Heritage Festival",
    date: "2025-02-26",
    time: "06:00 PM",
    description:
      "Join us in celebrating our cultural heritage with traditional performances, food stalls, and games for all age groups. Local artists will showcase their talents. Traditional food from various regions will be available. Perfect for family bonding!",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    eventName: "Sports Day & Outdoor Games",
    date: "2025-03-15",
    time: "08:00 AM",
    description:
      "Annual sports day featuring cricket, football, badminton, and various outdoor games. Participation prizes for all. Registration at the venue. Team-based competitions with exciting prizes. Food and water stations throughout the event.",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    eventName: "Educational Seminar on Digital Literacy",
    date: "2025-03-22",
    time: "02:00 PM",
    description:
      "Learn about digital literacy and online safety. Expert speakers will cover topics like cybersecurity, digital payment methods, and social media safety. Free certificates for all participants. Q&A session at the end.",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function addSampleEvents() {
  try {
    console.log("🔄 Adding sample community events...\n");

    for (const event of sampleEvents) {
      const docRef = await db.collection("communityUpdates").add(event);
      console.log(`✅ Added: "${event.eventName}" (ID: ${docRef.id})`);
      console.log(`   Date: ${event.date} at ${event.time}`);
      console.log(`   Description: ${event.description.substring(0, 60)}...\n`);
    }

    console.log("✨ All sample events added successfully!");
    console.log(
      "\n📱 Push notifications should be sent to Android users automatically."
    );
    console.log(
      "Make sure your Cloud Functions are deployed: firebase deploy --only functions\n"
    );
  } catch (error) {
    console.error("❌ Error adding sample events:", error);
  } finally {
    admin.app().delete();
  }
}

// Run the script
addSampleEvents();
