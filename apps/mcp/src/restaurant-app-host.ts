import {
  applyDocumentTheme,
  applyHostStyleVariables,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";

export function applyRestaurantHostContext(context?: McpUiHostContext) {
  if (context?.theme) applyDocumentTheme(context.theme);
  if (context?.styles?.variables) applyHostStyleVariables(context.styles.variables);
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  }
}
