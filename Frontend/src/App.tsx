import React, { useState, useMemo, useEffect } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

// Define the Item type
interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  created_at: string;
  status: "lost" | "found" | "returned";
  contact: string;
  claimcode: string;
  image: string;
}

const Icons = {
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),

  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),

  List: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  
  // Add a Return/Checkmark icon for returned items
  Returned: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
};

// MetaRow
interface MetaRowProps {
  iconType: "tag" | "pin" | "cal";
  children: React.ReactNode;
}

function MetaRow({ iconType, children }: MetaRowProps) {
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

// Claim Modal
interface ClaimModalProps {
  item: Item;
  onConfirm: (claimcode: string) => void;
  onClose: () => void;
}

function ClaimModal({ item, onConfirm, onClose }: ClaimModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!code.trim()) {
      setError("Please enter a claim code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5000/items/${item.id}/verify-claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claimcode: code.trim().toUpperCase() })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("✅ Claim verified! Item marked as returned.");
        onConfirm(code.trim().toUpperCase());
        onClose();
      } else {
        setError(data.error || "Incorrect claim code");
      }
    } catch (error) {
      console.error("Error verifying claim:", error);
      setError("Failed to verify claim. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="claim-modal">
        <button className="claim-modal-close" onClick={onClose}>✕</button>
        
        <h2 className="claim-title">
          {item.status === "lost" ? "Claim Lost Item" : "Claim Found Item"}
        </h2>
        
        <p className="claim-instruction">
          Enter the claim code to verify this item
        </p>
        
        <input
          className="claim-input"
          placeholder="Enter Secret Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />
        
        {error && <p className="claim-error">{error}</p>}
        
        <div className="claim-footer">
          <button className="claim-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="claim-btn-confirm" onClick={submit} disabled={loading}>
            {loading ? "Verifying..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Item Card
interface ItemCardProps {
  item: Item;
  onMarkClaimed: (id: number, claimcode: string) => void;
}

function ItemCard({ item, onMarkClaimed }: ItemCardProps) {
  const [showClaim, setShowClaim] = useState(false);

  const handleConfirm = (claimcode: string) => {
    onMarkClaimed(item.id, claimcode);
    setShowClaim(false);
  };

  return (
    <>
      <div className="card">
        <div className="card-img-wrap">
          <img 
            className="card-img" 
            src={item.image || "/placeholder-image.jpg"} 
            alt={item.title} 
          />
          <span className={`status-badge ${item.status}`}>
            {item.status === "lost" ? "Lost" : 
             item.status === "found" ? "Found" : "Returned"}
          </span>
        </div>

        <div className="card-body">
          <h3 className="card-title">{item.title}</h3>
          <p className="card-desc">{item.description}</p>
          
          <MetaRow iconType="tag">{item.category}</MetaRow>
          <MetaRow iconType="pin">{item.location}</MetaRow>
          <MetaRow iconType="cal">
            {new Date(item.created_at).toLocaleDateString()}
          </MetaRow>

          {/* Show different buttons based on status */}
          {(item.status === "lost" || item.status === "found") && (
            <button
              className={`btn-mark-claimed ${item.status}`}
              onClick={() => setShowClaim(true)}
            >
              <Icons.Check />
              {item.status === "lost" ? "Mark as Found" : "Mark as Returned"}
            </button>
          )}

          {item.status === "returned" && (
            <div className="returned-badge">
              <Icons.Returned />
              <span>Returned successfully</span>
            </div>
          )}
        </div>
      </div>

      {showClaim && (
        <ClaimModal
          item={item}
          onConfirm={handleConfirm}
          onClose={() => setShowClaim(false)}
        />
      )}
    </>
  );
}

// MAIN APP
export default function App() {
  const navigate = useNavigate();
  
  // CHANGED: Added "returned" as a tab option
  const [tab, setTab] = useState<"lost" | "found" | "returned">("lost");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/items");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  // CHANGED: Added returnedCount
  const lostCount = items.filter((i) => i.status === "lost").length;
  const foundCount = items.filter((i) => i.status === "found").length;
  const returnedCount = items.filter((i) => i.status === "returned").length;

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (i) =>
        i.status === tab &&
        (!q ||
          [i.title, i.description, i.location, i.category].some((f) =>
            f?.toLowerCase().includes(q)
          ))
    );
  }, [items, tab, query]);

  const markClaimed = async (id: number, claimcode: string) => {
    // Refresh the items list after claiming
    await fetchItems();
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="brand-title">Lost &amp; Found</h1>
          <p className="brand-sub">
            Help reunite people with their belongings
          </p>
        </div>
        <button className="btn-report" onClick={() => navigate("/report")}>
          <Icons.Plus />
          Report Item
        </button>
      </header>

      <main className="main">
        <div className="tab-row">
          <div className="tab-switcher">
            {[
              ["lost", lostCount, "Lost Items"],
              ["found", foundCount, "Found Items"],
              ["returned", returnedCount, "Returned Items"],
            ].map(([type, count, label]) => (
              <button
                key={type}
                className={`tab-btn tab-${type} ${
                  tab === type ? `active-${type}` : ""
                }`}
                onClick={() => setTab(type as "lost" | "found" | "returned")}
              >
                <Icons.List />
                {label}
                <span className="tab-badge">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="search-wrapper">
          <span className="search-icon">
            <Icons.Search />
          </span>
          <input
            className="search-input"
            placeholder="Search items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="items-grid">
          {loading ? (
            <div className="loading">
              <p>Loading items...</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="no-results">
              <p>No {tab} items found</p>
            </div>
          ) : (
            visible.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onMarkClaimed={markClaimed}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}