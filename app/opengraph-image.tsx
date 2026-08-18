import { ImageResponse } from "next/server";

export const runtime = "edge";
export const alt = "RallyUp — group trips, handled by text";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: "#f3f1eb", color: "#161719", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
      <div style={{ alignItems: "center", display: "flex", fontSize: 34, fontWeight: 700, gap: 14, letterSpacing: -2 }}>
        <div style={{ display: "flex", gap: 4, transform: "rotate(-18deg)" }}><i style={{ background: "#f26f50", borderRadius: 8, height: 28, width: 9 }} /><i style={{ background: "#161719", borderRadius: 8, height: 40, width: 9 }} /><i style={{ background: "#7da9dc", borderRadius: 8, height: 23, width: 9 }} /></div>
        RallyUp
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 78, fontWeight: 700, letterSpacing: -7, lineHeight: .9 }}>
        <span>Trips worth</span><span style={{ color: "#f26f50", fontFamily: "serif", fontStyle: "italic", fontWeight: 400 }}>the group chat.</span>
      </div>
      <div style={{ color: "#777773", display: "flex", fontSize: 25 }}>A travel concierge that lives in your texts.</div>
    </div>,
    { ...size },
  );
}
