export async function POST(req) {
  try {
    const { password } = await req.json();
    const appPassword = process.env.APP_PASSWORD;

    if (!appPassword) {
      return Response.json(
        { error: "APP_PASSWORD is not configured on the server." },
        { status: 500 }
      );
    }

    if (!password || password !== appPassword) {
      return Response.json({ error: "Incorrect password." }, { status: 401 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Invalid login request." }, { status: 400 });
  }
}
