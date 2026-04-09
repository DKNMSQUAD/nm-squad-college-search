const Masthead = ({ colleges }) => {
  const countryCount = new Set(colleges.map((c) => c.region).filter(Boolean)).size;
  const collegeCount = colleges.length;
  return (
    <header style={{ padding: "32px 48px 24px", borderBottom: "2px solid var(--ink)" }}>
      {/* Top row: logo + title left, taglines right */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img src="/nm-logo.png" alt="NM Squad" style={{ height: 64, width: 64, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3.2vw, 46px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-1.5px" }}>
            College Search
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 2.4vw, 36px)", fontWeight: 700, fontStyle: "italic", color: "var(--accent)", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
            By NM Squad
          </div>
        </div>
        {/* Right side taglines */}
        <div style={{ flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", gap: 5 }}>
          {["Intelligence Reports", "Application Strategy", "College Research"].map((t) => (
            <div key={t} style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace" }}>{t}</div>
          ))}
        </div>
      </div>
      {/* Stats bar */}
      <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: "var(--ink)", letterSpacing: "0.04em" }}>
          4 Categories
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "var(--muted)", margin: "0 10px" }}>
          &#x2192;
        </span>
        {[
          { val: `${countryCount} Countries`, color: "var(--accent2)" },
          { val: `${collegeCount} Colleges`,  color: "var(--accent)"  },
          { val: "1,000s Courses",            color: "var(--accent3)" },
          { val: "Counselor Neeraj Mandhana", color: "#8e44ad"       },
        ].map(({ val, color }, i) => (
          <span key={val} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, display: "inline-flex", alignItems: "center" }}>
            {i > 0 && <span style={{ color: "var(--border)", margin: "0 10px" }}>|</span>}
            <strong style={{ color, fontWeight: 600 }}>{val}</strong>
          </span>
        ))}
      </div>
    </header>
  );
};
export default Masthead;
