import { ReflectionKind } from "typedoc";
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
 * Extract package name from URL path
 *
 * @param {string} url - The page URL
 * @returns {string|null} The package name (e.g., 'react', 'react-native', 'core')
 */
function extractPackageFromUrl(url) {
  if (!url) return null;

  const match = url.match(/^(?:account-kit|aa-sdk)\/([^/]+)\//);
  return match ? match[1] : null;
}

/**
 * Custom plugin to generate frontmatter with title, description, and slug
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  // Handle frontmatter generation
  app.renderer.on(
    MarkdownPageEvent.BEGIN,
    /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page - The markdown page event containing model and URL information */
    (page) => {
      if (!page.model) return;

      let title = page.model.name;

      // Extract package name from URL for categorization
      const packageName = extractPackageFromUrl(page.url);

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

      // For README.mdx files, remove "/src" and "/src/exports" from title and description
      const isReadmeFile = page.url && page.url.endsWith("README.mdx");
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

  // Handle adding auto-generated comment to final content
  app.renderer.on(
    MarkdownPageEvent.END,
    /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page - The markdown page event containing content to modify */
    (page) => {
      if (!page.contents) return;

      const frontmatterMatch = page.contents.match(/^(---\n[\s\S]*?\n---\n)/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const content = page.contents.substring(frontmatter.length);
        page.contents =
          frontmatter +
          "{/* This file is auto-generated by TypeDoc. Do not edit manually. */}\n\n" +
          content;
      } else {
        page.contents =
          "{/* This file is auto-generated by TypeDoc. Do not edit manually. */}\n\n" +
          page.contents;
      }
    },
  );
}
