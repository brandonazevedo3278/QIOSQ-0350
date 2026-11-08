import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Search,
  ShoppingBag,
  Heart,
  MapPin,
  Clock,
  Star,
  X,
  CheckCircle,
  Globe,
  UtensilsCrossed,
  Box,
  Split,
  QrCode,
} from "lucide-react";
import { useDemo, money, uid, stages } from "../lib/demo";
import type { Product, Order } from "../lib/demo";
import { langs, translations, translatedProduct, statusLabels } from "../lib/languages";
import { Logo, Modal, Field, Badge, DemoMap, Empty } from "../components/qiosq";
import { sound } from "../components/orders";
type CartItem = {
  key: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  note: string;
  image: string;
};
export function ConsumerMenu({ tenant }: { tenant: string }) {
  const { data, mutate, notify } = useDemo();
  const s = data.stores.find((s) => s.id === tenant);
  const [lang, setLang] = useState(localStorage.getItem("qiosq-lang") || "PT");
  const t = translations[lang] || translations.PT;
  const params = new URLSearchParams(window.location.search);
  const isDelivery = params.get("type") === "delivery";
  const [point, setPoint] = useState(params.get("point") || "Mesa 01");
  const [pointModal, setPointModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("qiosq-cart-" + tenant) || "[]");
    } catch {
      return [];
    }
  });
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("menu");
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [extras, setExtras] = useState<string[]>([]);
  const [variation, setVariation] = useState("");
  const [note, setNote] = useState("");
  const [checkout, setCheckout] = useState(false);
  const [method, setMethod] = useState("Pix");
  const [selected, setSelected] = useState<Order | null>(null);
  const [split, setSplit] = useState<Order | null>(null);
  const [threeD, setThreeD] = useState<Product | null>(null);
  const [rotate, setRotate] = useState(0);
  useEffect(() => {
    localStorage.setItem("qiosq-cart-" + tenant, JSON.stringify(cart));
  }, [cart, tenant]);
  useEffect(() => {
    localStorage.setItem("qiosq-lang", lang);
  }, [lang]);
  const ids = data.orders.filter((o) => o.tenantId === tenant);
  const [myIds, setMyIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("qiosq-my-orders-" + tenant) || "[]");
    } catch {
      return [];
    }
  });
  const subtotal = cart.reduce((t, c) => t + c.price * c.qty, 0);
  const fee = isDelivery ? s?.fee || 0 : 0;
  const total = Math.round((subtotal + fee) * 100) / 100;
  const menu = data.products.filter(
    (p) =>
      p.tenantId === tenant &&
      p.available &&
      (category === "Todos" || p.category === category) &&
      (p.name + " " + translatedProduct(p.name, p.description, lang).name)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (tab !== "favorites" || data.favorites.includes(p.id)),
  );
  function add() {
    if (!product) return;
    const cost = extras.reduce((t, v) => t + Number(v.split(":")[1] || 0), 0);
    const c = {
      key: uid(),
      productId: product.id,
      name: product.name,
      price: product.price + cost,
      qty,
      note: [variation, ...extras.map((v) => v.split(":")[0]), note].filter(Boolean).join(" · "),
      image: product.image,
    };
    setCart([...cart, c]);
    setProduct(null);
    notify(t.add + " ✓");
  }
  if (!s)
    return (
      <div className="not-found">
        <h1>Loja não encontrada</h1>
        <Link href="/delivery" className="btn">
          Explorar estabelecimentos
        </Link>
      </div>
    );
  return (
    <div className="consumer">
      <div className="consumer-demo">
        {t.demo}
        <Link href={`/business/${tenant}`}>
          Business <ArrowUpRightIcon />
        </Link>
      </div>
      <header className="consumer-header">
        <Link href="/">
          <Logo small />
        </Link>
        <nav>
          <Link href="/delivery">{t.delivery}</Link>
          <button className={tab === "menu" ? "active" : ""} onClick={() => setTab("menu")}>
            {t.menu}
          </button>
          <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
            {t.orders}
          </button>
        </nav>
        <div className="consumer-header-actions">
          <Globe size={16} />
          <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Idioma">
            {langs.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <button className="cart-icon" aria-label={t.cart} onClick={() => setTab("cart")}>
            <ShoppingBag size={21} />
            <b>{cart.reduce((n, c) => n + c.qty, 0)}</b>
          </button>
        </div>
      </header>
      <main className="menu-main">
        <section className="menu-cover">
          <img src="/images/beach.jpg" alt="Praia do Rio de Janeiro" />
          <div>
            <span className="eyebrow">QIOSQ MENU</span>
            <h1>{s.name}</h1>
            <p>{s.description}</p>
            <div className="venue-tags">
              <span>
                <Star size={14} fill="currentColor" /> 4,9 <small>(avaliações ilustrativas)</small>
              </span>
              <span>
                <Clock size={14} />
                {s.hours}
              </span>
              <button onClick={() => setPointModal(true)}>
                <MapPin size={14} />
                {isDelivery ? "Delivery · " + s.estimate : point}
              </button>
            </div>
          </div>
        </section>
        {s.status === "Suspenso" && (
          <div className="notice danger">
            Este estabelecimento está suspenso na demonstração. Novos pedidos estão desativados.
          </div>
        )}
        {(tab === "menu" || tab === "favorites") && (
          <>
            <div className="menu-title">
              <div>
                <span className="eyebrow">PEDIU, CHEGOU.</span>
                <h2>{t.popular}</h2>
                <p>{t.desc}</p>
              </div>
              <button
                className={"btn secondary " + (tab === "favorites" ? "selected" : "")}
                onClick={() => setTab(tab === "favorites" ? "menu" : "favorites")}
              >
                <Heart size={16} />
                {t.favorite}
              </button>
            </div>
            <div className="menu-toolbar">
              <div className="category-pills">
                {[
                  "Todos",
                  ...data.categories.filter((c) => c.tenantId === tenant).map((c) => c.name),
                ].map((c) => (
                  <button
                    className={category === c ? "active" : ""}
                    key={c}
                    onClick={() => setCategory(c)}
                  >
                    {c === "Todos" ? t.all : t[c] || c}
                  </button>
                ))}
              </div>
              <div className="search-box">
                <Search size={18} />
                <input
                  aria-label={t.search}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.search}
                />
              </div>
            </div>
            <div className="menu-grid">
              {menu.map((p) => {
                const tr = translatedProduct(p.name, p.description, lang);
                return (
                  <article className="food-card" key={p.id}>
                    <div className="food-image">
                      <button
                        className={
                          "favorite-btn " + (data.favorites.includes(p.id) ? "selected" : "")
                        }
                        aria-label={t.favorite}
                        onClick={() =>
                          mutate(
                            (d) => ({
                              ...d,
                              favorites: d.favorites.includes(p.id)
                                ? d.favorites.filter((f) => f !== p.id)
                                : [...d.favorites, p.id],
                            }),
                            t.favorite + " ✓",
                          )
                        }
                      >
                        <Heart
                          size={18}
                          fill={data.favorites.includes(p.id) ? "currentColor" : "none"}
                        />
                      </button>
                      <button
                        className="food-open"
                        aria-label={tr.name}
                        onClick={() => {
                          setProduct(p);
                          setQty(1);
                          setExtras([]);
                          setVariation(p.variations.split(";")[0]);
                          setNote("");
                        }}
                      >
                        <img src={p.image} alt={tr.name} />
                      </button>
                      {p.promo && <span className="food-promo">{t.promo}</span>}
                    </div>
                    <div className="food-body">
                      <small>{t[p.category] || p.category}</small>
                      <h3>{tr.name}</h3>
                      <p>{tr.description}</p>
                      <div>
                        <strong>{money(p.price)}</strong>
                        <button
                          className="add-round"
                          aria-label={t.add + " " + tr.name}
                          disabled={s.status === "Suspenso"}
                          onClick={() => {
                            setProduct(p);
                            setQty(1);
                            setExtras([]);
                            setVariation(p.variations.split(";")[0]);
                            setNote("");
                          }}
                        >
                          <Plus size={21} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {!menu.length && <Empty text={t.no} />}
          </>
        )}
        {tab === "cart" && (
          <>
            <div className="menu-title">
              <h2>{t.cart}</h2>
              <button className="text-link" onClick={() => setTab("menu")}>
                <ArrowLeft size={16} />
                {t.back}
              </button>
            </div>
            {!cart.length ? (
              <div className="cart-empty">
                <ShoppingBag size={56} />
                <h2>{t.empty}</h2>
                <p>{t.choose}</p>
                <button className="btn" onClick={() => setTab("menu")}>
                  {t.menu} <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="checkout-grid">
                <section className="panel">
                  {cart.map((c) => (
                    <div className="cart-line" key={c.key}>
                      <img src={c.image} alt={c.name} />
                      <div>
                        <strong>{translatedProduct(c.name, "", lang).name}</strong>
                        <small>{c.note}</small>
                        <span>{money(c.price)}</span>
                      </div>
                      <div className="qty">
                        <button
                          aria-label="Reduzir quantidade"
                          onClick={() =>
                            setCart(
                              cart
                                .map((v) => (v.key === c.key ? { ...v, qty: v.qty - 1 } : v))
                                .filter((v) => v.qty > 0),
                            )
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <b>{c.qty}</b>
                        <button
                          aria-label="Aumentar quantidade"
                          onClick={() =>
                            setCart(
                              cart.map((v) => (v.key === c.key ? { ...v, qty: v.qty + 1 } : v)),
                            )
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        className="icon-btn"
                        aria-label="Remover item"
                        onClick={() => setCart(cart.filter((v) => v.key !== c.key))}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </section>
                <section className="panel cart-summary">
                  <h3>{t.cart}</h3>
                  <p>{isDelivery ? t.delivery : point}</p>
                  <div className="sum-row">
                    <span>{t.subtotal}</span>
                    <strong>{money(subtotal)}</strong>
                  </div>
                  {isDelivery && (
                    <div className="sum-row">
                      <span>{t.delivery}</span>
                      <strong>{money(fee)}</strong>
                    </div>
                  )}
                  <div className="sum-row total">
                    <span>{t.total}</span>
                    <strong>{money(total)}</strong>
                  </div>
                  {isDelivery && subtotal < s.minimum && (
                    <p className="notice">Pedido mínimo: {money(s.minimum)}</p>
                  )}
                  <button
                    className="btn full"
                    disabled={
                      s.status === "Suspenso" ||
                      (isDelivery && (!s.delivery || subtotal < s.minimum))
                    }
                    onClick={() => setCheckout(true)}
                  >
                    {t.checkout}
                    <ArrowRight size={17} />
                  </button>
                  <small>{t.demo}</small>
                </section>
              </div>
            )}
          </>
        )}
        {tab === "orders" && (
          <>
            <div className="menu-title">
              <div>
                <h2>{t.orders}</h2>
                <p>Pedidos deste navegador e exemplos do estabelecimento.</p>
              </div>
            </div>
            <div className="consumer-orders">
              {ids
                .sort((a, b) => Number(myIds.includes(b.id)) - Number(myIds.includes(a.id)))
                .map((o) => (
                  <section className="panel" key={o.id}>
                    <div className="panel-title">
                      <strong>
                        #{o.id} · {o.customer}
                      </strong>
                      <Badge>
                        {lang === "PT"
                          ? o.status
                          : statusLabels[lang]?.[stages.indexOf(o.status)] || o.status}
                      </Badge>
                    </div>
                    <p>
                      {o.items
                        .map((i) => `${i.qty}× ${translatedProduct(i.name, "", lang).name}`)
                        .join(", ")}
                    </p>
                    <div className="order-card-bottom">
                      <span>
                        {o.point} · {myIds.includes(o.id) ? "Seu pedido" : "Exemplo fictício"}
                      </span>
                      <strong>{money(o.total)}</strong>
                    </div>
                    <div className="form-actions">
                      <button className="btn secondary" onClick={() => setSplit(o)}>
                        <Split size={16} />
                        {t.split}
                      </button>
                      <button className="btn" onClick={() => setSelected(o)}>
                        {t.tracking} <ArrowRight size={16} />
                      </button>
                    </div>
                  </section>
                ))}
            </div>
            {!ids.length && <Empty />}
          </>
        )}
      </main>
      <footer className="menu-footer">
        <Logo small />
        <p>{t.demo} · QIOSQ © 2026</p>
        <Link href={`/staff/${tenant}`}>Staff</Link>
      </footer>
      <nav className="consumer-bottom">
        <button className={tab === "menu" ? "active" : ""} onClick={() => setTab("menu")}>
          <UtensilsCrossed size={21} />
          {t.menu}
        </button>
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
          <Clock size={21} />
          {t.orders}
        </button>
        <button className={tab === "favorites" ? "active" : ""} onClick={() => setTab("favorites")}>
          <Heart size={21} />
          {t.favorite}
        </button>
        <button className={tab === "cart" ? "active" : ""} onClick={() => setTab("cart")}>
          <ShoppingBag size={21} />
          {t.cart} ({cart.reduce((t, c) => t + c.qty, 0)})
        </button>
      </nav>
      {cart.length > 0 && tab === "menu" && (
        <button className="floating-cart" onClick={() => setTab("cart")}>
          <ShoppingBag size={19} />
          <span>
            {t.cart} · {cart.reduce((t, c) => t + c.qty, 0)} itens
          </span>
          <strong>{money(total)}</strong>
          <ArrowRight size={19} />
        </button>
      )}
      {product && (
        <Modal
          title={translatedProduct(product.name, product.description, lang).name}
          onClose={() => setProduct(null)}
        >
          <img className="modal-food-image" src={product.image} alt={product.name} />
          <p className="muted">
            {translatedProduct(product.name, product.description, lang).description}
          </p>
          <button
            className="text-link"
            onClick={() => {
              setThreeD(product);
              setRotate(0);
            }}
          >
            <Box size={17} /> Prévia de visualização 3D
          </button>
          <Field
            label={t.variation}
            value={variation}
            options={product.variations.split(";").filter(Boolean)}
            onChange={setVariation}
          />
          <h4>{t.extras}</h4>
          {product.extras
            .split(";")
            .filter(Boolean)
            .map((ex) => (
              <label className="extra-line" key={ex}>
                <input
                  aria-label="Campo do formulário"
                  type="checkbox"
                  checked={extras.includes(ex)}
                  onChange={(e) =>
                    setExtras(e.target.checked ? [...extras, ex] : extras.filter((v) => v !== ex))
                  }
                />
                <span>{ex.split(":")[0]}</span>
                <strong>+ {money(Number(ex.split(":")[1] || 0))}</strong>
              </label>
            ))}
          <Field label={t.note} type="textarea" value={note} onChange={setNote} />
          <div className="form-actions spread">
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Diminuir">
                <Minus size={17} />
              </button>
              <b>{qty}</b>
              <button onClick={() => setQty(qty + 1)} aria-label="Aumentar">
                <Plus size={17} />
              </button>
            </div>
            <button className="btn" onClick={add}>
              {t.add} ·{" "}
              {money(
                (product.price + extras.reduce((t, v) => t + Number(v.split(":")[1] || 0), 0)) *
                  qty,
              )}
            </button>
          </div>
        </Modal>
      )}
      {checkout && (
        <Modal title={t.checkout} onClose={() => setCheckout(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const o: Order = {
                id: uid().toUpperCase(),
                tenantId: tenant,
                customer: String(f.get("name")),
                point: isDelivery ? "Delivery" : point,
                type: isDelivery ? "Delivery" : "Local",
                status: "Recebido",
                items: cart.map((c) => ({
                  name: c.name,
                  qty: c.qty,
                  price: c.price,
                  note: c.note,
                })),
                total,
                payment: method,
                paid: method === "Presencial" ? 0 : total,
                created: new Date().toISOString(),
                address: isDelivery ? String(f.get("address")) : "",
              };
              mutate(
                (d) => ({ ...d, orders: [o, ...d.orders] }),
                "Pedido demonstrativo enviado. Nenhuma cobrança realizada.",
              );
              const next = [o.id, ...myIds];
              setMyIds(next);
              localStorage.setItem("qiosq-my-orders-" + tenant, JSON.stringify(next));
              setCart([]);
              setCheckout(false);
              setTab("orders");
              setSelected(o);
              sound();
            }}
          >
            <Field label={t.name} name="name" required />
            {isDelivery && (
              <Field
                label={t.address}
                name="address"
                value={localStorage.getItem("qiosq-address") || "Av. Atlântica, 1200 — Copacabana"}
                required
              />
            )}
            <h4>{t.payment}</h4>
            <div className="payment-options">
              {["Pix", "Cartão", "Presencial"].map((m) => (
                <button
                  type="button"
                  className={method === m ? "active" : ""}
                  key={m}
                  onClick={() => setMethod(m)}
                >
                  {m === "Cartão" ? t.card : m === "Presencial" ? t.cash : m}
                </button>
              ))}
            </div>
            {method === "Pix" && (
              <div className="fake-pix">
                <QrCode size={58} />
                <div>
                  <strong>Pix fictício</strong>
                  <p>Sem chave, sem transação. Não escaneie para pagar.</p>
                </div>
              </div>
            )}
            {method === "Cartão" && (
              <div className="notice">
                Cartão simulado. Não insira números ou dados bancários reais.
              </div>
            )}
            {method === "Presencial" && (
              <div className="notice">
                O valor ficará pendente até confirmação fictícia no caixa.
              </div>
            )}
            <div className="sum-row total">
              <span>{t.total}</span>
              <strong>{money(total)}</strong>
            </div>
            <div className="notice">
              {t.demo}. Pix e cartão marcam o pagamento como confirmado apenas no protótipo.
            </div>
            <button className="btn full">
              {t.send}
              <ArrowRight size={16} />
            </button>
          </form>
        </Modal>
      )}
      {pointModal && (
        <Modal title="Identificar atendimento" onClose={() => setPointModal(false)}>
          <p className="muted">Simule a identificação feita pelo QR Code.</p>
          {data.points
            .filter((p) => p.tenantId === tenant)
            .map((p) => (
              <button
                className="point-option"
                key={p.id}
                onClick={() => {
                  setPoint(p.name);
                  setPointModal(false);
                }}
              >
                <MapPin size={18} />
                {p.name}
                {p.name === point && <CheckCircle size={18} />}
              </button>
            ))}
        </Modal>
      )}
      {selected && (
        <Tracking
          order={selected}
          lang={lang}
          onClose={() => setSelected(null)}
          onSplit={(o) => {
            setSelected(null);
            setSplit(o);
          }}
        />
      )}
      {split && <SplitBill order={split} onClose={() => setSplit(null)} />}
      {threeD && (
        <Modal title="Prévia do recurso 3D" onClose={() => setThreeD(null)}>
          <div className="food-3d">
            <img
              src={threeD.image}
              alt={threeD.name}
              style={{ transform: `rotateY(${rotate}deg) rotateX(12deg)` }}
            />
          </div>
          <input
            aria-label="Rotacionar prévia"
            type="range"
            min="-45"
            max="45"
            value={rotate}
            onChange={(e) => setRotate(Number(e.target.value))}
          />
          <p className="notice">
            Prévia visual com fotografia e rotação CSS, não um modelo 3D. Captura e renderização
            tridimensional reais serão implementadas na etapa 5.
          </p>
        </Modal>
      )}
    </div>
  );
}
function ArrowUpRightIcon() {
  return <ArrowRight size={13} style={{ transform: "rotate(-40deg)" }} />;
}
export function Tracking({
  order,
  lang = "PT",
  onClose,
  onSplit,
}: {
  order: Order;
  lang?: string;
  onClose: () => void;
  onSplit: (o: Order) => void;
}) {
  const { data, mutate } = useDemo();
  const o = data.orders.find((v) => v.id === order.id) || order;
  const t = translations[lang];
  const steps = stages.filter(
    (s) => s !== "Cancelado" && (o.type === "Delivery" || s !== "Saiu para entrega"),
  );
  return (
    <Modal title={t.tracking + " #" + o.id} onClose={onClose}>
      <div className="tracking-top">
        <CheckCircle size={42} />
        <h2>{lang === "PT" ? o.status : statusLabels[lang]?.[stages.indexOf(o.status)]}</h2>
        <p>
          {o.point} · {o.customer}
        </p>
      </div>
      {o.status === "Cancelado" ? (
        <div className="notice danger">Pedido cancelado na demonstração.</div>
      ) : (
        <div className="tracking-steps">
          {steps.map((s, i) => (
            <div className={i <= steps.indexOf(o.status) ? "done" : ""} key={s}>
              <span>{i < steps.indexOf(o.status) ? <CheckCircle size={16} /> : i + 1}</span>
              <strong>{lang === "PT" ? s : statusLabels[lang]?.[stages.indexOf(s)]}</strong>
            </div>
          ))}
        </div>
      )}
      {o.type === "Delivery" && (
        <>
          <DemoMap
            markers={[
              { id: "venue", name: "Estabelecimento", x: 35, y: 58 },
              {
                id: "courier",
                name: "Entregador (ilustrativo)",
                x: o.status === "Saiu para entrega" ? 58 : 38,
                y: o.status === "Concluído" ? 28 : 42,
              },
              { id: "home", name: "Seu endereço", x: 68, y: 30 },
            ]}
            selected="courier"
            radius={1}
          />
          <p className="muted">
            Rastreamento ilustrativo por status, sem GPS ou localização em tempo real.
          </p>
        </>
      )}
      <div className="sum-row">
        <span>{t.total}</span>
        <strong>{money(o.total)}</strong>
      </div>
      <div className="sum-row">
        <span>{t.paid}</span>
        <strong>{money(o.paid)}</strong>
      </div>
      <button className="btn secondary full" onClick={() => onSplit(o)}>
        <Split size={16} />
        {t.split}
      </button>
      {o.status === "Recebido" && (
        <button
          className="text-link danger"
          onClick={() =>
            mutate(
              (d) => ({
                ...d,
                orders: d.orders.map((v) => (v.id === o.id ? { ...v, status: "Cancelado" } : v)),
              }),
              "Pedido demonstrativo cancelado. Sem estorno real, pois não há transação.",
            )
          }
        >
          {t.cancel}
        </button>
      )}
      {o.status === "Concluído" && (
        <div className="rate">
          <h4>Avalie a experiência demonstrativa</h4>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              aria-label={`${n} estrelas`}
              onClick={() =>
                mutate(
                  (d) => ({
                    ...d,
                    orders: d.orders.map((v) => (v.id === o.id ? { ...v, rating: n } : v)),
                  }),
                  "Avaliação demonstrativa salva.",
                )
              }
            >
              <Star fill={(o.rating || 0) >= n ? "#f5b536" : "none"} color="#f5b536" />
            </button>
          ))}
        </div>
      )}
      <div className="notice">
        Atualize o pedido no Business ou Staff e veja o acompanhamento mudar aqui.
      </div>
    </Modal>
  );
}
export function SplitBill({ order, onClose }: { order: Order; onClose: () => void }) {
  const { data, mutate, notify } = useDemo();
  const o = data.orders.find((v) => v.id === order.id) || order;
  const [mode, setMode] = useState("Igualitária");
  const [count, setCount] = useState(2);
  const [amount, setAmount] = useState(Math.max(0, o.total - o.paid));
  const [chosen, setChosen] = useState<number[]>([]);
  const remaining = Math.max(0, Math.round((o.total - o.paid) * 100) / 100);
  const parts = Array.from(
    { length: count },
    (_, i) =>
      Math.floor((remaining / count) * 100) / 100 +
      (i < Math.round(remaining * 100) % count ? 0.01 : 0),
  );
  const selectedTotal = o.items.reduce(
    (t, item, i) => t + (chosen.includes(i) ? item.qty * item.price : 0),
    0,
  );
  function pay(value: number) {
    if (value <= 0) {
      notify("Não há valor selecionado para confirmar.");
      return;
    }
    mutate(
      (d) => ({
        ...d,
        orders: d.orders.map((v) =>
          v.id === o.id
            ? { ...v, paid: Math.min(v.total, Math.round((v.paid + value) * 100) / 100) }
            : v,
        ),
      }),
      "Parcela confirmada ficticiamente. Nenhuma transação realizada.",
    );
    setChosen([]);
  }
  return (
    <Modal title={"Dividir conta · #" + o.id} onClose={onClose}>
      <div className="tabs">
        {["Igualitária", "Individual", "Por produtos"].map((m) => (
          <button key={m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>
      <div className="split-summary">
        <div>
          <small>Total</small>
          <strong>{money(o.total)}</strong>
        </div>
        <div>
          <small>Pago</small>
          <strong>{money(o.paid)}</strong>
        </div>
        <div>
          <small>Pendente</small>
          <strong>{money(remaining)}</strong>
        </div>
      </div>
      {mode === "Igualitária" && (
        <>
          <Field
            label="Número de pessoas (2 a 20)"
            type="number"
            value={count}
            onChange={(v) => setCount(Math.min(20, Math.max(2, Math.floor(Number(v) || 2))))}
          />
          {parts.map((v, i) => (
            <div className="split-row" key={i}>
              <span>Pessoa {i + 1}</span>
              <strong>{money(v)}</strong>
              <button className="btn mini secondary" disabled={!remaining} onClick={() => pay(v)}>
                Pagar ficticiamente
              </button>
            </div>
          ))}
          <small className="muted">
            As parcelas são recalculadas sobre o saldo pendente após cada confirmação.
          </small>
        </>
      )}
      {mode === "Individual" && (
        <>
          <Field
            label="Valor individual (R$)"
            type="number"
            value={amount}
            onChange={(v) => setAmount(Number(v))}
          />
          <button
            className="btn full"
            onClick={() => pay(Math.min(amount, remaining))}
            disabled={!remaining}
          >
            Confirmar parcela fictícia
          </button>
        </>
      )}
      {mode === "Por produtos" && (
        <>
          {o.items.map((item, i) => (
            <label className="extra-line" key={i}>
              <input
                aria-label="Campo do formulário"
                type="checkbox"
                checked={chosen.includes(i)}
                onChange={(e) =>
                  setChosen(e.target.checked ? [...chosen, i] : chosen.filter((v) => v !== i))
                }
              />
              <span>
                {item.qty}× {item.name}
              </span>
              <strong>{money(item.price * item.qty)}</strong>
            </label>
          ))}
          <button
            className="btn full"
            disabled={!remaining || !chosen.length}
            onClick={() => pay(Math.min(selectedTotal, remaining))}
          >
            Confirmar itens · {money(Math.min(selectedTotal, remaining))}
          </button>
          <small className="muted">
            Demonstração: itens selecionados abatem o saldo; conciliação por pessoa e produto será
            implementada no financeiro real.
          </small>
        </>
      )}
      <div className="notice">
        Somente simulação de divisão e valores pagos/pendentes. Não use para cobrança real.
      </div>
    </Modal>
  );
}
