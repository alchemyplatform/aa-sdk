import { readFileSync } from "node:fs";
import { join } from "node:path";
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
 * @param {import('typedoc').Reflection} reflection - Reflection to inspect for source file metadata.
 * @returns {boolean} True when all reflection sources are generated or external.
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
 * @param {import('typescript').TypeChecker} checker - TypeScript checker used to inspect type structure.
 * @param {import('typescript').Type} tsType - TypeScript type to convert into a TypeDoc type.
 * @param {import('typedoc').DeclarationReflection} parent - Parent reflection for nested objects
 * @param {import('typedoc').ProjectReflection} project - TypeDoc project that owns generated reflections.
 * @param {number} depth - Recursion depth guard
 * @returns {import('typedoc').Type} TypeDoc type representation for the TypeScript type.
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
 * @param {import('typedoc').Type | undefined} type - TypeDoc type to inspect.
 * @returns {boolean} True when the type is an empty reflected object.
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
 * @param {import('typedoc').Context} context - TypeDoc conversion context used for symbol lookup.
 * @param {import('typedoc').ProjectReflection} project - Project reflection whose TypeBox-derived types should be repaired.
 * @param {import('typescript').TypeChecker} checker - TypeScript checker used to resolve structural types.
 * @returns {{ count: number, codeBlockFixes: Map<string, string> }} Number of fixes and code block replacements.
 */
