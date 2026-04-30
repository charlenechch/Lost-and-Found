import React, { useState, useMemo } from "react";
import "./App.css";

const SAMPLE_ITEMS = [
  { id: 1, title: "iPhone 15 Pro", description: "Black iPhone 15 Pro with a blue case. Has a small scratch on the back.", category: "Electronics", location: "Student Center, Cafeteria", date: "2026-04-19", status: "lost", contact: "john.doe@email.com", claimCode: "LF-4821", image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&q=80" },
  { id: 2, title: "Brown Leather Wallet", description: "Contains ID and credit cards. Brown leather bifold wallet.", category: "Accessories", location: "Library, 3rd Floor", date: "2026-04-17", status: "lost", contact: "+60 12-345 6789", claimCode: "LF-7703", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80" },
  { id: 3, title: "Set of Keys", description: "Keychain with car key and house keys. Blue rubber keychain.", category: "Keys", location: "Parking Lot B", date: "2026-04-19", status: "lost",  contact: "sarah.k@gmail.com", claimCode: "LF-1190", image: "https://images.unsplash.com/photo-1605822105816-76b7cfd71142?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXlzJTIwa2V5Y2hhaW58ZW58MXx8fHwxNzc2NjY3MDM3fDA&ixlib=rb-4.1.0&q=80&w=400" },
  { id: 4, title: "Prescription Glasses", description: "Black frame glasses found in a blue case. Brand: Ray-Ban.", category: "Accessories", location: "Gym, Locker Room", date: "2026-04-19", status: "found", contact: "mike.tan@uni.edu", claimCode: "LF-3356", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&q=80" },
  { id: 5, title: "Blue North Face Jacket", description: "Size Medium blue puffer jacket with North Face logo.", category: "Clothing", location: "Building A, Room 201", date: "2026-04-18", status: "found", contact: "+60 16-999 0011", claimCode: "LF-6642", image: "https://images.unsplash.com/photo-1497340525489-441e8427c980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwamFja2V0fGVufDF8fHx8MTc3NjY2NzAzOHww&ixlib=rb-4.1.0&q=80&w=400" },
  { id: 6, title: "Student ID Card", description: "Student ID card found near the entrance.", category: "Documents", location: "Main Entrance", date: "2026-04-20", status: "found", contact: "reception@uni.edu", claimCode: "LF-2278", image: "https://images.unsplash.com/photo-1668903678359-e810dd966016?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwaWQlMjBjYXJkfGVufDF8fHx8MTc3NjY2NzAzOXww&ixlib=rb-4.1.0&q=80&w=400" },
];

const Icons = {
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  List: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Tag: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  Pin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Cal: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
};

function MetaRow({ iconType, children }) {
  return (
    <div className="meta-row">
      <span className={`meta-icon ${iconType}`}>
        {iconType === "tag" && <Icons.Tag />}
        {iconType === "pin" && <Icons.Pin />}
        {iconType === "cal" && <Icons.Cal />}
      </span>
      <span>{children}</span>
    </div>
  );
}

function ClaimModal({ item, onConfirm, onClose }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (code.trim().toUpperCase() === item.claimCode) {
      onConfirm();
    } else {
      setError("Incorrect code. Please check the code you received when you submitted this item.");
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="claim-modal">

        <button className="claim-modal-close" onClick={onClose}>✕</button>

        <div className="claim-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>

        <h2 className="claim-title">
          {item.status === "lost" ? "Mark as Found" : "Mark as Returned"}
        </h2>
        <p className="claim-subtitle">Enter your secret code to confirm this action</p>

        <label className="claim-label">Secret Code</label>
        <input
          className="claim-input"
          placeholder="Enter your code (e.g., LF-4821)"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
        />
        {error && <p className="claim-error">{error}</p>}

        <div className="claim-footer">
          <button className="claim-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="claim-btn-confirm" onClick={submit}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item, onMarkClaimed }) {
  const [showClaim, setShowClaim] = useState(false);
  const fallback = `https://placehold.co/400x220/eee/888?text=${encodeURIComponent(item.title)}`;

  const handleConfirm = () => {
    onMarkClaimed(item.id);
    setShowClaim(false);
  };

  return (
    <>
      <div className="card">
        <div className="card-img-wrap">
          <img
            className="card-img"
            src={item.image}
            alt={item.title}
            onError={(e) => { e.target.src = fallback; }}
          />
          <span className={`status-badge ${item.status}`}>
            {item.status === "lost" ? "Lost" : "Found"}
          </span>
        </div>

        <div className="card-body">
          <h3 className="card-title">{item.title}</h3>
          <p className="card-desc">{item.description}</p>

          <MetaRow iconType="tag">{item.category}</MetaRow>
          <MetaRow iconType="pin">{item.location}</MetaRow>
          <MetaRow iconType="cal">{item.date}</MetaRow>

          <div className="contact-row">
            <span className="contact-label">Contact:</span>
            <a
              className="contact-value"
              href={item.contact.includes("@") ? `mailto:${item.contact}` : `tel:${item.contact}`}
            >
              {item.contact}
            </a>
          </div>

          <button
            className={`btn-mark-claimed ${item.status}`}
            onClick={() => setShowClaim(true)}
          >
            <Icons.Check />
            {item.status === "lost" ? "Mark as Found" : "Mark as Returned"}
          </button>
        </div>
      </div>

      {showClaim && (
        <ClaimModal item={item} onConfirm={handleConfirm} onClose={() => setShowClaim(false)} />
      )}
    </>
  );
}

export default function App() {
  const [tab,    setTab]    = useState("lost");
  const [query,  setQuery]  = useState("");
  const [items, setItems] = useState(SAMPLE_ITEMS);

  const lostCount  = items.filter((i) => i.status === "lost").length;
  const foundCount = items.filter((i) => i.status === "found").length;

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((i) =>
      i.status === tab &&
      (!q || [i.title, i.description, i.location, i.category].some((f) => f.toLowerCase().includes(q)))
    );
  }, [items, tab, query]);

  const markClaimed = (id) => {
    setItems((prev) => prev.map((i) =>
      i.id === id ? { ...i, status: i.status === "lost" ? "found" : "claimed" } : i
    ));
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="brand-title">Lost &amp; Found</h1>
          <p className="brand-sub">Help reunite people with their belongings</p>
        </div>
        <button className="btn-report">
          <Icons.Plus /> Report Item
        </button>
      </header>

      <main className="main">
        <div className="tab-row">
          <div className="tab-switcher">
            {[["lost", lostCount], ["found", foundCount]].map(([type, count]) => (
              <button
                key={type}
                className={`tab-btn tab-${type} ${tab === type ? `active-${type}` : ""}`}
                onClick={() => setTab(type)}
              >
                <Icons.List />
                {type === "lost" ? "Lost Items" : "Found Items"}
                <span className="tab-badge">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="search-wrapper">
          <span className="search-icon"><Icons.Search /></span>
          <input
            className="search-input"
            placeholder="Search items by name, description, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="items-grid">
          {visible.length === 0 ? (
            <div className="no-results">
              <p>No {tab} items found</p>
              <p>{query ? `No results for "${query}"` : `No ${tab} items reported yet.`}</p>
            </div>
          ) : visible.map((item) => (
            <ItemCard key={item.id} item={item} onMarkClaimed={markClaimed} />
          ))}
        </div>
      </main>
    </div>
  );
}