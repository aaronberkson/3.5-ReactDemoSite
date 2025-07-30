// handler.js
import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { execSync }                            from "child_process";
import { SESClient, SendRawEmailCommand }      from "@aws-sdk/client-ses";
import { v4 as uuidv4 }                        from "uuid";

const REGION = process.env.AWS_REGION  || "us-east-1";
const FROM   = process.env.EMAIL_FROM || "feedback@aaronberkson.io";
const TO     = process.env.EMAIL_TO   || "feedback@aaronberkson.io";

const ses = new SESClient({ region: REGION });

export async function handler(event) {
  console.log("[IO][handler] incoming event:", JSON.stringify(event));

  // 1) CORS preflight & Method Guard
  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === "OPTIONS") {
    console.log("[IO][handler] OPTIONS preflight – returning 200");
    return { statusCode: 200 };
  }
  if (method !== "POST") {
    console.warn("[IO][handler] Method not allowed:", method);
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 2) Parse JSON body
    console.log("[IO][handler] parsing JSON body");
    const body = JSON.parse(event.body || "{}");

    // 3) Extract fields + optional voice memo
    const fields = {
      formType      : (body.formType || "feedback").toLowerCase(),
      like          : body.like            || "",
      dislike       : body.dislike         || "",
      think         : body.think           || "",
      reply_to      : body.reply_to        || "",
      name          : body.name            || "",
      contactEmail  : body.email           || "",
      msg           : body.msg             || "",
      voiceB64      : body.voice           || null,
      voiceFilename : body.voiceFilename  || "",
      voiceMime     : body.voiceMime      || ""
    };
    console.log("[IO][handler] extracted fields:", {
      ...fields,
      voiceB64: fields.voiceB64 ? "[base64 data]" : null
    });

    // 4) Validation
    if (
      fields.formType === "feedback" &&
      !fields.like.trim() &&
      !fields.dislike.trim() &&
      !fields.think.trim() &&
      !fields.voiceB64
    ) {
      console.warn("[IO][handler] validation failed – no feedback content");
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Please fill in at least one of Like, Dislike, Thoughts, or record a memo."
        })
      };
    }

    // 5) Transcode WebM → MP3 if we have a voice memo
    if (fields.voiceB64) {
      console.log("[IO][handler] transcoding voice memo to MP3");
      const inPath   = "/tmp/input.webm";
      const outPath  = "/tmp/output.mp3";
      const ff       = "/opt/bin/ffmpeg";            // explicit layer binary
      const startTs  = Date.now();

      // write incoming WebM to disk
      writeFileSync(inPath, Buffer.from(fields.voiceB64, "base64"));
      console.log(`[IO][handler] ffmpeg start: ${startTs}`);

      // run ffmpeg – use 2 threads, fast VBR (~64 kbps), benchmark
      const cmd = [
        ff,
        "-benchmark",
        "-threads", "2",
        "-y",
        "-i", inPath,
        "-codec:a", "libmp3lame",
        "-q:a", "4",
        outPath
      ].join(" ");
      execSync(cmd, { stdio: "inherit" });

      const endTs = Date.now();
      console.log(`[IO][handler] ffmpeg end: ${endTs} (duration ${endTs - startTs} ms)`);

      // read the MP3 buffer back
      const mp3Buffer = readFileSync(outPath);

      // update fields for email attachment
      fields.voiceB64      = mp3Buffer.toString("base64");
      fields.voiceMime     = "audio/mpeg";
      fields.voiceFilename = fields.voiceFilename.replace(/\.\w+$/, ".mp3");

      // clean up temp files
      unlinkSync(inPath);
      unlinkSync(outPath);

      console.log("[IO][handler] transcoding complete:", fields.voiceFilename);
    }

    // 6) Choose subject
    const subjectMap = {
      feedback: "📣 Feedback Form Submission",
      message : "📩 Contact Form Submission"
    };
    const subject = subjectMap[fields.formType] || "📬 Form Submission";
    console.log("[IO][handler] email subject:", subject);

    // 7) Build HTML body
    let bodyHtml = "";
    if (fields.formType === "feedback") {
      if (fields.like)     bodyHtml += `<p><strong>😃 LIKE</strong><br/>${fields.like}</p>`;
      if (fields.dislike)  bodyHtml += `<p><strong>😤 DISLIKE</strong><br/>${fields.dislike}</p>`;
      if (fields.think)    bodyHtml += `<p><strong>🤔 THOUGHTS</strong><br/>${fields.think}</p>`;
      if (fields.reply_to) bodyHtml += `<p><strong>📧 EMAIL</strong><br/>${fields.reply_to}</p>`;
    } else if (fields.formType === "message") {
      if (fields.name)         bodyHtml += `<p><strong>👤 NAME</strong><br/>${fields.name}</p>`;
      if (fields.contactEmail) bodyHtml += `<p><strong>📧 EMAIL</strong><br/>${fields.contactEmail}</p>`;
      if (fields.msg)          bodyHtml += `<p><strong>💬 MESSAGE</strong><br/>${fields.msg}</p>`;
    } else {
      bodyHtml = Object.entries(fields)
        .filter(([k, v]) => v && !["voiceB64","voiceFilename","voiceMime"].includes(k))
        .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
        .join("");
    }
    console.log("[IO][handler] HTML body built");

    // 8) Assemble raw MIME with optional attachment
    const boundary = `----=_NextPart_${uuidv4()}`;
    console.log("[IO][handler] using boundary:", boundary);

    const headers = [
      `From: ${FROM}`,
      `To: ${TO}`,
      fields.reply_to && `Reply-To: ${fields.reply_to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`
    ].filter(Boolean);

    let raw = headers.join("\r\n") + "\r\n\r\n";
    raw +=
      `--${boundary}\r\n` +
      `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
      `<h2>${subject}</h2>${bodyHtml}\r\n\r\n`;

    if (fields.voiceB64) {
      console.log("[IO][handler] attaching voice memo:", fields.voiceFilename);
      raw +=
        `--${boundary}\r\n` +
        `Content-Type: ${fields.voiceMime}; name="${fields.voiceFilename}"\r\n` +
        `Content-Transfer-Encoding: base64\r\n` +
        `Content-Disposition: attachment; filename="${fields.voiceFilename}"\r\n\r\n` +
        fields.voiceB64 + "\r\n\r\n";
    }

    raw += `--${boundary}--`;
    console.log("[IO][handler] raw email assembled, size:", raw.length);

    // 9) Send via SES
    console.log("[IO][handler] sending RawEmail via SES");
    const command = new SendRawEmailCommand({
      RawMessage: { Data: Buffer.from(raw) }
    });
    const response = await ses.send(command);
    console.log("[IO][handler] SES response:", response);

    // 10) Return success
    return {
      statusCode: 200,
      body:       JSON.stringify({ ok: true, messageId: response.MessageId })
    };
  } catch (err) {
    console.error("[IO][handler] error:", err);
    return {
      statusCode: 500,
      body:       JSON.stringify({ error: err.message })
    };
  }
}
