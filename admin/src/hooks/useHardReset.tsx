import { useCallback } from "react";
import { useQueryClient } from "react-query"
import { useNavigationItemPopup } from "./useNavigationItemPopup";

export const useHardReset = () => {
  const queryClient = useQueryClient();
  const navigationItemPopup = useNavigationItemPopup();

  const hardReset = useCallback(() => {
    queryClient.invalidateQueries();
    navigationItemPopup.closePopup();
  }, [queryClient, navigationItemPopup]);

  return {
    hardReset
  }
}