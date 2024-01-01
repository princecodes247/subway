import fs from "fs";
import path from "path";
import express from "express";

interface RouteDefinition {
  method: string;
  path: string;
  handler: express.RequestHandler;
}
type AllowedMethods = "get" | "post" | "put" | "all" | "delete";
type AllowedMethodDefinitions = "get" | "post" | "put" | "all" | "del";

const ROUTE_FILE_NAME = "route";
const MIDDLEWARE_FILE_NAME = "middlewares.ts";
type Route = {
  method: string;
  path: string;
  handlers: any;
};

type Middleware = {
  methods: AllowedMethods[];
  include: string;
  exclude: string;
  handler: any;
};
const routeFileRegex = new RegExp(`${ROUTE_FILE_NAME}\.(ts|js|mjs)$`, "i");

export const loadRoutes = (
  app: express.Router,
  routePath = "routes",
  baseRoute = ""
) => {
  const normalizedPath = path.join(__dirname, routePath);
  const router = express.Router();
  let middlewareArray: Middleware[] = [];
  const middlewaresData = fs.statSync(
    path.join(normalizedPath, MIDDLEWARE_FILE_NAME),
    {
      throwIfNoEntry: false,
    }
  );
  if (middlewaresData?.isFile()) {
    console.log("is file");
    middlewareArray =
      require(path.join(normalizedPath, MIDDLEWARE_FILE_NAME))?.default ?? [];
  }
  console.log({ middlewareArray });

  fs.readdirSync(normalizedPath)?.forEach((file) => {
    const filePath = path.join(normalizedPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      console.log("hi", file);
      // Check if the folder name is in square brackets
      const folderName = file.match(/^\[(.+)\]$/);
      const dynamicParam = folderName ? `:${folderName[1]}` : file;

      loadRoutes(
        app,
        path.join(routePath, file),
        `${baseRoute}/${dynamicParam}`
      );
    } else if (routeFileRegex.test(file)) {
      console.log("hey");
      const routeModule = require(filePath);

      // Assume that each function exported in the module is a route handler
      Object.keys(routeModule).forEach((handlerName) => {
        const handler = routeModule[handlerName];

        // Check if the handler is a function
        if (typeof handler === "function") {
          console.log("handel");
          // Extract the HTTP method from the handler name (e.g., "getUsers" => "get")
          const methodMatch = handlerName.match(/^(get|post|put|all|delete)/i);
          const method = methodMatch
            ? (methodMatch[1].toLowerCase() as AllowedMethods)
            : "all";

          console.log({ method, baseRoute });
          const matchingMiddlewares = middlewareArray
            ?.filter((middleware) => {
              return (
                middleware.methods.includes(method) &&
                middleware.include.includes(baseRoute) &&
                !middleware.exclude.includes(baseRoute)
              );
            })
            ?.map((middleware) => middleware.handler);

          // Extract the path from the handler name (e.g., "getUsers" => "/users")
          // const path = `/${handlerName
          //   .replace(/([a-z])([A-Z])/g, "$1-$2")
          //   .toLowerCase()}`;
          // \.(ts|js|mjs)$
          // file.toLowerCase()

          router[method as AllowedMethods](
            baseRoute,
            ...matchingMiddlewares,
            handler
          );
        }
      });
    }
  });
  app.use("", router);
};
