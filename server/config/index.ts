import { NavigationPluginConfig, StrapiConfig } from "../../types";

const config: StrapiConfig<NavigationPluginConfig> = {
	default: {
		additionalFields: [],
		contentTypes: [],
		contentTypesNameFields: {},
		contentTypesPopulate: {},
		allowedLevels: 2,
		gql: {
			navigationItemRelated: []
		},
	}
}

export default config;
