import { useState, useMemo } from "react";
import Masthead from "./components/Masthead";
import FiltersBar from "./components/FiltersBar";
import CollegeGrid from "./components/CollegeGrid";
import ReportModal from "./components/ReportModal";
import { COLLEGES } from "./data/colleges";
import { usePurchases } from "./hooks/usePurchases";

function App() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ region: null, size: null, major: null, chance: null });
  const [selected, setSelected] = useState(null);
  const { hasPurchased, addPurchase } = usePurchases();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return COLLEGES.filter((c) => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.majors.some((m) => m.toLowerCase().includes(q));
      const matchRegion = !filters.region || c.region === filters.region;
      const matchSize = !filters.size || c.size === filters.size;
      const matchMajor = !filters.major || c.majors.includes(filters.major);
      const matchChance = !filters.chance || c.chance === filters.chance;
      return matchSearch && matchRegion && matchSize && matchMajor && matchChance;
    });
  }, [search, filters]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Masthead filteredCount={filtered.length} />
      <FiltersBar search={search} setSearch={setSearch} filters={filters} setFilters={setFilters} />
      <CollegeGrid colleges={filtered} hasPurchased={hasPurchased} onViewReport={setSelected} />

      <footer style={{
        padding: "32px 48px", borderTop: "1px solid var(--border)", marginTop: 48,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 10, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        <span>NM Squad College Command Centre · v1.0</span>
        <span>Intelligence Reports · Stripe Test Mode</span>
      </footer>

      {selected && (
        <ReportModal
          college={selected}
          hasPurchased={hasPurchased}
          onPurchase={addPurchase}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default App;
