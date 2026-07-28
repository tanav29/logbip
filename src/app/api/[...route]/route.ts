import { Hono } from "hono";
import { handle } from "hono/vercel";
import app from "@/../server/index";

const route = new Hono();
route.route("/", app);

export const GET = handle(route);
export const POST = handle(route);
export const PATCH = handle(route);
export const DELETE = handle(route);
