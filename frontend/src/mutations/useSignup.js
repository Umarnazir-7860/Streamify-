import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router"; // ✅ import useNavigate
import toast from "react-hot-toast";


export const useSignup = (signupData) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // ✅ initialize navigate
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/auth/signup", signupData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Signup successful!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
        navigate("/onboarding"); // ✅ redirect on signup success
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Signup failed");
    },
  });
};





export const getAuthUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  } catch (error) {
    console.log("Error fetching auth user:", error);
    return null;
  }
};

 export const completeOnboarding=async(formData)=>{
  const response = await axiosInstance.post("/auth/onboarding",formData)

  return response.data
 } 

 export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

 export const getUserFriends  = async () => {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
};

 export const getRecommendedUsers  = async () => {
  const response = await axiosInstance.get("/users");
  return response.data;
};

 export const getoutgoingFriendsReqs  = async () => {
  const response = await axiosInstance.get("/users/outgoing-friends-requests");
  return response.data;
};

export const sendFriendRequest = async (userId) => {
  const response = await axiosInstance.post(
    `/users/friend-request/${userId}`,
    {}, // Request body (empty in this case)
 // ✅ Properly placed option
  );
  return response.data;
};

 export const getFriendRequests  = async () => {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
};

 export const acceptFriendRequest  = async (requestId) => {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`); 
  return response.data;
};
export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}