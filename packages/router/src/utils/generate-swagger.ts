// swaggerUtils.ts
import swaggerJsdoc from "swagger-jsdoc";
import { RouteDefinition } from "./types";

export const generateSwaggerSpec = (routes: RouteDefinition[]) => {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Your API",
        version: "1.0.0",
      },
    },
    apis: [],
  };

  const specs = swaggerJsdoc(options);
  specs.paths = {};

  routes.forEach((route) => {
    const path = route.path.replace(/:(\w+)/g, "{$1}"); // Convert Express-style params to OpenAPI-style

    if (!specs.paths[path]) {
      specs.paths[path] = {};
    }

    specs.paths[path][route.method] = {
      summary: route.description || "",
      tags: route.tags || [],
      responses: {
        200: {
          description: "Successful response",
        },
      },
    };
  });

  return specs;
};
