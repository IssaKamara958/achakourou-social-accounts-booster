import { handleRequest } from "@netlify/remix-adapter";
import type { Context } from "@netlify/edge-functions";
import * as build from "@remix-run/dev/server-build";

export default (req: Request, context: Context) => handleRequest(req, build, context);
