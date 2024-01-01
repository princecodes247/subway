import { RouteDefinition } from "../types";

// Validate that the route module exports a valid route definition
function isValidRouteModule(routeModule: any): routeModule is RouteDefinition {
  return (
    typeof routeModule === "object" &&
    routeModule !== null &&
    "method" in routeModule &&
    "path" in routeModule &&
    "handler" in routeModule &&
    typeof routeModule.method === "string" &&
    typeof routeModule.path === "string" &&
    typeof routeModule.handler === "function"
  );
}
