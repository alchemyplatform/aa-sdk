import { findUp } from "find-up";
import fs from "fs-extra";
import ts from "typescript";
import * as logger from "../logger.js";
import { hookGroupings } from "../react-hook-groupings.js";
import { getFunctionName } from "../templates/functionTemplate.js";

const sdkReferenceSection = "SDK Reference";

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

interface SidebarEntry {
  name: string;
  path: string;
  type: "function" | "class" | "hook" | "component";
  className?: string; // For class methods
}

class SidebarBuilder {
  private entries: SidebarEntry[] = [];
  private packageName: string = "";

  setPackageName(packageName: string) {
    this.packageName = packageName.replace(/^@/, "");
  }

  clear() {
    this.entries = [];
  }

  addEntry(
    node: ts.VariableStatement | ts.FunctionDeclaration | ts.ClassElement,
    outputFilePath: string,
    importedName: string,
    isTsx: boolean = false,
  ) {
    // Handle class methods - use same logic as generateFunctionDocs
    if (ts.isClassElement(node)) {
      const methodName = node.name?.getText() ?? "constructor";
      const relativePath = this.generateDocsPath(
        outputFilePath,
        "", // No typeDir needed since it's already in outputFilePath
        methodName,
      );

      this.entries.push({
        name: methodName,
        path: relativePath,
        type: "class",
        className: importedName,
      });
    } else {
      // Handle functions/hooks/components - same logic as generateFunctionDocs
      const functionName = getFunctionName(node, importedName);

      let entryType: "function" | "hook" | "component";
      let typeDir: "functions" | "hooks" | "components";

      if (importedName.startsWith("use")) {
        entryType = "hook";
        typeDir = "hooks";
      } else if (isTsx) {
        entryType = "component";
        typeDir = "components";
      } else {
        entryType = "function";
        typeDir = "functions";
      }

      const relativePath = this.generateDocsPath(
        outputFilePath,
        typeDir,
        functionName,
      );

      this.entries.push({
        name: functionName,
        path: relativePath,
        type: entryType,
      });
    }
  }

  private generateDocsPath(
    outputFilePath: string,
    typeDir: "functions" | "hooks" | "components" | "",
    fileName: string,
  ): string {
    const fullPath = typeDir
      ? `${outputFilePath}/${typeDir}/${fileName}.mdx`
      : `${outputFilePath}/${fileName}.mdx`;

    // Convert the output filepath to the final filepath by removing absolute path up to & including `docs/` and replacing with `wallets/`
    const docsMatch = fullPath.match(/docs\/(.+)$/);
    if (!docsMatch) {
      throw new Error(`Could not find docs match for ${fullPath}`);
    }

    return `wallets/${docsMatch[1]}`;
  }

  private groupClassEntries(): Record<string, SidebarEntry[]> {
    const classEntries: Record<string, SidebarEntry[]> = {};

    for (const entry of this.entries.filter((e) => e.type === "class")) {
      if (!entry.className) continue;

      if (!classEntries[entry.className]) {
        classEntries[entry.className] = [];
      }
      classEntries[entry.className].push(entry);
    }

    return classEntries;
  }

  private generateReactSdkSection(): string {
    const componentEntries = this.entries.filter((e) => e.type === "component");
    const hookEntries = this.entries.filter((e) => e.type === "hook");
    const functionEntries = this.entries.filter((e) => e.type === "function");
    const classEntries = this.groupClassEntries();

    let yaml = `          - section: ${sdkReferenceSection}\n`;
    yaml += `            path: wallets/pages/reference/${this.packageName}/index.mdx\n`;
    yaml += `            contents:\n`;

    if (componentEntries.length > 0) {
      yaml += `              - section: Components\n`;
      yaml += `                contents:\n`;

      componentEntries.sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of componentEntries) {
        yaml += `                  - page: ${entry.name}\n`;
        yaml += `                    path: ${entry.path}\n`;
      }
    }

    for (const [groupName, hookNames] of Object.entries(hookGroupings)) {
      const groupHooks = hookEntries.filter((hook) =>
        hookNames.includes(hook.name),
      );

      if (groupHooks.length > 0) {
        yaml += `              - section: ${groupName}\n`;
        yaml += `                contents:\n`;

        groupHooks.sort((a, b) => a.name.localeCompare(b.name));
        for (const hook of groupHooks) {
          yaml += `                  - page: ${hook.name}\n`;
          yaml += `                    path: ${hook.path}\n`;
        }
      }
    }

    if (functionEntries.length > 0) {
      yaml += `              - section: Functions\n`;
      yaml += `                contents:\n`;

      functionEntries.sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of functionEntries) {
        yaml += `                  - page: ${entry.name}\n`;
        yaml += `                    path: ${entry.path}\n`;
      }
    }

    if (Object.keys(classEntries).length > 0) {
      yaml += `              - section: Classes\n`;
      yaml += `                contents:\n`;

      const sortedClassNames = Object.keys(classEntries).sort();
      for (const className of sortedClassNames) {
        const methods = classEntries[className];

        if (methods.length === 1) {
          const method = methods[0];
          yaml += `                  - page: ${className}\n`;
          yaml += `                    path: ${method.path}\n`;
        } else {
          yaml += `                  - section: ${className}\n`;
          yaml += `                    contents:\n`;

          methods.sort((a, b) => a.name.localeCompare(b.name));
          for (const method of methods) {
            yaml += `                      - page: ${method.name}\n`;
            yaml += `                        path: ${method.path}\n`;
          }
        }
      }
    }

    return yaml;
  }

  private generateStandardSdkSection(): string {
    const functionEntries = this.entries.filter(({ type }) =>
      ["function", "hook", "component"].includes(type),
    );
    const classEntries = this.groupClassEntries();

    let yaml = `          - section: ${sdkReferenceSection}\n`;
    yaml += `            path: wallets/pages/reference/${this.packageName}/index.mdx\n`;
    yaml += `            contents:\n`;

    if (functionEntries.length > 0) {
      yaml += `              - section: Functions\n`;
      yaml += `                contents:\n`;

      functionEntries.sort((a, b) => a.name.localeCompare(b.name));

      for (const entry of functionEntries) {
        yaml += `                  - page: ${entry.name}\n`;
        yaml += `                    path: ${entry.path}\n`;
      }
    }

    if (Object.keys(classEntries).length > 0) {
      yaml += `              - section: Classes\n`;
      yaml += `                contents:\n`;

      const sortedClassNames = Object.keys(classEntries).sort();

      for (const className of sortedClassNames) {
        const methods = classEntries[className];

        // If class only has one method (usually constructor), make it a page instead of a section
        if (methods.length === 1) {
          const method = methods[0];
          yaml += `                  - page: ${className}\n`;
          yaml += `                    path: ${method.path}\n`;
        } else {
          // If class has multiple methods, make it a section with nested pages
          yaml += `                  - section: ${className}\n`;
          yaml += `                    contents:\n`;

          // Sort methods alphabetically
          methods.sort((a, b) => a.name.localeCompare(b.name));

          for (const method of methods) {
            yaml += `                      - page: ${method.name}\n`;
            yaml += `                        path: ${method.path}\n`;
          }
        }
      }
    }

    return yaml;
  }

  generateSdkReferenceSection(): string {
    if (this.entries.length === 0) {
      return "";
    }

    // account-kit/react is unique in that it has custom section grouping for hooks
    if (this.packageName === "account-kit/react") {
      return this.generateReactSdkSection();
    }

    return this.generateStandardSdkSection();
  }
}

export const sidebarBuilder = new SidebarBuilder();
