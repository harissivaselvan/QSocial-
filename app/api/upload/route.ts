import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const MAX = 2 * 1024 * 1024;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Compressed image is too large" }, { status: 413 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Images only" }, { status: 415 });

  const account = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET_NAME;
  const access = process.env.R2_ACCESS_KEY_ID;
  const secret = process.env.R2_SECRET_ACCESS_KEY;
  if (!account || !bucket || !access || !secret) return NextResponse.json({ error: "R2 is not configured" }, { status: 503 });

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${account}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: access, secretAccessKey: secret }
  });

  const key = `posts/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: file.type }));
  return NextResponse.json({ key });
}