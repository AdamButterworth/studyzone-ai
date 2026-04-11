import { NextRequest } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(req: NextRequest) {
  try {
    const { video_id } = await req.json();

    if (!video_id) {
      return Response.json({ error: "video_id required" }, { status: 400 });
    }

    const segments = await YoutubeTranscript.fetchTranscript(video_id);

    // Transform to our format (offset/duration already in ms from youtube-transcript)
    const transcript = segments.map((seg) => ({
      text: seg.text,
      offset: Math.round(seg.offset),
      duration: Math.round(seg.duration),
    }));

    // Build full text for AI processing
    const rawText = segments.map((seg) => seg.text).join(" ");

    return Response.json({ transcript, rawText });
  } catch (err) {
    console.error("Transcript fetch error:", err);
    return Response.json(
      { error: "Failed to fetch transcript. The video may not have captions available." },
      { status: 500 }
    );
  }
}
