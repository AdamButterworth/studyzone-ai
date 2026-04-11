import { NextRequest } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_AI_API_KEY!;

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("video_id");

  if (!videoId) {
    return Response.json({ error: "video_id required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!res.ok) {
      return Response.json({ error: "YouTube API failed" }, { status: 502 });
    }

    const data = await res.json();
    const item = data.items?.[0];

    if (!item) {
      return Response.json({ error: "Video not found" }, { status: 404 });
    }

    return Response.json({
      title: item.snippet.title,
      description: item.snippet.description?.slice(0, 200) || "",
      channel: item.snippet.channelTitle,
    });
  } catch {
    return Response.json({ error: "Failed to fetch video info" }, { status: 500 });
  }
}