function resolveTypeBoxTypes(context, project, checker) {
  let fixedCount = 0;
  // Map of type alias name → checker type string for code block fixups
  const codeBlockFixes = new Map();
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

    // Check if the current type needs fixing:
    // 1. No type at all (null/undefined)
    // 2. Empty object type ({}) — TypeDoc couldn't resolve TypeBox types
    // 3. Wrapped in Prettify/utility types that collapse inner types to `object`
    // 4. Unresolved internal reference — unexported alias TypeDoc can't follow
    const currentType = reflection.type;
    const needsFix =
      // No type at all
      !currentType ||
      // Entirely collapsed to `object` intrinsic
      (currentType?.type === "intrinsic" && currentType.name === "object") ||
      // Empty object type ({})
      isEmptyObjectType(currentType) ||
      (currentType?.type === "reference" &&
        currentType.typeArguments?.some(isEmptyObjectType)) ||
      // Unresolved internal reference (no package, no type args)
      (currentType?.type === "reference" &&
        !currentType.reflection &&
        !currentType.package &&
        !currentType.typeArguments?.length);

    if (!needsFix) continue;

    const sym = context.getSymbolFromReflection(reflection);
    if (!sym) continue;

    const tsType = checker.getDeclaredTypeOfSymbol(sym);
    let props = checker.getPropertiesOfType(tsType);

    // For types wrapped in Prettify or other mapped types, getDeclaredType
    // may return the mapped type itself. Try getTypeOfSymbol to get the
    // fully resolved structural type instead.
    let resolvedType = tsType;
    if (props.length === 0) {
      resolvedType = checker.getTypeOfSymbol(sym);
      props = checker.getPropertiesOfType(resolvedType);
    }
    if (props.length === 0) continue;

    // If the reflection already has children (TypeDoc resolved the properties
    // but rendered the code block as `object`), don't replace the type —
    // just store a code block fix. Creating a new ReflectionType with children
    // would duplicate the property anchors (causing `-1` suffixes).
    const hasExistingChildren =
      reflection.children?.length > 0 ||
      (reflection.type?.type === "reflection" &&
        reflection.type.declaration?.children?.length > 0);

    if (hasExistingChildren) {
      // Prefer the original source text (preserves named type references)
      // over the checker's typeToString (which expands everything).
      let codeBlockStr;
      const cbSym = context.getSymbolFromReflection(reflection);
      const cbDecl = cbSym?.getDeclarations()?.[0];
      if (cbDecl && ts.isTypeAliasDeclaration(cbDecl) && cbDecl.type) {
        codeBlockStr = cbDecl.type.getText();
      }
      if (!codeBlockStr) {
        codeBlockStr = checker.typeToString(
          resolvedType,
          undefined,
          ts.TypeFormatFlags.MultilineObjectLiterals |
            ts.TypeFormatFlags.NoTruncation |
            ts.TypeFormatFlags.InTypeAlias,
        );
      }
      codeBlockFixes.set(reflection.name, codeBlockStr);
      fixedCount++;
    } else {
      // No existing children — build a proper ReflectionType from the TS checker
      const newType = tsTypeToTypeDoc(
        checker,
        resolvedType,
        reflection,
        project,
      );
      if (newType.type !== "unknown") {
        reflection.type = newType;
        fixedCount++;
        if (newType.type === "reflection") {
          codeBlockFixes.set(
            reflection.name,
            checker.typeToString(
              resolvedType,
              undefined,
              ts.TypeFormatFlags.MultilineObjectLiterals |
                ts.TypeFormatFlags.NoTruncation |
                ts.TypeFormatFlags.InTypeAlias,
            ),
          );
        }
      }
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

  // Step 3: Fix method signatures inside type alias reflections
  // (e.g. SmartWalletActions) — TypeDoc expands TypeBox-derived param/return
  // types inline instead of keeping the named type references.
  for (const reflection of reflections) {
    if (
      !(reflection instanceof DeclarationReflection) ||
      reflection.kind !== ReflectionKind.TypeAlias ||
      !isWalletApis(reflection) ||
      reflection.type?.type !== "reflection"
    ) {
      continue;
    }

    const decl = reflection.type.declaration;
    if (!decl?.children?.length) continue;

    // Get the TS AST declaration for this type alias
    const sym = context.getSymbolFromReflection(reflection);
    if (!sym) continue;
    const symDecls = sym.getDeclarations();
    if (!symDecls?.length) continue;
    const typeAliasDecl = symDecls[0];
    if (!ts.isTypeAliasDeclaration(typeAliasDecl)) continue;
    const typeLiteral = typeAliasDecl.type;
    if (!ts.isTypeLiteralNode(typeLiteral)) continue;

    // Map member name → AST PropertySignature
    const memberAstMap = new Map();
    for (const member of typeLiteral.members) {
      if (ts.isPropertySignature(member) && member.name) {
        memberAstMap.set(member.name.getText(), member);
      }
    }

    for (const child of decl.children) {
      const astMember = memberAstMap.get(child.name);
      if (!astMember?.type || !ts.isFunctionTypeNode(astMember.type)) continue;
      const funcTypeNode = astMember.type;

      for (const sig of child.signatures ?? []) {
        // Fix return type: replace expanded type with named reference
        if (
          sig.type?.type === "reference" &&
          sig.type.name === "Promise" &&
          sig.type.typeArguments?.length === 1
        ) {
          const innerArg = sig.type.typeArguments[0];
          if (
            innerArg.type === "reflection" ||
            (innerArg.type === "intrinsic" && innerArg.name === "object")
          ) {
            const retNode = funcTypeNode.type;
            if (
              ts.isTypeReferenceNode(retNode) &&
              retNode.typeArguments?.length === 1
            ) {
              const innerNode = retNode.typeArguments[0];
              if (ts.isTypeReferenceNode(innerNode)) {
                const aliasName = innerNode.typeName.getText();
                const target = typeAliasMap.get(aliasName);
                if (target) {
                  sig.type.typeArguments[0] =
                    ReferenceType.createResolvedReference(
                      aliasName,
                      target,
                      project,
                    );
                  fixedCount++;
                }
              }
            }
          }
        }

        // Fix parameter types: replace expanded types with named references
        if (sig.parameters?.length) {
          for (let i = 0; i < sig.parameters.length; i++) {
            const param = sig.parameters[i];
            // Skip params already resolved to a reference
            if (param.type?.type === "reference" && param.type.reflection) {
              continue;
            }

            const astParam = funcTypeNode.parameters[i];
            if (!astParam?.type) continue;

            // Handle optional param: T | undefined — unwrap to check the ref
            let typeNode = astParam.type;
            if (ts.isUnionTypeNode(typeNode)) {
              // Find the non-undefined type in the union
              const nonUndef = typeNode.types.find(
                (t) =>
                  !(
                    t.kind === ts.SyntaxKind.UndefinedKeyword ||
                    (ts.isLiteralTypeNode(t) &&
                      t.literal.kind === ts.SyntaxKind.UndefinedKeyword)
                  ),
              );
              if (nonUndef) typeNode = nonUndef;
            }

            if (!ts.isTypeReferenceNode(typeNode)) continue;
            const aliasName = typeNode.typeName.getText();
            const target = typeAliasMap.get(aliasName);
            if (target) {
              param.type = ReferenceType.createResolvedReference(
                aliasName,
                target,
                project,
              );
              fixedCount++;
            }
          }
        }
      }
    }

    // Generate a clean code block from the source AST instead of letting
    // TypeDoc expand all the TypeBox-derived types inline
    const sourceText = typeLiteral.getText();
    if (sourceText) {
      codeBlockFixes.set(reflection.name, sourceText);
    }
  }

  return { count: fixedCount, codeBlockFixes };
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
      const result = resolveTypeBoxTypes(context, project, checker);
      if (result.count > 0) {
        console.log(
          `Resolved ${result.count} TypeBox-derived types using TS checker`,
        );
      }
      // Store code block fixes for use during markdown rendering
      app._codeBlockFixes = result.codeBlockFixes;
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
      const isReadmeFile = page.url && page.url.endsWith("README.mdx");
      const isExperimentalPage =
        page.url && page.url.includes("/experimental/") && !isReadmeFile;

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
      if (isReadmeFile) {
        title = title.replace(/\/src\/exports$/, "").replace(/\/src$/, "");
        title = `@alchemy/${title}`;
        description = description
          .replace(/\/src\/exports/g, "")
          .replace(/\/src/g, "");
      }

      if (isExperimentalPage) {
        title = `${title} (experimental)`;
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

      // For README pages, inject the package README.md content before link
      // rewrites so that any relative links in the README get normalized too.
      if (isReadmeFile && page.url) {
        // page.url is e.g. "wallet-apis/src/exports/README.mdx"
        // Package dir is the first segment: "wallet-apis"
        const segments = page.url.split("/");
        if (segments.length >= 1) {
          const pkgDir = join("packages", segments[0]);
          try {
            const raw = readFileSync(join(pkgDir, "README.md"), "utf-8");
            // Strip the first markdown heading (# title) since the page already
            // has a title via frontmatter, then trim.
            const stripped = raw.replace(/^#\s+.+\n+/, "").trim();
            if (stripped) {
              // Insert after frontmatter, before TypeDoc content
              const fmMatch = page.contents.match(/^(---\n[\s\S]*?\n---\n)/);
              if (fmMatch) {
                const fm = fmMatch[1];
                const rest = page.contents.substring(fm.length);
                page.contents = fm + "\n" + stripped + "\n\n" + rest;
              } else {
                page.contents = stripped + "\n\n" + page.contents;
              }
            }
          } catch {
            // No README.md — that's fine, skip.
          }
        }
      }

      if (page.url?.includes("/experimental/")) {
        const experimentalNotice =
          "<Warning>Experimental: This API is experimental and may change in a future release.</Warning>\n\n";
        const fmMatch = page.contents.match(/^(---\n[\s\S]*?\n---\n)/);
        if (fmMatch) {
          const fm = fmMatch[1];
          const rest = page.contents.substring(fm.length).trimStart();
          if (!rest.startsWith("<Warning>Experimental:")) {
            page.contents = `${fm}\n${experimentalNotice}${rest}`;
          }
        } else if (!page.contents.startsWith("<Warning>Experimental:")) {
          page.contents = experimentalNotice + page.contents;
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

      // Clean up collapsed `object` placeholders in wallet-apis type pages.
      // TypeDoc collapses inline types it can't resolve to `object`, e.g.:
      //   Prettify<TypedDataDefinition & object>  →  Prettify<TypedDataDefinition>
      //   AuthorizationSignatureRequest & object   →  AuthorizationSignatureRequest
      if (page.url?.includes("wallet-apis/")) {
        // Remove `& object` from intersections (within code blocks and inline code)
        page.contents = page.contents.replace(
          /\s*&\s*object(?=[>);,\s\n\]}])/g,
          "",
        );
        // Remove `object & ` prefix
        page.contents = page.contents.replace(/object\s*&\s*(?=[A-Z{])/g, "");

        // Fix code blocks using stored type strings from the TS checker/AST.
        // Handles two cases:
        // 1. Simple types: `= object;` → expanded object literal
        // 2. Complex types (SmartWalletActions): full expanded block → source AST
        const fixes = app._codeBlockFixes;
        if (fixes && page.model?.name && fixes.has(page.model.name)) {
          let typeStr = fixes.get(page.model.name);
          // Source AST strings (Step 3) have real newlines; checker strings
          // (Step 1) are single-line with 4-space pseudo-indent — reformat those.
          if (!typeStr.includes("\n")) {
            typeStr = typeStr
              .replace(/\{\s+/g, "{\n  ")
              .replace(/;\s{2,}/g, ";\n  ")
              .replace(/;\s*\}/g, ";\n}")
              .replace(/\n {2}\}/g, "\n}");
          }
          // Replace the entire code block body after `type Name =`
          page.contents = page.contents.replace(
            /^(```ts\ntype \w+(?:<[^>]*>)? =) [\s\S]*?^```/m,
            `$1 ${typeStr};\n\`\`\``,
          );
        }
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
