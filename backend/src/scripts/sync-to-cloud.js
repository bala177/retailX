#!/usr/bin/env node
/**
 * Sync Local MongoDB to Cloud MongoDB
 *
 * Usage:
 *   CLOUD_MONGODB_URI="mongodb+srv://..." node src/scripts/sync-to-cloud.js
 *
 * This script:
 * 1. Drops all existing data in cloud DB
 * 2. Imports all local data (tenants, users, categories, products, etc.)
 * 3. Ensures both databases are identical
 */

const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || "mongodb://localhost:27017/retailx";
const CLOUD_URI = process.env.CLOUD_MONGODB_URI;

if (!CLOUD_URI) {
  console.error("❌ CLOUD_MONGODB_URI environment variable is required!");
  console.error("");
  console.error("Usage:");
  console.error('  CLOUD_MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/retailx" node src/scripts/sync-to-cloud.js');
  console.error("");
  console.error("You can find the URI in your Render dashboard > retailx-api > Environment > MONGODB_URI");
  process.exit(1);
}

const COLLECTIONS = ["tenants", "users", "categories", "products", "coupons", "reviews", "staffs", "bookings", "orders", "carts", "contactsubmissions", "newsletters"];

async function syncDatabases() {
  let localClient, cloudClient;

  try {
    console.log("🔄 Starting database sync...\n");

    // Connect to both databases
    console.log("📡 Connecting to LOCAL database...");
    localClient = new MongoClient(LOCAL_URI);
    await localClient.connect();
    const localDb = localClient.db();
    console.log("   ✅ Connected to local DB:", localDb.databaseName);

    console.log("☁️  Connecting to CLOUD database...");
    cloudClient = new MongoClient(CLOUD_URI);
    await cloudClient.connect();
    const cloudDb = cloudClient.db();
    console.log("   ✅ Connected to cloud DB:", cloudDb.databaseName);

    console.log("\n" + "=".repeat(60));
    console.log("📊 LOCAL DATABASE SUMMARY");
    console.log("=".repeat(60));

    const localCounts = {};
    for (const col of COLLECTIONS) {
      const count = await localDb.collection(col).countDocuments();
      localCounts[col] = count;
      console.log(`   ${col}: ${count} documents`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 CLOUD DATABASE (BEFORE SYNC)");
    console.log("=".repeat(60));

    for (const col of COLLECTIONS) {
      const count = await cloudDb.collection(col).countDocuments();
      console.log(`   ${col}: ${count} documents`);
    }

    // Confirm before proceeding
    console.log("\n⚠️  This will REPLACE ALL cloud data with local data!");
    console.log("   Proceeding in 3 seconds...\n");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Sync each collection
    console.log("=".repeat(60));
    console.log("🔄 SYNCING COLLECTIONS");
    console.log("=".repeat(60));

    for (const col of COLLECTIONS) {
      process.stdout.write(`   Syncing ${col}...`);

      // Get all local data
      const localData = await localDb.collection(col).find().toArray();

      if (localData.length === 0) {
        // Just clear cloud collection if local is empty
        await cloudDb.collection(col).deleteMany({});
        console.log(` ✅ (cleared, 0 docs)`);
        continue;
      }

      // Drop cloud collection and re-insert
      try {
        await cloudDb.collection(col).drop();
      } catch (e) {
        // Collection might not exist, that's fine
      }

      // Insert all local data
      await cloudDb.collection(col).insertMany(localData);
      console.log(` ✅ (${localData.length} docs)`);
    }

    // Rebuild indexes
    console.log("\n" + "=".repeat(60));
    console.log("🔧 REBUILDING INDEXES");
    console.log("=".repeat(60));

    for (const col of COLLECTIONS) {
      try {
        const indexes = await localDb.collection(col).indexes();
        const customIndexes = indexes.filter((idx) => idx.name !== "_id_");

        if (customIndexes.length > 0) {
          for (const idx of customIndexes) {
            try {
              const { key, ...options } = idx;
              delete options.v;
              delete options.ns;
              await cloudDb.collection(col).createIndex(key, options);
            } catch (e) {
              // Index might already exist
            }
          }
          console.log(`   ${col}: ${customIndexes.length} indexes`);
        }
      } catch (e) {
        // Skip index errors
      }
    }

    // Verify
    console.log("\n" + "=".repeat(60));
    console.log("✅ CLOUD DATABASE (AFTER SYNC)");
    console.log("=".repeat(60));

    let allMatch = true;
    for (const col of COLLECTIONS) {
      const cloudCount = await cloudDb.collection(col).countDocuments();
      const match = cloudCount === localCounts[col] ? "✅" : "❌";
      if (cloudCount !== localCounts[col]) allMatch = false;
      console.log(`   ${col}: ${cloudCount} documents ${match}`);
    }

    // Print store summary
    console.log("\n" + "=".repeat(60));
    console.log("🏪 STORES IN CLOUD");
    console.log("=".repeat(60));

    const tenants = await cloudDb
      .collection("tenants")
      .find(
        {},
        {
          projection: { name: 1, slug: 1, businessType: 1, status: 1, "branding.logo": 1, "branding.heroBanner": 1 },
        },
      )
      .toArray();

    for (const t of tenants) {
      console.log(`   ${t.name} (${t.slug})`);
      console.log(`     type: ${t.businessType} | status: ${t.status}`);
      console.log(`     logo: ${t.branding?.logo || "none"}`);
      console.log(`     hero: ${t.branding?.heroBanner || "none"}`);

      const catCount = await cloudDb.collection("categories").countDocuments({ tenant: t._id });
      const prodCount = await cloudDb.collection("products").countDocuments({ tenant: t._id });
      console.log(`     categories: ${catCount} | products: ${prodCount}`);
      console.log("");
    }

    if (allMatch) {
      console.log("🎉 Database sync complete! Cloud now matches local.");
    } else {
      console.log("⚠️  Some counts don't match. Please verify.");
    }
  } catch (error) {
    console.error("\n❌ Sync failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (localClient) await localClient.close();
    if (cloudClient) await cloudClient.close();
  }
}

syncDatabases();
