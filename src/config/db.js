import mongoose from "mongoose";

async function connectDatabase(mongoUri) {
  const connection = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(
    `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`,
  );
}

export { connectDatabase };
