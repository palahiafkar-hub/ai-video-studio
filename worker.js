
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff"
        }
      });

    // Pemeriksaan kesehatan aplikasi
    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({
        ok: true,
        aiConfigured: Boolean(
          env.OPENAI_API_KEY && env.OPENAI_MODEL
        ),
        app: "AI Video Studio V9",
        hosting: "Cloudflare Workers"
      });
    }

    // Endpoint AI
    if (
      url.pathname === "/api/generate" ||
      url.pathname === "/api/revise"
    ) {
      if (request.method !== "POST") {
        return json({ error: "Metode tidak diizinkan." }, 405);
      }

      if (!env.OPENAI_API_KEY || !env.OPENAI_MODEL) {
        return json({
          error: "AI belum dikonfigurasi. Admin perlu mengatur OPENAI_API_KEY dan OPENAI_MODEL di Cloudflare."
        }, 503);
      }

      try {
        const length = Number(
          request.headers.get("content-length") || 0
        );

        if (length > 160000) {
          return json({ error: "Ukuran permintaan terlalu besar." }, 413);
        }

        const payload = await request.json();

        if (
          typeof payload.prompt !== "string" ||
          !payload.prompt.trim()
        ) {
          return json({ error: "Prompt tidak boleh kosong." }, 400);
        }

        if (new TextEncoder().encode(
          JSON.stringify(payload)
        ).length > 160000) {
          return json({ error: "Ukuran permintaan terlalu besar." }, 413);
        }

        const provider = await fetch(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.OPENAI_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: env.OPENAI_MODEL,
              input: payload.prompt
            }),
            signal: AbortSignal.timeout(90000)
          }
        );

        const raw = await provider.text();

        if (!provider.ok) {
          let parsed = {};
          try {
            parsed = JSON.parse(raw);
          } catch {}

          return json({
            error: parsed.error?.message || "AI provider gagal."
          }, provider.status >= 500 ? 502 : provider.status);
        }

        return new Response(raw, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff"
          }
        });

      } catch (error) {
        return json({
          error: error.message || "Permintaan AI gagal."
        }, 502);
      }
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "Endpoint tidak ditemukan." }, 404);
    }

    return env.ASSETS.fetch(request);
  }
};
