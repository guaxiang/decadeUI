import { nonameInitialized } from "../../noname/util/index.js";
import { lib } from "../../noname.js";
import { config as mainConfig } from "./main/config.js";
import { precontent as mainPrecontent } from "./main/precontent.js";
import { content as mainContent } from "./main/content.js";
import { mainpackage } from "./main/package.js";

export const type = "extension";

export default async function () {
	try {
		const infoUrl = `${lib.assetURL}extension/十周年UI/info.json`;
		const { name, ...otherInfo } = await lib.init.promises.json(infoUrl);

		const extensionName = name;
		const extensionPath = `${lib.assetURL}extension/${extensionName}/`;
		const extensionResolvePath = `${nonameInitialized}extension/${extensionName}/`;

		Object.assign(window, {
			decadeUIName: extensionName,
			decadeUIPath: extensionPath,
			decadeUIResolvePath: extensionResolvePath,
		});

		const packageData = mainpackage(otherInfo);

		return {
			name: extensionName,
			editable: false,
			content: mainContent,
			precontent: mainPrecontent,
			config: mainConfig,
			package: packageData,
			mainpackage: packageData,
			files: {
				character: [],
				card: [],
				skill: [],
				audio: [],
			},
		};
	} catch (error) {
		throw error;
	}
}
