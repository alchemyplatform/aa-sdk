import fs from "fs-extra";
import path from "path";

interface JSDocMDXEntry {
  functionName: string;
  packageName: string;
  filePath: string;
  mdxContent: string;
}

class JSDocTagRegistry {
  private entries: Map<string, JSDocMDXEntry> = new Map();
  private outputDir: string = "";

  setOutputDir(dir: string) {
    this.outputDir = dir;
  }

  clear() {
    this.entries.clear();
  }

  // Store the full MDX content for a function
  storeMDXContent(
    functionName: string,
    packageName: string,
    filePath: string,
    mdxContent: string,
  ) {
    const key = `${packageName}:${functionName}`;
    this.entries.set(key, {
      functionName,
      packageName,
      filePath,
      mdxContent,
    });
  }

  // Get a specific MDX entry
  getEntry(packageName: string, functionName: string): JSDocMDXEntry | null {
    const key = `${packageName}:${functionName}`;
    return this.entries.get(key) || null;
  }

  // Get all entries for a package
  getEntriesForPackage(packageName: string): JSDocMDXEntry[] {
    return Array.from(this.entries.values()).filter(
      (entry) => entry.packageName === packageName,
    );
  }

  // Export the registry to a JSON file for use by the include processor
  async exportRegistry() {
    if (!this.outputDir) {
      throw new Error("Output directory not set");
    }

    const registryPath = path.join(this.outputDir, "jsdoc-mdx-registry.json");
    const registryData = Object.fromEntries(this.entries);

    await fs.outputFile(registryPath, JSON.stringify(registryData, null, 2));
    console.log(`JSDoc MDX registry exported to ${registryPath}`);
  }

  // Load registry from JSON file
  async loadRegistry() {
    if (!this.outputDir) {
      throw new Error("Output directory not set");
    }

    const registryPath = path.join(this.outputDir, "jsdoc-mdx-registry.json");

    if (await fs.pathExists(registryPath)) {
      const registryData = await fs.readJson(registryPath);
      this.entries = new Map(Object.entries(registryData));
    }
  }
}

export const jsDocTagRegistry = new JSDocTagRegistry();
