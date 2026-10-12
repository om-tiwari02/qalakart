import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodSchema } from "zod";

type AnySchema = ZodSchema<any>;

export function validate(schema: AnySchema | { body?: AnySchema; query?: AnySchema; params?: AnySchema }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Check if the schema is a ZodSchema (has .parse) with a shape containing body/params/query
      if ("parse" in schema && typeof (schema as any).parse === "function") {
        // It's a full Zod schema like z.object({ body: ..., params: ... })
        const result = (schema as AnySchema).parse({
          body: req.body,
          params: req.params,
          query: req.query
        });
        if (result.body) req.body = result.body;
        if (result.query) {
          Object.defineProperty(req, "query", {
            value: result.query,
            configurable: true,
            enumerable: true
          });
        }
        if (result.params) {
          for (const key of Object.keys(req.params)) delete req.params[key];
          Object.assign(req.params, result.params);
        }
      } else {
        // Legacy format: { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
        const opts = schema as { body?: AnySchema; query?: AnySchema; params?: AnySchema };
        if (opts.body) {
          req.body = opts.body.parse(req.body);
        }
        if (opts.query) {
          const parsed = opts.query.parse(req.query);
          Object.defineProperty(req, "query", {
            value: parsed,
            configurable: true,
            enumerable: true
          });
        }
        if (opts.params) {
          const parsed = opts.params.parse(req.params);
          for (const key of Object.keys(req.params)) delete req.params[key];
          Object.assign(req.params, parsed);
        }
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
      throw e;
    }
  };
}
