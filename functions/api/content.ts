import { createAuth } from "../lib/auth";

interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  GITHUB_TOKEN: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
}

interface ContentRequest {
  file: string;
  content: unknown;
  message?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Verify admin session
  const auth = createAuth(context.env);
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const role = (session.user as Record<string, unknown>).role;
  if (role !== "admin") {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse request
  const body = (await context.request.json()) as ContentRequest;
  const { file, content, message } = body;

  if (!file || content === undefined) {
    return new Response(JSON.stringify({ error: "file and content required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate file path is within allowed data directory
  const allowedPaths = [
    "website/public/data/club.json",
    "website/public/data/teams.json",
    "website/public/data/committee.json",
    "website/public/data/news.json",
    "website/public/data/registration.json",
    "website/public/data/matchday.json",
    "website/public/data/gallery.json",
  ];

  if (!allowedPaths.includes(file)) {
    return new Response(JSON.stringify({ error: "Invalid file path" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const repo = context.env.GITHUB_REPO ?? "adamsuk/ELBantams";
  const branch = context.env.GITHUB_BRANCH ?? "main";
  const token = context.env.GITHUB_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ error: "GitHub token not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get current file SHA (required for updates)
    const getRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${file}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ELBantams-CMS",
        },
      }
    );

    let sha: string | undefined;
    if (getRes.ok) {
      const existing = (await getRes.json()) as { sha: string };
      sha = existing.sha;
    }

    // Commit the file
    const encoded = btoa(
      unescape(encodeURIComponent(JSON.stringify(content, null, 2) + "\n"))
    );

    const putRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${file}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "ELBantams-CMS",
        },
        body: JSON.stringify({
          message: message ?? `Update ${file.split("/").pop()} via CMS`,
          content: encoded,
          sha,
          branch,
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.text();
      return new Response(
        JSON.stringify({ error: "GitHub API error", details: err }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = (await putRes.json()) as { commit: { sha: string } };
    return new Response(
      JSON.stringify({ ok: true, commit: result.commit.sha }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to commit", details: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
