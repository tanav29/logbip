import { cors } from "hono/cors";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { calculateStats } from "@/lib/stats";
import {
  destroySession,
  deleteEntryForUser,
  deletePathForUser,
  getCurrentUser,
  getPublicPath,
  getUserPath,
  listUserPaths,
  loginUser,
  registerUser,
  saveEntryForUser,
  savePathForUser,
  updateEntryForUser,
} from "./services";

type Variables = { user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> };
const app = new Hono<{ Variables: Variables }>().basePath("/api");

app.use("*", logger());
app.use("*", cors({ origin: (origin) => origin ?? "*", credentials: true }));

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/me", async (c) => c.json({ user: await getCurrentUser() }));

app.post("/auth/register", async (c) => {
  try {
    const body = await c.req.json<{ name?: string; email?: string; password?: string }>();
    const user = await registerUser(
      body.name?.trim() ?? "",
      body.email?.trim() ?? "",
      body.password ?? "",
    );
    return c.json({ user }, 201);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to register." }, 400);
  }
});

app.post("/auth/login", async (c) => {
  try {
    const body = await c.req.json<{ email?: string; password?: string }>();
    const user = await loginUser(body.email?.trim() ?? "", body.password ?? "");
    return c.json({ user });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to sign in." }, 401);
  }
});

app.post("/auth/logout", async (c) => {
  await destroySession();
  return c.json({ ok: true });
});


app.use("/paths/*", async (c, next) => {
  const user = await getCurrentUser();
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  c.set("user", user);
  await next();
});

app.get("/paths", async (c) => c.json({ paths: await listUserPaths(c.get("user").id) }));

app.get("/paths/:id", async (c) => {
  const result = await getUserPath(c.get("user").id, c.req.param("id"));
  if (!result) return c.json({ error: "Path not found" }, 404);
  return c.json({ ...result, stats: calculateStats(result.entries.map((entry) => entry.date)) });
});

app.post("/paths", async (c) => {
  try {
    const body = await c.req.json<{
      id?: string;
      title?: string;
      description?: string;
      isPublic?: boolean;
    }>();
    const result = await savePathForUser(c.get("user").id, {
      id: body.id,
      title: body.title ?? "",
      description: body.description,
      isPublic: body.isPublic ?? true,
    });
    return c.json(result, body.id ? 200 : 201);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to save path." }, 400);
  }
});

app.post("/paths/:id/entries", async (c) => {
  try {
    const body = await c.req.json<{ date?: string; content?: string; note?: string }>();
    const id = await saveEntryForUser(c.get("user").id, {
      pathId: c.req.param("id"),
      date: body.date ?? "",
      content: body.content ?? "",
      note: body.note,
    });
    return c.json({ id }, 201);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unable to save entry." }, 400);
  }
});

app.patch("/paths/:id/entries/:entryId", async (c) => {
  try {
    const body = await c.req.json<{ date?: string; content?: string; note?: string }>();
    await updateEntryForUser(c.get("user").id, c.req.param("entryId"), {
      date: body.date ?? "",
      content: body.content ?? "",
      note: body.note,
    });
    return c.json({ ok: true });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unable to update entry." },
      400,
    );
  }
});

app.delete("/paths/:id", async (c) => {
  try {
    await deletePathForUser(c.get("user").id, c.req.param("id"));
    return c.json({ ok: true });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unable to delete path." },
      404,
    );
  }
});

app.delete("/paths/:id/entries/:entryId", async (c) => {
  try {
    await deleteEntryForUser(c.get("user").id, c.req.param("entryId"));
    return c.json({ ok: true });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unable to delete entry." },
      404,
    );
  }
});

app.get("/public/:slug", async (c) => {
  const result = await getPublicPath(c.req.param("slug"));
  if (!result) return c.json({ error: "Path not found" }, 404);
  return c.json({ ...result, stats: calculateStats(result.entries.map((entry) => entry.date)) });
});

export default app;
