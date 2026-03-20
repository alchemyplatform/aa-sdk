import {
  ReflectionKind,
  DeclarationReflection,
  ReflectionType,
  ReferenceType,
  IntrinsicType,
  ArrayType,
  UnionType,
  LiteralType,
  IntersectionType,
  TupleType,
  ReflectionFlag,
  UnknownType,
} from "typedoc";
import { MarkdownPageEvent } from "typedoc-plugin-markdown";
import ts from "typescript";

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
/**
 * Check if a reflection's source is exclusively from external locations
 * (compiled dist/ files or node_modules/), indicating it is either a
 * re-export or an inherited member from an external package.
 *
 * @param {import('typedoc').Reflection} reflection
 * @returns {boolean}
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

/**
 * Convert a TypeScript type from the checker into a TypeDoc Type.
 * Handles common patterns and falls back to a string representation.
 *
 * @param {import('typescript').TypeChecker} checker
 * @param {import('typescript').Type} tsType
 * @param {import('typedoc').DeclarationReflection} parent - Parent reflection for nested objects
 * @param {import('typedoc').ProjectReflection} project
 * @param {number} depth - Recursion depth guard
 * @returns {import('typedoc').Type}
 */
function tsTypeToTypeDoc(checker, tsType, parent, project, depth = 0) {
  if (depth > 4) {
    return new UnknownType(checker.typeToString(tsType));
  }

  const typeStr = checker.typeToString(tsType);

  // Intrinsic / primitive types
  const intrinsics = [
    "string",
    "number",
    "bigint",
    "boolean",
    "undefined",
    "null",
    "void",
    "never",
    "any",
    "unknown",
    "symbol",
  ];
  if (intrinsics.includes(typeStr)) {
    return new IntrinsicType(typeStr);
  }

  // String/number/boolean literal types
  if (tsType.isStringLiteral()) {
    return new LiteralType(tsType.value);
  }
  if (tsType.isNumberLiteral()) {
    return new LiteralType(tsType.value);
  }
  if (typeStr === "true") return new LiteralType(true);
  if (typeStr === "false") return new LiteralType(false);

  // Union types
  if (tsType.isUnion()) {
    const members = tsType.types.map((t) =>
      tsTypeToTypeDoc(checker, t, parent, project, depth + 1),
    );
    return new UnionType(members);
  }

  // Intersection types
  if (tsType.isIntersection()) {
    const members = tsType.types.map((t) =>
      tsTypeToTypeDoc(checker, t, parent, project, depth + 1),
    );
    return new IntersectionType(members);
  }

  // Array types
  if (checker.isArrayType(tsType)) {
    const typeArgs = checker.getTypeArguments(tsType);
    if (typeArgs.length > 0) {
      const elementType = tsTypeToTypeDoc(
        checker,
        typeArgs[0],
        parent,
        project,
        depth + 1,
      );
      return new ArrayType(elementType);
    }
  }

  // Tuple types
  if (checker.isTupleType(tsType)) {
    const typeArgs = checker.getTypeArguments(tsType);
    const elements = typeArgs.map((t) =>
      tsTypeToTypeDoc(checker, t, parent, project, depth + 1),
    );
    return new TupleType(elements);
  }

  // Template literal types (e.g., `0x${string}`)
  if (tsType.flags & ts.TypeFlags.TemplateLiteral) {
    // TypeDoc's TemplateLiteralType expects head + tail pairs
    // For simplicity, use the string representation
    return new UnknownType(typeStr);
  }

  // Object types with properties
  const props = checker.getPropertiesOfType(tsType);
  const callSigs = tsType.getCallSignatures();
  if (props.length > 0 && callSigs.length === 0) {
    const typeLiteral = new DeclarationReflection(
      "__type",
      ReflectionKind.TypeLiteral,
      parent,
    );
    for (const prop of props) {
      const propDecl = new DeclarationReflection(
        prop.name,
        ReflectionKind.Property,
        typeLiteral,
      );
      const propType = checker.getTypeOfSymbol(prop);
      propDecl.type = tsTypeToTypeDoc(
        checker,
        propType,
        typeLiteral,
        project,
        depth + 1,
      );
      // Mark optional properties
      if (prop.flags & ts.SymbolFlags.Optional) {
        propDecl.flags.setFlag(ReflectionFlag.Optional, true);
      }
      typeLiteral.children ??= [];
      typeLiteral.children.push(propDecl);
    }
    return new ReflectionType(typeLiteral);
  }

  // Fallback: use the checker's string representation
  return new UnknownType(typeStr);
}

/**
 * Check if a TypeDoc type represents an empty/broken object ({} or Object)
 *
 * @param {import('typedoc').Type | undefined} type
 * @returns {boolean}
 */
