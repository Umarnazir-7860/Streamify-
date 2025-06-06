import { useMutation, useQueryClient } from '@tanstack/react-query';

import toast from "react-hot-toast";// if you use toast
import { axiosInstance } from "../lib/axios";// adjust as needed

export const useLogin = () => {
 
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loginData) => {
      const response = await axiosInstance.post("/auth/login", loginData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Login successful!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
     
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Login failed");
    },
  });
};
