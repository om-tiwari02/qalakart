import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodSchema } from "zod";

type AnySchema = ZodSchema<any>;

export function validate(opts: { body?: AnySchema; query?: AnySchema; params?: AnySchema }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (opts.body) {
        req.body = opts.body.parse(req.body);
      }
      if (opts.query) {
        const parsed = opts.query.parse(req.query);
        for (const key of Object.keys(req.query)) delete req.query[key];
        Object.assign(req.query, parsed);
      }
      if (opts.params) {
        const parsed = opts.params.parse(req.params);
        for (const key of Object.keys(req.params)) delete req.params[key];
        Object.assign(req.params, parsed);
      }
      next();
    } catch (e: any) {
      if (e && e.name === "ZodError") {
        const zodErr = e as ZodError;
        const fields: Record<string, string[]> = {};
        for (const issue of zodErr.issues ?? []) {
          const key = issue.path.join(".") || "_";
          fields[key] = fields[key] ?? [];
          fields[key].push(issue.message);
        }

        const err = new Error("Validation failed") as Error & {
          statusCode?: number;
          code?: string;
          fields?: Record<string, string[]>;
        };
        err.statusCode = 400;
        err.code = "VALIDATION_ERROR";
        err.fields = fields;
        throw err;
      }
      // If it's not a ZodError (e.g. TypeError), throw it to be handled as a 500
      throw e;
    }
  };
}