function isEmptyObjectType(type) {
  if (!type) return false;
  if (type.type === "reflection") {
    const decl = type.declaration;
    return (
      !decl?.children?.length &&
      !decl?.signatures?.length &&
      !decl?.indexSignatures?.length
    );
  }
  return false;
}

/**
 * Resolve TypeBox-derived types that TypeDoc couldn't resolve.
 * Fixes type aliases (detail pages) and function signatures.
 *
 * @param {import('typedoc').Context} context
 * @param {import('typedoc').ProjectReflection} project
 * @param {import('typescript').TypeChecker} checker
 * @returns {number} Number of types fixed
 */
function resolveTypeBoxTypes(context, project, checker) {
  let fixedCount = 0;
  const reflections = Object.values(project.reflections);

  // Only fix types in the wallet-apis package (TypeBox-derived types)
  const isWalletApis = (r) =>
    r.sources?.some((s) => s.fileName.includes("wallet-apis/"));

  // Build a lookup of type alias reflections by name (wallet-apis only)
  const typeAliasMap = new Map();
  for (const r of reflections) {
    if (
      r instanceof DeclarationReflection &&
      r.kind === ReflectionKind.TypeAlias &&
      isWalletApis(r)
    ) {
      typeAliasMap.set(r.name, r);
    }
  }

  // Step 1: Fix type alias reflections that have empty/broken types
  for (const reflection of reflections) {
    if (
      !(reflection instanceof DeclarationReflection) ||
      reflection.kind !== ReflectionKind.TypeAlias ||
      !isWalletApis(reflection)
    ) {
      continue;
    }

    // Check if the current type is empty or is a reference to something that
    // TypeDoc couldn't resolve
    const currentType = reflection.type;
    const isEmpty =
      isEmptyObjectType(currentType) ||
      (currentType?.type === "reference" &&
        currentType.typeArguments?.some(isEmptyObjectType));

    // Also check reference targets that themselves are empty
    const isRefToEmpty =
      currentType?.type === "reference" &&
      !currentType.typeArguments?.length &&
      currentType.reflection instanceof DeclarationReflection &&
      isEmptyObjectType(currentType.reflection.type);

    if (!isEmpty && !isRefToEmpty) {
      // Check if it's a reference whose target we can't inspect
      // (e.g., SendPreparedCallsResponse which is an unexported alias)
      if (currentType?.type !== "reference" || currentType.reflection) {
        continue;
      }
    }

    const sym = context.getSymbolFromReflection(reflection);
    if (!sym) continue;

    const tsType = checker.getDeclaredTypeOfSymbol(sym);
    const props = checker.getPropertiesOfType(tsType);
    if (props.length === 0) continue;

    // Build a proper ReflectionType from the TS checker
    const newType = tsTypeToTypeDoc(checker, tsType, reflection, project);
    if (newType.type !== "unknown") {
      reflection.type = newType;
      fixedCount++;
    }
  }

  // Step 2: Fix function return types — replace empty ReflectionType in
  // Promise<{}> with a ReferenceType to the named result type
  for (const reflection of reflections) {
    if (
      !(reflection instanceof DeclarationReflection) ||
      reflection.kind !== ReflectionKind.Function ||
      !isWalletApis(reflection)
    ) {
      continue;
    }

    for (const sig of reflection.signatures ?? []) {
      // Fix return type: replace inline expansion with named type reference
      // Triggers for both empty ({}) and expanded ReflectionTypes
      if (
        sig.type?.type === "reference" &&
        sig.type.name === "Promise" &&
        sig.type.typeArguments?.length === 1
      ) {
        const innerArg = sig.type.typeArguments[0];
        if (innerArg.type === "reflection") {
          // Use the TS checker to find the actual return type name
          const funcSym = context.getSymbolFromReflection(reflection);
          if (funcSym) {
            const funcType = checker.getTypeOfSymbol(funcSym);
            const callSigs = funcType.getCallSignatures();
            if (callSigs.length > 0) {
              const returnType = checker.getReturnTypeOfSignature(callSigs[0]);
              // Check if it's Promise<T>
              if (returnType.symbol?.name === "Promise") {
                const typeArgs = checker.getTypeArguments(returnType);
                if (typeArgs.length > 0) {
                  const innerType = typeArgs[0];
                  // Try to find the named type alias
                  let aliasName = innerType.aliasSymbol?.name;

                  // If aliasSymbol is lost (e.g., through Prettify), check the
                  // function's return type annotation for a named reference
                  if (!aliasName || !typeAliasMap.has(aliasName)) {
                    const funcDecl = funcSym.getDeclarations()?.[0];
                    if (funcDecl && funcDecl.type) {
                      // Return type annotation: Promise<SomeType>
                      const retNode = funcDecl.type;
                      if (
                        ts.isTypeReferenceNode(retNode) &&
                        retNode.typeArguments?.length === 1
                      ) {
                        const innerNode = retNode.typeArguments[0];
                        if (ts.isTypeReferenceNode(innerNode)) {
                          aliasName = innerNode.typeName.getText();
                        }
                      }
                    }
                  }

                  const targetReflection = aliasName
                    ? typeAliasMap.get(aliasName)
                    : null;

                  if (targetReflection) {
                    // Replace with a reference to the named type
                    sig.type.typeArguments[0] =
                      ReferenceType.createResolvedReference(
                        aliasName,
                        targetReflection,
                        project,
                      );
                    fixedCount++;
                  } else {
                    // No named type found — inline the resolved type
                    const resolved = tsTypeToTypeDoc(
                      checker,
                      innerType,
                      reflection,
                      project,
                    );
                    if (resolved.type !== "unknown") {
                      sig.type.typeArguments[0] = resolved;
                      fixedCount++;
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Fix parameter types: use TS checker to restore named types
      // TypeDoc may render params as "Object" when it can't resolve Prettify<T>
      // or other mapped types. Check all non-reference params against the checker.
      const funcSym2 = context.getSymbolFromReflection(reflection);
      if (funcSym2 && sig.parameters?.length) {
        const funcType2 = checker.getTypeOfSymbol(funcSym2);
        const callSigs2 = funcType2.getCallSignatures();
        if (callSigs2.length > 0) {
          const tsParams = callSigs2[0].getParameters();
          for (let i = 0; i < sig.parameters.length; i++) {
            const param = sig.parameters[i];
            const tsParam = tsParams[i];
            if (!tsParam) continue;

            // Skip params that already have a proper reference type
            if (param.type?.type === "reference" && param.type.reflection) {
              continue;
            }

            const paramType = checker.getTypeOfSymbol(tsParam);

            // Try to get the named type from the parameter's type annotation
            // (aliasSymbol is lost when Prettify<T> expands the type)
            let aliasName = paramType.aliasSymbol?.name;
            if (!aliasName || !typeAliasMap.has(aliasName)) {
              const paramDecl = tsParam.getDeclarations()?.[0];
              if (paramDecl && ts.isParameter(paramDecl) && paramDecl.type) {
                if (ts.isTypeReferenceNode(paramDecl.type)) {
                  aliasName = paramDecl.type.typeName.getText();
                }
              }
            }

            const targetReflection = aliasName
              ? typeAliasMap.get(aliasName)
              : null;

            if (targetReflection) {
              param.type = ReferenceType.createResolvedReference(
                aliasName,
                targetReflection,
                project,
              );
              fixedCount++;
            } else if (
              isEmptyObjectType(param.type) ||
              (param.type?.type === "intrinsic" && param.type.name === "Object")
            ) {
              // Inline the resolved type as a fallback
              const props = checker.getPropertiesOfType(paramType);
              if (props.length > 0) {
                const resolved = tsTypeToTypeDoc(
                  checker,
                  paramType,
                  reflection,
                  project,
                );
                if (resolved.type !== "unknown") {
                  param.type = resolved;
                  fixedCount++;
                }
              }
            }
          }
        }
      }
    }
  }

  return fixedCount;
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

    // --- Resolve TypeBox-derived types using the TS checker ---
    // TypeDoc can't resolve StaticDecode<T> from TypeBox, so types derived
    // via MethodResponse/MethodParams appear as {} or Object. We use the TS
    // checker to get the actual resolved properties and build proper TypeDoc
    // reflections.
    let checker;
    try {
      checker = context.programs[0].getTypeChecker();
    } catch {
      // No checker available — skip type resolution
    }

    if (checker) {
      const fixedTypes = resolveTypeBoxTypes(context, project, checker);
      if (fixedTypes > 0) {
        console.log(
          `Resolved ${fixedTypes} TypeBox-derived types using TS checker`,
        );
      }
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
        title = `@alchemy/${title}`;
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

      // Strip .mdx extension from relative markdown links.
      // The docs site uses extensionless slug-based URLs.
      page.contents = page.contents.replace(
        /\]\((?!https?:\/\/)([^)]+?)\.mdx(#[^)]*)?\)/g,
        (_, path, anchor) => `](${path}${anchor || ""})`,
      );

      // For README/index pages, convert relative links to absolute slug paths.
      // Without this, relative links resolve from the parent path because the
      // slug (e.g. wallets/reference/aa-sdk/core) has no trailing slash.
      const slug = page.frontmatter?.slug;
      const isReadmeFile = page.url && page.url.endsWith("README.mdx");
      if (slug && isReadmeFile) {
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
            return `](/${normalized.join("/")})`;
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
          content;
      } else {
        page.contents =
          "{/* This file is auto-generated by TypeDoc. Do not edit manually. */}\n\n" +
          page.contents;
      }
    },
  );
}
