const Masthead = ({ colleges }) => {
  const countryCount = new Set(colleges.map((c) => c.region).filter(Boolean)).size;
  const collegeCount = colleges.length;
  return (
    <header style={{ padding: "32px 48px 24px", borderBottom: "2px solid var(--ink)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img src="/nm-logo.png" alt="NM Squad" style={{ height: 64, width: 64, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3.2vw, 46px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-1.5px" }}>
            College Search
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 2.4vw, 36px)", fontWeight: 700, fontStyle: "italic", color: "#9F978C", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
            By NM Squad
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { val: countryCount + " Countries", color: "#9F978C" },
            { val: collegeCount + " Colleges",  color: "#9F978C" },
            { val: "1,000s Courses",             color: "#9F978C" },
            { val: "Counselor Neeraj Mandhana",  color: "#9F978C" },
          ].map(({ val, color }) => (
            <div key={val} style={{ fontSize: 10, color, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{val}</div>
          ))}
        </div>
      </div>
    </header>
  );
};
export default Masthead;
