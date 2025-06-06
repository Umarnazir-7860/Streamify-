import { StreamChat } from 'stream-chat';
import 'dotenv/config';

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
    console.error('STREAM_API_KEY and STREAM_API_SECRET must be set');
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreanUser = async (userData) => {
    try {
        const userId = userData.id;
      await serverClient.upsertUsers([userData]);
        console.log(`✅ Stream user upserted successfully: ${userId}`);
        return userData;
    } catch (error) {
        console.error('❌ Error upserting Stream user:', error);
        throw error;
    }
};

export const generateStreamToken = (userId) => {
    //ensure userId is a string
   try {
     const userIdString = userId.toString();
     return serverClient.createToken(userIdString);
   } catch (error) {
    console.error('❌ Error generating Stream token:', error);
    throw error;
   }
    
   
};
