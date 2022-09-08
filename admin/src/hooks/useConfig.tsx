import { useQuery } from "react-query";
import { NavigationConfigRepository } from "../utils/repositories";
import { mapUseQueryResourceToState, ResourceState } from "../utils";
import { NavigationConfig } from "../../../types";

const useConfig = (): ResourceState<NavigationConfig, Error> =>
  mapUseQueryResourceToState(
    useQuery<NavigationConfig, Error>(
      NavigationConfigRepository.getIndex(),
      NavigationConfigRepository.fetch,
    )
  );

export default useConfig;
