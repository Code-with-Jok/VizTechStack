"use client";

import { useEffect, useRef } from "react";

interface Props {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!ref.current || cancelled) return;

      const mermaid = (await import("mermaid")).default;

      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#6366f1",
          primaryTextColor: "#f8fafc",
          primaryBorderColor: "#4f46e5",
          lineColor: "#6366f1",
          secondaryColor: "#1e293b",
          tertiaryColor: "#0f172a",
          background: "#0f172a",
          mainBkg: "#1e293b",
          nodeBorder: "#4f46e5",
          clusterBkg: "#1e293b",
          titleColor: "#f8fafc",
          edgeLabelBackground: "#1e293b",
          fontFamily: "Inter, sans-serif",
        },
        flowchart: { curve: "basis" },
        securityLevel: "loose",
      });

      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      try {
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          // Make SVG responsive
          const svgEl = ref.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.maxWidth = "100%";
            svgEl.style.height = "auto";
          }
        }
      } catch (e) {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = `<pre class="text-red-400 text-xs">${String(e)}</pre>`;
        }
      }
    }

    void render();
    return () => { cancelled = true; };
  }, [chart]);

  return (
    <div
      ref={ref}
      className={`mermaid-wrapper flex justify-center rounded-xl overflow-auto ${className}`}
    />
  );
}
