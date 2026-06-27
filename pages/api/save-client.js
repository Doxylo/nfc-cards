export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // "Doxylo/nfc-cards"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function githubRequest(path, method, body) {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "GitHub API error");
  return data;
}

async function getFileSha(path) {
  try {
    const data = await githubRequest(path, "GET");
    return data.sha;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { password, client, photoBase64, photoExt } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Неверный пароль" });
  }

  try {
    // 1. Upload photo if provided
    let photoPath = null;
    if (photoBase64 && photoExt) {
      const filename = `${client.slug}.${photoExt}`;
      photoPath = `/photos/${filename}`;
      const githubPath = `/contents/public/photos/${filename}`;
      const existingSha = await getFileSha(githubPath);
      const base64Data = photoBase64.split(",")[1];
      await githubRequest(githubPath, "PUT", {
        message: `Add photo for ${client.slug}`,
        content: base64Data,
        ...(existingSha ? { sha: existingSha } : {}),
      });
    }

    // 2. Read current clients.json
    const fileData = await githubRequest("/contents/data/clients.json", "GET");
    const currentContent = JSON.parse(
      Buffer.from(fileData.content, "base64").toString("utf-8")
    );

    // 3. Add or update client
    const clientData = { ...client };
    if (photoPath) clientData.photo = photoPath;
    else if (!clientData.photo) clientData.photo = null;

    const existingIndex = currentContent.findIndex((c) => c.slug === client.slug);
    if (existingIndex >= 0) {
      currentContent[existingIndex] = clientData;
    } else {
      currentContent.push(clientData);
    }

    // 4. Save clients.json
    const newContent = Buffer.from(
      JSON.stringify(currentContent, null, 2)
    ).toString("base64");

    await githubRequest("/contents/data/clients.json", "PUT", {
      message: `Add/update client: ${client.slug}`,
      content: newContent,
      sha: fileData.sha,
    });

    res.status(200).json({ ok: true, slug: client.slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
