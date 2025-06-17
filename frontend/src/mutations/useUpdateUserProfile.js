import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "./useSignup"; // ✅ because your function is defined there
import toast from "react-hot-toast";

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] }); // refresh user data
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Update failed");
    },
  });
};
