import { ReflectionKind } from "typedoc";
import { MarkdownPageEvent } from "typedoc-plugin-markdown";

/**
 * Custom plugin to generate frontmatter with title, description, and slug
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.on(
    MarkdownPageEvent.BEGIN,
    /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page */
    (page) => {
      if (!page.model) return;

      // Generate title based on the reflection type and name
      let title = page.model.name;

      // Add kind prefix for better context
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

      // Generate description from comment summary or provide default
      let description = "";
      if (
        page.model.comment?.summary &&
        page.model.comment.summary.length > 0
      ) {
        // Extract text from comment summary
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
          description = `Overview of the ${page.model.name} function`;
        } else if (page.model.kind === ReflectionKind.Constructor) {
          description = `Overview of the ${page.model.parent?.name || page.model.name} constructor`;
        } else if (page.model.kind === ReflectionKind.Method) {
          description = `Overview of the ${page.model.name} method`;
        } else if (page.model.kind === ReflectionKind.Property) {
          description = `Overview of the ${page.model.name} property`;
        } else {
          description = `Overview of the ${page.model.name} ${page.model.kind}`;
        }
      }

      // Generate slug from the URL path
      let slug = "";
      if (page.url) {
        // Remove .mdx extension and convert to slug format
        slug = page.url.replace(/\.mdx$/, "");

        // Convert to the format expected by the docs site
        // e.g., "aa-sdk/core/src/classes/AccountNotFoundError.mdx" -> "wallets/reference/aa-sdk/core/classes/AccountNotFoundError"
        if (slug.startsWith("aa-sdk/")) {
          slug = `wallets/reference/${slug}`;
        } else if (slug.startsWith("account-kit/")) {
          slug = `wallets/reference/${slug}`;
        } else {
          slug = `wallets/reference/${slug}`;
        }
      }

      // Set the frontmatter
      page.frontmatter = {
        title: title,
        description: description,
        slug: slug,
        ...page.frontmatter, // Preserve any existing frontmatter
      };
    },
  );
}
