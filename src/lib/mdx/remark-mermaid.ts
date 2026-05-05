/**
 * remark-mermaid-to-component
 *
 * Transforms ```mermaid code fences into a JSX `<MermaidDiagram>` element
 * so the diagram is rendered client-side (lazy-loaded, SSR-free) while the
 * rest of the MDX remains server-rendered.
 *
 * The raw diagram source is passed as a prop so the client component has
 * access to both the text (for the accessible fallback) and the source
 * (to initialise the Mermaid renderer).
 */

import { visit } from "unist-util-visit";
import type { Root, Code } from "mdast";
import type { Plugin } from "unified";

export const remarkMermaidToComponent: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "mermaid" || !parent || index === undefined) return;

      // Encode the source to survive MDX serialisation.
      const encoded = Buffer.from(node.value, "utf-8").toString("base64");

      // Replace the code node with an MDX JSX element.
      // next-mdx-remote will resolve `MermaidDiagram` from the components map.
      const jsxNode = {
        type: "mdxJsxFlowElement",
        name: "MermaidDiagram",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "source",
            value: encoded,
          },
        ],
        children: [],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (parent.children as any[]).splice(index, 1, jsxNode);
    });
  };
};
