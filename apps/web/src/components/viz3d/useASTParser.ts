import { useState, useEffect } from "react";
// We use a dynamic import for babel standalone to avoid Next.js SSR issues
// and keep the bundle light on initial load.

export type VizNodeType =
  | "html"
  | "component"
  | "hook"
  | "state"
  | "text"
  | "unknown";

export interface VizNode {
  id: string;
  name: string;
  type: VizNodeType;
  children: VizNode[];
  // Metadata for rendering
  props?: Record<string, unknown>;
}

export interface ParseResult {
  root: VizNode | null;
  error: string | null;
}

/**
 * A simple hook that parses a JSX string and returns an abstract Tree of nodes
 * ready to be positioned in the 3D scene.
 */
export function useASTParser(code: string): ParseResult {
  const [result, setResult] = useState<ParseResult>({
    root: null,
    error: null,
  });

  useEffect(() => {
    let active = true;

    async function parseCode() {
      try {
        // Dynamically load Babel standalone
        const Babel = await import("@babel/standalone");

        // Parse to AST using babel
        const ast = Babel.parse(code, {
          presets: ["react"],
          plugins: ["syntax-jsx"],
        });

        // Traverse AST to build our simplified VizNode tree
        const rootNode = buildVizTreeFromAST(ast);
        if (active) {
          setResult({ root: rootNode, error: null });
        }
      } catch (err: unknown) {
        if (active) {
          setResult({ root: null, error: String(err) });
        }
      }
    }

    // Debounce parsing to avoid hanging the browser while typing
    const timer = setTimeout(parseCode, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [code]);

  return result;
}

// ─── NAIVE AST TO VIZ NODE BUILDER ──────────────────────────────────────────

// This is a simplified builder that looks for JSX elements and Hooks in the AST.
function buildVizTreeFromAST(ast: any): VizNode | null {
  // We'll traverse the AST and look for exactly one top-level Component
  // or just collect all JSX elements into a root dummy node.
  let root: VizNode | null = null;

  // A simple DFS to find JSXElements and Hook calls
  function traverse(node: any): VizNode | null {
    if (!node) return null;

    if (node.type === "JSXElement") {
      const name = getJSXName(node.openingElement.name);

      const isHtml = /^[a-z]/.test(name);
      const isComponent = /^[A-Z]/.test(name);

      const vizNode: VizNode = {
        id: `node-${Math.random().toString(36).substr(2, 9)}`,
        name,
        type: isComponent ? "component" : isHtml ? "html" : "unknown",
        children: [],
      };

      // Traverse children
      (node.children || []).forEach((childNode: any) => {
        const childVizNode = traverse(childNode);
        if (childVizNode) {
          vizNode.children.push(childVizNode);
        } else if (
          childNode.type === "JSXText" &&
          childNode.value.trim() !== ""
        ) {
          vizNode.children.push({
            id: `text-${Math.random().toString(36).substr(2, 9)}`,
            name: `"${childNode.value.trim().substring(0, 15)}..."`,
            type: "text",
            children: [],
          });
        }
      });
      return vizNode;
    }

    if (node.type === "CallExpression") {
      const calleeName = node.callee?.name;
      if (calleeName && calleeName.startsWith("use")) {
        return {
          id: `hook-${Math.random().toString(36).substr(2, 9)}`,
          name: calleeName,
          type: "hook",
          children: [],
        };
      }
    }

    if (
      node.type === "FunctionDeclaration" ||
      node.type === "ArrowFunctionExpression"
    ) {
      // Create a wrapper component node for the function definition
      const name = node.id?.name || "Component";
      const vizNode: VizNode = {
        id: `comp-${Math.random().toString(36).substr(2, 9)}`,
        name,
        type: "component",
        children: [],
      };

      // Search inside the function body
      if (node.body?.body) {
        node.body.body.forEach((stmt: any) => {
          const stmtViz = traverse(stmt);
          if (stmtViz) vizNode.children.push(stmtViz);
        });
      } else if (node.body) {
        const retViz = traverse(node.body);
        if (retViz) vizNode.children.push(retViz);
      }
      return vizNode;
    }

    if (node.type === "VariableDeclaration") {
      const declarationsHtmlNodes: VizNode[] = [];
      node.declarations.forEach((decl: any) => {
        const declViz = traverse(decl.init);
        if (declViz) declarationsHtmlNodes.push(declViz);
      });
      return declarationsHtmlNodes.length > 0 ? declarationsHtmlNodes[0] : null;
    }

    if (node.type === "ReturnStatement") {
      return traverse(node.argument);
    }

    if (node.type === "File" || node.type === "Program") {
      // Look through top level statements
      const body = node.program ? node.program.body : node.body;
      for (const stmt of body) {
        const res = traverse(stmt);
        if (res) {
          if (!root) root = res;
          else if (root.type !== "component") {
            // Wrap in fragment if multiple roots
            root = {
              id: "root",
              name: "Fragment",
              type: "component",
              children: [root, res],
            };
          } else {
            root.children.push(res);
          }
        }
      }
    }

    return null;
  }

  traverse(ast);
  return root;
}

function getJSXName(nameNode: any): string {
  if (nameNode.type === "JSXIdentifier") {
    return nameNode.name;
  }
  if (nameNode.type === "JSXMemberExpression") {
    return `${getJSXName(nameNode.object)}.${getJSXName(nameNode.property)}`;
  }
  return "Unknown";
}
