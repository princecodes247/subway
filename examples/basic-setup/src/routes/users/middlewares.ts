import express from "express";
const middlewares: {
  handler: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
  methods: "get"[];
  include: string[];
  exclude: string[];
}[] = [
  {
    handler: (req: express.Request, res: express.Response, next) => {
      console.log("it nack!!");
      next();
    },
    methods: ["get"],
    include: ["/users"],
    exclude: [],
  },
];

export default middlewares;
