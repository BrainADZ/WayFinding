"use client";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Store,
  Trash2,
} from "lucide-react";
import { Logo } from "../wayfinding/shared";

type Brand = {
  id: string;
  name: string;
  floorId: string;
  categoryId: string;
  unitNumber: string;
};
type Option = { id: string; name: string };
export function AdminPanel() {
  const [ready, setReady] = useState(false),
    [authenticated, setAuthenticated] = useState(false),
    [configured, setConfigured] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]),
    [floors, setFloors] = useState<Option[]>([]),
    [categories, setCategories] = useState<Option[]>([]);
  const [query, setQuery] = useState(""),
    [floor, setFloor] = useState("all"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/brands", { cache: "no-store" });
    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }
    const body = await response.json();
    setBrands(body.brands);
    setFloors(body.floors);
    setCategories(body.categories);
    setAuthenticated(true);
  }, []);
  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then(async (body) => {
        setConfigured(body.configured);
        setAuthenticated(body.authenticated);
        if (body.authenticated) await load();
      })
      .finally(() => setReady(true));
  }, [load]);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    if (!response.ok) {
      setError("Email or password is incorrect.");
      setBusy(false);
      return;
    }
    await load();
    setBusy(false);
  }
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    if (!response.ok) {
      setError((await response.json()).error);
      setBusy(false);
      return;
    }
    event.currentTarget.reset();
    await load();
    setBusy(false);
  }
  async function remove(brand: Brand) {
    if (!confirm(`Remove ${brand.name} from the mall directory?`)) return;
    setBusy(true);
    await fetch(`/api/admin/brands?id=${encodeURIComponent(brand.id)}`, {
      method: "DELETE",
    });
    await load();
    setBusy(false);
  }
  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setBrands([]);
  }
  const visible = useMemo(
    () =>
      brands.filter(
        (item) =>
          (floor === "all" || item.floorId === floor) &&
          item.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [brands, floor, query],
  );
  if (!ready)
    return (
      <main className="admin-loading">
        <span />
      </main>
    );
  if (!authenticated)
    return (
      <main className="admin-login">
        <section>
          <Logo />
          <div className="admin-login-icon">
            <ShieldCheck />
          </div>
          <h1>Master Panel</h1>
          <p>Sign in to manage brands shown on the kiosk.</p>
          {!configured && (
            <div className="admin-warning">
              Admin login is not configured. Add ADMIN_EMAIL, ADMIN_PASSWORD and
              ADMIN_SESSION_SECRET in Render.
            </div>
          )}
          <form onSubmit={login}>
            <label>
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                placeholder="admin@company.com"
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter password"
              />
            </label>
            {error && <div className="admin-error">{error}</div>}
            <button disabled={busy || !configured}>
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    );
  return (
    <main className="admin-shell">
      <header>
        <div>
          <Logo />
          <span>Master Panel</span>
        </div>
        <button onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </header>
      <div className="admin-body">
        <section className="admin-title">
          <div>
            <span>
              <Building2 />
            </span>
            <div>
              <h1>Brand directory</h1>
              <p>Add or remove stores visible on kiosk and mobile maps.</p>
            </div>
          </div>
          <b>{brands.length} brands</b>
        </section>
        <section className="admin-grid">
          <aside>
            <h2>
              <Plus size={20} /> Add new brand
            </h2>
            <form onSubmit={add}>
              <label>
                Brand name
                <input
                  name="name"
                  required
                  minLength={2}
                  placeholder="e.g. Adidas"
                />
              </label>
              <label>
                Floor
                <select name="floorId" required>
                  {floors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Category
                <select name="categoryId" required>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Unit number
                <input name="unitNumber" required placeholder="e.g. L2-18" />
              </label>
              {error && <div className="admin-error">{error}</div>}
              <button disabled={busy}>
                <Plus size={18} /> Add brand
              </button>
            </form>
            <small>
              New brands automatically receive a map marker and a route
              connection.
            </small>
          </aside>
          <section className="admin-list">
            <div className="admin-list-tools">
              <label>
                <Search size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search brands..."
                />
              </label>
              <select value={floor} onChange={(e) => setFloor(e.target.value)}>
                <option value="all">All floors</option>
                {floors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-table">
              <div className="admin-row admin-head">
                <span>Brand</span>
                <span>Floor</span>
                <span>Category</span>
                <span>Unit</span>
                <span />
              </div>
              {visible.map((brand) => (
                <div className="admin-row" key={brand.id}>
                  <span className="admin-brand">
                    <i>
                      <Store />
                    </i>
                    <b>{brand.name}</b>
                  </span>
                  <span>
                    {floors.find((item) => item.id === brand.floorId)?.name ??
                      brand.floorId}
                  </span>
                  <span>
                    {categories.find((item) => item.id === brand.categoryId)
                      ?.name ?? brand.categoryId}
                  </span>
                  <span>{brand.unitNumber}</span>
                  <button
                    aria-label={`Remove ${brand.name}`}
                    disabled={busy}
                    onClick={() => remove(brand)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
              {!visible.length && (
                <div className="admin-empty">No brands found.</div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
