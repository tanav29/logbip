import { auth } from "@/lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { handle } from 'hono/vercel'
import { prisma } from "@/lib/prisma";
import type { Context } from "hono";

const app = new Hono().basePath('/api')

app.use("*", logger());
app.use("*", cors({ origin: (origin) => origin ?? "*", credentials: true }));

app.on(['POST', 'GET'], '/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app.get("/health", (c) => c.json({ status: "ok" }));

async function getUser(c: Context) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  return session?.user ?? null;
}

app.patch("/paths/:pathId/entries/:entryId", async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json<{ date?: string; content?: string; note?: string }>();
  const date = String(body.date ?? "").trim();
  const content = String(body.content ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !content || content.length > 5000)
    return c.json({ error: "Invalid log entry." }, 400);
  const entry = await prisma.entry.findFirst({ where: { id: c.req.param("entryId"), pathId: c.req.param("pathId"), userId: user.id } });
  if (!entry) return c.json({ error: "Log not found." }, 404);
  const duplicate = await prisma.entry.findFirst({ where: { pathId: entry.pathId, date, NOT: { id: entry.id } }, select: { id: true } });
  if (duplicate) return c.json({ error: "A log already exists for that date." }, 400);
  await prisma.entry.update({ where: { id: entry.id }, data: { date, content, note: String(body.note ?? "").trim() || null } });
  return c.json({ ok: true });
});

app.delete("/paths/:pathId/entries/:entryId", async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const entry = await prisma.entry.findFirst({ where: { id: c.req.param("entryId"), pathId: c.req.param("pathId"), userId: user.id }, select: { id: true } });
  if (!entry) return c.json({ error: "Log not found." }, 404);
  await prisma.entry.delete({ where: { id: entry.id } });
  return c.json({ ok: true });
});

// app.get("/paths", async (c) => c.json({ paths: await listUserPaths(c.get("user").id) }));

// app.get("/paths/:id", async (c) => {
//   const result = await getUserPath(c.get("user").id, c.req.param("id"));
//   if (!result) return c.json({ error: "Path not found" }, 404);
//   return c.json({ ...result, stats: calculateStats(result.entries.map((entry) => entry.date)) });
// });

// app.post("/paths", async (c) => {
//   try {
//     const body = await c.req.json<{
//       id?: string;
//       title?: string;
//       description?: string;
//       isPublic?: boolean;
//     }>();
//     const result = await savePathForUser(c.get("user").id, {
//       id: body.id,
//       title: body.title ?? "",
//       description: body.description,
//       isPublic: body.isPublic ?? true,
//     });
//     return c.json(result, body.id ? 200 : 201);
//   } catch (error) {
//     return c.json({ error: error instanceof Error ? error.message : "Unable to save path." }, 400);
//   }
// });

// app.post("/paths/:id/entries", async (c) => {
//   try {
//     const body = await c.req.json<{ date?: string; content?: string; note?: string }>();
//     const id = await saveEntryForUser(c.get("user").id, {
//       pathId: c.req.param("id"),
//       date: body.date ?? "",
//       content: body.content ?? "",
//       note: body.note,
//     });
//     return c.json({ id }, 201);
//   } catch (error) {
//     return c.json({ error: error instanceof Error ? error.message : "Unable to save entry." }, 400);
//   }
// });

// app.patch("/paths/:id/entries/:entryId", async (c) => {
//   try {
//     const body = await c.req.json<{ date?: string; content?: string; note?: string }>();
//     await updateEntryForUser(c.get("user").id, c.req.param("entryId"), {
//       date: body.date ?? "",
//       content: body.content ?? "",
//       note: body.note,
//     });
//     return c.json({ ok: true });
//   } catch (error) {
//     return c.json(
//       { error: error instanceof Error ? error.message : "Unable to update entry." },
//       400,
//     );
//   }
// });

// app.delete("/paths/:id", async (c) => {
//   try {
//     await deletePathForUser(c.get("user").id, c.req.param("id"));
//     return c.json({ ok: true });
//   } catch (error) {
//     return c.json(
//       { error: error instanceof Error ? error.message : "Unable to delete path." },
//       404,
//     );
//   }
// });

// app.delete("/paths/:id/entries/:entryId", async (c) => {
//   try {
//     await deleteEntryForUser(c.get("user").id, c.req.param("entryId"));
//     return c.json({ ok: true });
//   } catch (error) {
//     return c.json(
//       { error: error instanceof Error ? error.message : "Unable to delete entry." },
//       404,
//     );
//   }
// });

// app.get("/public/:slug", async (c) => {
//   const result = await getPublicPath(c.req.param("slug"));
//   if (!result) return c.json({ error: "Path not found" }, 404);
//   return c.json({ ...result, stats: calculateStats(result.entries.map((entry) => entry.date)) });
// });



// route.route("/", app);

export const GET = handle(app)
export const POST = handle(app)
