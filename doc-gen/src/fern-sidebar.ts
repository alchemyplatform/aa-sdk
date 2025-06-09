import { findUp } from "find-up";
import fs from "fs-extra";
import * as logger from "./logger.js";

export const getDocsYaml = async () => {
  const docsYamlPath = await findUp("docs/docs.yml", {
    cwd: process.cwd(),
    type: "file",
  });

  if (!docsYamlPath) {
    logger.error("Could not find docs.yml file");
    return;
  }

  const yamlContent = fs.readFileSync(docsYamlPath, "utf-8");

  return yamlContent;
};

// OLD CODE - ignore
//   let yamlContent = fs.readFileSync(docsYamlPath, "utf-8");
//   console.log(yamlContent);

//   const docsYaml = yaml.load(
//     fs.readFileSync(docsYamlPath, "utf-8")
//   ) as DocsYaml;

//   const sections = docsYaml.navigation[0].layout;
//   const section = sections.find((section) => section.section === packageName);

//   if (!section) {
//     logger.error(`Could not find section for ${sourceFilePath}`);
//     return;
//   }

//   const sdkReferenceSection = section.contents?.find(
//     (content) => content.section === "SDK Reference"
//   );
//   if (!sdkReferenceSection) {
//     logger.error(`Could not find SDK References section for ${sourceFilePath}`);
//     return;
//   }
