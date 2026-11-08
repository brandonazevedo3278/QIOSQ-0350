import { useState } from "react";
import { Link } from "wouter";
import {
  MapPin,
  Search,
  ArrowRight,
  Star,
  Heart,
  LocateFixed,
  Map,
  LayoutGrid,
} from "lucide-react";
import { useDemo, money } from "../lib/demo";
import { Logo, DemoMap, Badge, Modal, Field, Empty } from "../components/qiosq";
export function Delivery() {
  const { data, notify, mutate } = useDemo();
  const [address, setAddress] = useState(
    localStorage.getItem("qiosq-address") || "Av. Atlântica, 1200 — Copacabana",
  );
  const [hood, setHood] = useState(localStorage.getItem("qiosq-neighborhood") || "Copacabana");
  const [edit, setEdit] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [selected, setSelected] = useState("tropical");
  const [view, setView] = useState("Mapa");
  const [only, setOnly] = useState(false);
  const [sort, setSort] = useState("Recomendados");
  const [favs, setFavs] = useState(false);
  function distance(s: any) {
    const pos: Record<string, number> = {
      Copacabana: 68,
      Ipanema: 48,
      Leblon: 30,
      "Barra da Tijuca": 10,
      Botafogo: 82,
    };
    return Math.round((Math.abs(s.x - (pos[hood] || 68)) * 0.15 + 0.8) * 10) / 10;
  }
  const stores = data.stores
    .filter(
      (s) =>
        s.status !== "Suspenso" &&
        s.delivery &&
        (s.name + " " + s.category + " " + s.address).toLowerCase().includes(query.toLowerCase()) &&
        (category === "Todos" || s.category === category) &&
        (!only || distance(s) <= s.radius) &&
        (!favs || data.favorites.includes("store-" + s.id)),
    )
    .sort((a, b) =>
      sort === "Mais próximos"
        ? distance(a) - distance(b)
        : sort === "Menor taxa"
          ? a.fee - b.fee
          : 0,
    );
  const chosen = stores.find((s) => s.id === selected) || stores[0];
  return (
    <div className="delivery-app">
      <div className="consumer-demo">
        Mapa e distâncias demonstrativos · sem cálculo geográfico real
        <Link href="/master">
          Master <ArrowRight size={13} />
        </Link>
      </div>
      <header className="consumer-header">
        <Link href="/">
          <Logo small />
        </Link>
        <button className="delivery-address" onClick={() => setEdit(true)}>
          <MapPin size={19} />
          <span>
            Entregar em<strong>{address}</strong>
          </span>
          <ArrowRight size={15} />
        </button>
        <div className="consumer-header-actions">
          <button className="icon-btn" title="Favoritos" onClick={() => setFavs(!favs)}>
            <Heart fill={favs ? "currentColor" : "none"} size={21} />
          </button>
          <Link href="/menu/tropical?type=delivery" className="text-link">
            Meus pedidos
          </Link>
        </div>
      </header>
      <main className="delivery-main">
        <div className="delivery-heading">
          <div>
            <div className="eyebrow">QIOSQ DELIVERY</div>
            <h1>
              O melhor da praia.
              <br />
              <em>Onde você estiver.</em>
            </h1>
            <p>Descubra sabores perto de você. Peça e viva seu momento.</p>
          </div>
          <div className="search-box">
            <Search size={20} />
            <input aria-label="Buscar quiosques, bares e restaurantes"
              placeholder="Buscar quiosques, bares e restaurantes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="delivery-filters">
          <div className="category-pills">
            {["Todos", "Quiosque", "Restaurante", "Bar", "Barraca de praia"].map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="delivery-controls">
            <label>
              <input aria-label="Campo do formulário" type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} />{" "}
              Atendem meu endereço
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {["Recomendados", "Mais próximos", "Menor taxa"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <div className="segmented">
              {["Mapa", "Lista"].map((v) => (
                <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>
                  {v === "Mapa" ? <Map size={16} /> : <LayoutGrid size={16} />}
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
        {view === "Mapa" ? (
          <div className="discovery-grid">
            <section className="discovery-list">
              <div className="discovery-count">
                {stores.length} lugares para descobrir<small>Região: {hood}</small>
              </div>
              {stores.map((s, i) => (
                <button
                  className={"discovery-card " + (chosen?.id === s.id ? "selected" : "")}
                  onClick={() => setSelected(s.id)}
                  key={s.id}
                >
                  <img
                    src={`/images/${["beach", "shrimp", "drink", "burger"][i % 4]}.jpg`}
                    alt={s.name}
                  />
                  <div>
                    <small>
                      {s.category} · {distance(s)} km*
                    </small>
                    <h3>{s.name}</h3>
                    <p>
                      <Star size={13} fill="currentColor" /> 4,9 · {s.estimate}
                    </p>
                    <span>
                      {distance(s) <= s.radius ? "Atende seu endereço" : "Fora da área de entrega"}
                      <strong>{money(s.fee)}</strong>
                    </span>
                  </div>
                </button>
              ))}
              {!stores.length && <Empty />}
            </section>
            <div className="discovery-map">
              <DemoMap
                markers={stores}
                selected={chosen?.id}
                onSelect={setSelected}
                radius={chosen?.radius || 8}
              />
              {chosen && (
                <section className="map-shop-card">
                  <div>
                    <Badge>
                      {distance(chosen) <= chosen.radius ? "Disponível" : "Fora da área"}
                    </Badge>
                    <h3>{chosen.name}</h3>
                    <p>
                      {chosen.estimate} · Taxa {money(chosen.fee)} · Mínimo {money(chosen.minimum)}
                    </p>
                  </div>
                  {distance(chosen) <= chosen.radius ? (
                    <Link href={`/menu/${chosen.id}?type=delivery`} className="btn">
                      Ver cardápio <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button className="btn secondary" onClick={() => setEdit(true)}>
                      Alterar endereço
                    </button>
                  )}
                </section>
              )}
            </div>
          </div>
        ) : (
          <div className="venue-grid">
            {stores.map((s, i) => (
              <section className="venue-card" key={s.id}>
                <div className="venue-photo">
                  <img
                    src={`/images/${["beach", "shrimp", "drink", "burger"][i % 4]}.jpg`}
                    alt={s.name}
                  />
                  <button
                    className="favorite-btn"
                    aria-label="Favoritar estabelecimento"
                    onClick={() =>
                      mutate(
                        (d) => ({
                          ...d,
                          favorites: d.favorites.includes("store-" + s.id)
                            ? d.favorites.filter((f) => f !== "store-" + s.id)
                            : [...d.favorites, "store-" + s.id],
                        }),
                        "Favorito demonstrativo atualizado.",
                      )
                    }
                  >
                    <Heart
                      size={19}
                      fill={data.favorites.includes("store-" + s.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="venue-body">
                  <small>
                    {s.category} · {distance(s)} km*
                  </small>
                  <h3>{s.name}</h3>
                  <p>
                    <Star size={14} /> 4,9 · {s.estimate} · {money(s.fee)}
                  </p>
                  {distance(s) <= s.radius ? (
                    <Link className="btn full" href={`/menu/${s.id}?type=delivery`}>
                      Ver cardápio <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button className="btn secondary full" onClick={() => setEdit(true)}>
                      Fora da área · mudar endereço
                    </button>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
        <p className="distance-note">
          * Distâncias e cobertura são simulações por bairro e raio configurado, não geolocalização
          real. O mapa é uma ilustração. Polígonos salvos podem ser visualizados no Business;
          cálculo geográfico por polígono será implementado na etapa 4.
        </p>
      </main>
      <footer className="menu-footer">
        <Logo small />
        <p>QIOSQ — Pediu, chegou. · Delivery demonstrativo</p>
        <Link href="/">Sobre o QIOSQ</Link>
      </footer>
      {edit && (
        <Modal title="Onde seu pedido deve chegar?" onClose={() => setEdit(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget),
                a = String(f.get("address")),
                h = String(f.get("hood"));
              setAddress(a);
              setHood(h);
              localStorage.setItem("qiosq-address", a);
              localStorage.setItem("qiosq-neighborhood", h);
              setEdit(false);
              notify("Endereço atualizado para a simulação de cobertura.");
            }}
          >
            <Field label="Endereço completo" name="address" value={address} required />
            <Field
              label="Bairro usado na simulação"
              name="hood"
              options={["Copacabana", "Ipanema", "Leblon", "Barra da Tijuca", "Botafogo"]}
              value={hood}
            />
            <button
              type="button"
              className="btn secondary full"
              onClick={() => {
                if (!navigator.geolocation) {
                  notify("Geolocalização não disponível neste navegador.");
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  (p) =>
                    notify(
                      `Localização autorizada: ${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}. O mapa continua ilustrativo; selecione o bairro para simular cobertura.`,
                    ),
                  () =>
                    notify(
                      "Localização não autorizada ou indisponível. Informe seu endereço manualmente.",
                    ),
                );
              }}
            >
              <LocateFixed size={17} /> Usar minha localização (com autorização)
            </button>
            <div className="notice">
              Não há geocodificação nesta etapa. Informe o bairro para experimentar a cobertura
              fictícia.
            </div>
            <button className="btn full">
              Salvar endereço <ArrowRight size={16} />
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
