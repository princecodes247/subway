// decorators.ts
import "reflect-metadata";
import { AllowedMethods } from "./types";

export const RouteMetadata = (
  method: AllowedMethods,
  path: string,
  description?: string,
  tags?: string[]
) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const routeMetadata = Reflect.getMetadata("routes", target) || [];
    routeMetadata.push({
      method,
      path,
      description,
      tags,
      handler: descriptor.value,
    });
    Reflect.defineMetadata("routes", routeMetadata, target);
  };
};
