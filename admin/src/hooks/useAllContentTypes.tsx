import { useQuery } from "react-query";
import { StrapiContentTypeFullSchema } from "strapi-typed";
import { AllContentTypesRepository } from "../utils/repositories";
import { mapUseQueryResourceToState, ResourceState } from "../utils";

const useAllContentTypes = (): ResourceState<StrapiContentTypeFullSchema[], Error> =>
  mapUseQueryResourceToState(
    useQuery<StrapiContentTypeFullSchema[], Error>(
      AllContentTypesRepository.getIndex(),
      AllContentTypesRepository.fetch,
    )
  );

export default useAllContentTypes;
