import mongoose from 'mongoose';

export const connectDB = async () => {
try {
       const database = await mongoose.connect(process.env.MONGODB_URI);
       console.log(`MongoDB connected:${database.connection.host}`);
            
    } catch (error) {
        console.log("Database connection error:",error)
        process.exit(1);
    }
}