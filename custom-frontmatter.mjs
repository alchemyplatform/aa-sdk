import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ReflectionKind, DeclarationReflection } from "typedoc";
import { MarkdownPageEvent } from "typedoc-plugin-markdown";

/**
 * Determine if a function should be categorized as a component (React components)
 *
 * @param {string} fileName - The function name
 * @param {string} packageName - The package name
 * @returns {boolean} True if it should be categorized as a component
 */
function isReactComponent(fileName, packageName) {
  // React components typically start with uppercase letter
  const isUpperCase = fileName[0] === fileName[0].toUpperCase();

  // Known React components
  const reactComponents = [
    "AlchemyAccountProvider",
    "AuthCard",
    "Dialog",
    "UiConfigProvider",
  ];

  return (
    (packageName === "react" || packageName === "react-native") &&
    (isUpperCase || reactComponents.includes(fileName))
  );
}

/**
 * Parse the package segment and fully-qualified npm package name from a URL path.
 *
 * @param {string} url - The page URL
 * @returns {{ packageName: string, npmPackage: string } | null}
 *   packageName – short segment used for categorisation (e.g. 'react')
 *   npmPackage  – scoped npm name (e.g. '@account-kit/react')
 */
function parsePackageFromUrl(url) {
  if (!url) return null;

  const match = url.match(/^(account-kit|aa-sdk)\/([^/]+)\//);
  if (!match) return null;

  return { packageName: match[2], npmPackage: `@${match[1]}/${match[2]}` };
}

/**
 * Custom plugin to generate frontmatter with title, description, and slug
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
/**
 * Check if a reflection's source is exclusively from external locations
 * (compiled dist/ files or node_modules/), indicating it is either a
 * re-export or an inherited member from an external package.
 *
 * @param {import('typedoc').Reflection} reflection - The reflection to check
 * @returns {boolean} True if all sources are from dist/ or node_modules/
 */
function isExternalSource(reflection) {
  const sources = reflection.sources;
  return (
    sources?.length > 0 &&
    sources.every(
      (s) =>
        s.fileName.includes("/dist/") || s.fileName.includes("node_modules/"),
    )
  );
}

export function load(app) {
  // Remove reflections sourced from external locations (dist/ or node_modules/)
  // after conversion so that:
  // 1. Re-exports don't get duplicate pages (originals in source packages remain)
  // 2. Inherited members from external packages (viem, @types/node) are excluded
  app.converter.on("resolveEnd", (context) => {
    const project = context.project;
    const toRemove = [];

    for (const reflection of Object.values(project.reflections)) {
      if (
        reflection instanceof DeclarationReflection &&
        isExternalSource(reflection)
      ) {
        toRemove.push(reflection);
      }
    }

    for (const reflection of toRemove) {
      project.removeReflection(reflection);
    }

    if (toRemove.length > 0) {
      console.log(
        `Removed ${toRemove.length} reflections sourced from external locations (dist/, node_modules/)`,
      );
    }
  });

  // Handle frontmatter generation
  app.renderer.on(
    MarkdownPageEvent.BEGIN,
    /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page - The markdown page event containing model and URL information */
    (page) => {
      if (!page.model) return;

      let title = page.model.name;

      // Extract package name from URL for categorization
      const parsed = parsePackageFromUrl(page.url);
      const packageName = parsed?.packageName ?? null;
      const npmPackage = parsed?.npmPackage ?? null;

      if (page.model.kind === ReflectionKind.Class) {
        title = page.model.name;
      } else if (page.model.kind === ReflectionKind.Interface) {
        title = page.model.name;
      } else if (page.model.kind === ReflectionKind.Function) {
        title = page.model.name;
      } else if (page.model.kind === ReflectionKind.Variable) {
        title = page.model.name;
      } else if (page.model.kind === ReflectionKind.TypeAlias) {
        title = page.model.name;
      } else if (page.model.kind === ReflectionKind.Enum) {
        title = page.model.name;
      } else if (page.model.kind === ReflectionKind.Constructor) {
        title = page.model.parent?.name || page.model.name;
      } else if (page.model.kind === ReflectionKind.Method) {
        title = `${page.model.parent?.name || ""}${page.model.name ? `.${page.model.name}` : ""}`;
      } else if (page.model.kind === ReflectionKind.Property) {
        title = `${page.model.parent?.name || ""}${page.model.name ? `.${page.model.name}` : ""}`;
      }

      let description = "";
      if (
        page.model.comment?.summary &&
        page.model.comment.summary.length > 0
      ) {
        description = page.model.comment.summary
          .map((part) => part.text || "")
          .join("")
          .replace(/\n/g, " ")
          .trim();
      }

      if (!description) {
        if (page.model.kind === ReflectionKind.Class) {
          description = `Overview of the ${page.model.name} class`;
        } else if (page.model.kind === ReflectionKind.Interface) {
          description = `Overview of the ${page.model.name} interface`;
        } else if (page.model.kind === ReflectionKind.Function) {
          // Apply same categorization logic as YAML generator
          if (isReactComponent(page.model.name, packageName)) {
            description = `Overview of the ${page.model.name} component`;
          } else if (
            page.model.name.startsWith("use") &&
            (packageName === "react" || packageName === "react-native")
          ) {
            description = `Overview of the ${page.model.name} hook`;
          } else {
            description = `Overview of the ${page.model.name} function`;
          }
        } else if (page.model.kind === ReflectionKind.Constructor) {
          description = `Overview of the ${page.model.parent?.name || page.model.name} constructor`;
        } else if (page.model.kind === ReflectionKind.Method) {
          description = `Overview of the ${page.model.name} method`;
        } else if (page.model.kind === ReflectionKind.Property) {
          description = `Overview of the ${page.model.name} property`;
        } else {
          description = `Overview of ${page.model.name}`;
        }
      }

      // Qualify non-README titles with the npm package name to avoid duplicate
      // <title> tags across packages (e.g. same function in @aa-sdk/core and
      // @account-kit/core would otherwise both render as "functionName | Alchemy Docs").
      const isReadmeFile = page.url && page.url.endsWith("README.mdx");
      const hasFallbackDescription = !page.model.comment?.summary?.length;
      if (!isReadmeFile && npmPackage) {
        title = `${title} | ${npmPackage}`;
        if (hasFallbackDescription) {
          description = `${description} from ${npmPackage}`;
        }
      }

      // For README.mdx files, remove "/src" and "/src/exports" from title and description
      if (isReadmeFile) {
        title = title.replace(/\/src\/exports$/, "").replace(/\/src$/, "");
        description = description
          .replace(/\/src\/exports/g, "")
          .replace(/\/src/g, "");
      }

      // Generate slug from the URL path
      let slug = "";
      if (page.url) {
        let processedUrl = page.url
          .replace(/\.mdx$/, "")
          .replace(/\/src/g, "")
          .replace(/\/exports/g, "");

        if (page.model.kind === ReflectionKind.Function) {
          if (isReactComponent(page.model.name, packageName)) {
            // Replace /functions/ with /components/ for React components
            processedUrl = processedUrl.replace(
              /\/functions\//,
              "/components/",
            );
          } else if (
            page.model.name.startsWith("use") &&
            (packageName === "react" || packageName === "react-native")
          ) {
            // Replace /functions/ with /hooks/ for React hooks
            processedUrl = processedUrl.replace(/\/functions\//, "/hooks/");
          }
        }

        slug = `wallets/reference/${processedUrl}`;

        if (isReadmeFile) {
          slug = slug.replace(/\/README$/, "");
        }
      }

      page.frontmatter = {
        title: title,
        description: description,
        slug: slug,
        ...page.frontmatter,
      };
    },
  );

  // Handle post-processing: auto-generated comment + link fixes
  app.renderer.on(
    MarkdownPageEvent.END,
    /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page - The markdown page event containing content to modify */
    (page) => {
      if (!page.contents) return;

      const slug = page.frontmatter?.slug;
      const isReadmeFile = page.url && page.url.endsWith("README.mdx");

      // For README pages, inject the package README.md content (if it exists)
      // before link rewrites so that any relative links in the README are also
      // normalized to absolute slug paths.
      let readmeContent = "";
      if (isReadmeFile && page.url) {
        // page.url is e.g. "account-kit/wallet-client/src/exports/README.mdx"
        // Package dir is the first two segments: "account-kit/wallet-client"
        const segments = page.url.split("/");
        if (segments.length >= 2) {
          const pkgDir = join(segments[0], segments[1]);
          try {
            const raw = readFileSync(join(pkgDir, "README.md"), "utf-8");
            // Strip the first markdown heading (# title) since the page already
            // has a title via frontmatter, then trim.
            const stripped = raw.replace(/^#\s+.+\n+/, "").trim();
            if (stripped) {
              readmeContent = stripped + "\n\n";
            }
          } catch {
            // No README.md — that's fine, skip.
          }
        }
      }

      // Strip .mdx extension from relative markdown links.
      // The docs site uses extensionless slug-based URLs.
      page.contents = page.contents.replace(
        /\]\((?!https?:\/\/)([^)]+?)\.mdx(#[^)]*)?\)/g,
        (_, path, anchor) => `](${path}${anchor || ""})`,
      );

      // For README/index pages, convert relative links to absolute slug paths.
      // Without this, relative links resolve from the parent path because the
      // slug (e.g. wallets/reference/aa-sdk/core) has no trailing slash.
      if (slug && isReadmeFile) {
        const packageName = parsePackageFromUrl(page.url)?.packageName ?? null;
        page.contents = page.contents.replace(
          /\]\((?!https?:\/\/|\/|#)([^)]+)\)/g,
          (_, relPath) => {
            // Normalize ./ and ../ segments in the resolved path
            const segments = `${slug}/${relPath}`.split("/");
            const normalized = [];
            for (const seg of segments) {
              if (seg === ".") continue;
              if (seg === ".." && normalized.length > 0) {
                normalized.pop();
              } else {
                normalized.push(seg);
              }
            }
            let resolvedPath = normalized.join("/");

            // Apply the same hooks/components path rewrite used for individual
            // page slugs so README links match the actual page slugs.
            const fnMatch = resolvedPath.match(/\/functions\/([^/]+)$/);
            if (fnMatch) {
              const fnName = fnMatch[1];
              if (isReactComponent(fnName, packageName)) {
                resolvedPath = resolvedPath.replace(
                  /\/functions\//,
                  "/components/",
                );
              } else if (
                fnName.startsWith("use") &&
                (packageName === "react" || packageName === "react-native")
              ) {
                resolvedPath = resolvedPath.replace(/\/functions\//, "/hooks/");
              }
            }

            return `](/${resolvedPath})`;
          },
        );
      }

      const frontmatterMatch = page.contents.match(/^(---\n[\s\S]*?\n---\n)/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const content = page.contents.substring(frontmatter.length);
        page.contents =
          frontmatter +
          "{/* This file is auto-generated by TypeDoc. Do not edit manually. */}\n\n" +
          readmeContent +
          content;
      } else {
        page.contents =
          "{/* This file is auto-generated by TypeDoc. Do not edit manually. */}\n\n" +
          readmeContent +
          page.contents;
      }
    },
  );
}
