import fs from "fs";
import path from "path";
import express, { RequestHandler } from "express";
import { AllowedMethods, Middleware, RouteDefinition } from "./types";

const ROUTE_FILE_NAME = "route";
const MIDDLEWARE_FILE_NAME = "middlewares.ts";

const routeFileRegex = new RegExp(`${ROUTE_FILE_NAME}\.(ts|js)$`, "i");

export default function loadRoutes(
  app: express.Router,
  routePath = "routes",
  baseRoute = "",
  globalMiddlewares: Omit<Middleware, "methods">[] = []
) {
  const normalizedPath = path.join(__dirname, routePath);
  console.log({ normalizedPath });
  const router = express.Router();

  // Apply global middleware to every route
  globalMiddlewares.forEach(({ handler, include, exclude }) => {
    if (!include || (Array.isArray(include) && include.includes(baseRoute))) {
      if (
        !exclude ||
        (Array.isArray(exclude) && !exclude.includes(baseRoute))
      ) {
        router.use(handler);
      }
    }
  });

  const middlewareArray = loadMiddlewares(normalizedPath);

  fs.readdirSync(normalizedPath)?.forEach((file) => {
    const filePath = path.join(normalizedPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Check if the folder name is in square brackets denoting version
      const versionMatch = file.match(/^\[v(.+)\]$/);
      const version = versionMatch ? versionMatch[1] : null;

      // If version is present, load routes with version prefix
      if (version) {
        loadRoutes(app, path.join(routePath, file), `${baseRoute}/v${version}`);
      } else {
        // Check if the folder name is in square brackets
        const folderName = file.match(/^\[(.+)\]$/);
        const dynamicParam = folderName ? `:${folderName[1]}` : file;

        loadRoutes(
          app,
          path.join(routePath, file),
          `${baseRoute}/${dynamicParam}`
        );
      }
    } else if (routeFileRegex.test(file)) {
      const routeModule = require(filePath);

      // Assume that each function exported in the module is a route handler
      Object.keys(routeModule).forEach((handlerName) => {
        const handler = routeModule[handlerName];

        // Check if the handler is a function
        if (typeof handler === "function") {
          // Extract the HTTP method from the handler name (e.g., "getUsers" => "get")
          const methodMatch = handlerName.match(/^(get|post|put|all|delete)/i);
          const method = methodMatch
            ? (methodMatch[1].toLowerCase() as AllowedMethods)
            : "all";

          console.log({ method, baseRoute });
          const matchingMiddlewares = middlewareArray
            ?.filter((middleware) => {
              return (
                (middleware.methods.includes(method) && !middleware.include) ||
                (Array.isArray(middleware.include) &&
                  middleware.include.includes(baseRoute) &&
                  !middleware.exclude) ||
                (Array.isArray(middleware.exclude) &&
                  !middleware.exclude.includes(baseRoute))
              );
            })
            ?.map((middleware) => middleware.handler);

          // Extract the path from the handler name (e.g., "getUsers" => "/users")
          // const path = `/${handlerName
          //   .replace(/([a-z])([A-Z])/g, "$1-$2")
          //   .toLowerCase()}`;
          // \.(ts|js|mjs)$
          // file.toLowerCase()
          console.log(
            `${baseRoute} - ${method} with ${matchingMiddlewares.length} middlewares registered!`
          );
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
}

function loadMiddlewares(
  normalizedPath: string,
  fileName: string = MIDDLEWARE_FILE_NAME
) {
  /* Load the scoped middleware functions from a given file located in the current scope*/
  let middlewareArray: Middleware[] = [];
  const middlewaresData = fs.statSync(path.join(normalizedPath, fileName), {
    throwIfNoEntry: false,
  });
  if (middlewaresData?.isFile()) {
    middlewareArray =
      require(path.join(normalizedPath, fileName))?.default ?? [];
  }
  console.log({ middlewareArray });
  return middlewareArray;
}
