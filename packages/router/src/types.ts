import { RequestHandler } from "express";

export interface RouteDefinition {
  method: string;
  path: string;
  handler: RequestHandler;
}
export type AllowedMethods = "get" | "post" | "put" | "all" | "delete";
export type AllowedMethodDefinitions = "get" | "post" | "put" | "all" | "del";

export type Route = {
  method: string;
  path: string;
  handlers: any;
};

export type Middleware = {
  methods: AllowedMethods[];
  handler: RequestHandler;
  include?: string | string[];
  exclude?: string | string[];
};
