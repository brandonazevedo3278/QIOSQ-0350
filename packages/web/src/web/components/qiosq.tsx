import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  Store,
  Wallet,
  Layers,
  Settings,
  LifeBuoy,
  ClipboardList,
  UtensilsCrossed,
  Users,
  QrCode,
  MapPin,
  Truck,
  ChartNoAxesCombined,
  LogOut,
  Menu,
  X,
  Bell,
  Globe,
  Search,
  ChevronDown,
  Plus,
  Minus,
  LocateFixed,
} from "lucide-react";
import { useDemo } from "../lib/demo";
export function Logo({ light = false, small = false }: { light?: boolean; small?: boolean }) {
  return (
    <span className={"logo " + (light ? "light " : "") + (small ? "small" : "")}>
      <svg viewBox="0 0 82 58" aria-hidden="true">
        <path fill="#ffb632" d="M20 28a27 27 0 0152 0C52 9 43 10 20 28" />
        <path fill="#16d7e0" d="M2 42C24 17 38 23 58 36c9 6 15 5 22 1C58 62 42 23 2 42" />
        <path fill="#65e2e6" d="M3 48c25-14 38 16 70 1-22 20-44-8-70-1" />
      </svg>
      <span>
        <b>QIOSQ</b>
        <small>PEDIU, CHEGOU.</small>
      </span>
    </span>
  );
}
export function DemoBar() {
  return (
    <div className="demo-bar">
      <span className="demo-dot" /> Ambiente demonstrativo{" "}
      <span>• Dados e pagamentos fictícios</span>
      <Link href="/">
        Voltar ao site <ArrowUpRight size={13} />
      </Link>
    </div>
  );
}
const masterNav = [
  ["", "Visão geral", LayoutDashboard],
  ["estabelecimentos", "Estabelecimentos", Store],
  ["financeiro", "Financeiro", Wallet],
  ["planos", "Planos e assinaturas", Layers],
  ["relatorios", "Relatórios", ChartNoAxesCombined],
  ["configuracoes", "Configurações", Settings],
  ["atividades", "Atividades", ClipboardList],
  ["suporte", "Suporte", LifeBuoy],
] as const;
const businessNav = [
  ["", "Visão geral", LayoutDashboard],
  ["pedidos", "Pedidos", ClipboardList],
  ["cardapio", "Cardápio", UtensilsCrossed],
  ["equipe", "Equipe e permissões", Users],
  ["qrcodes", "QR Codes", QrCode],
  ["localizacao", "Localização", MapPin],
  ["delivery", "Delivery", Truck],
  ["financeiro", "Financeiro", Wallet],
  ["relatorios", "Relatórios", ChartNoAxesCombined],
  ["configuracoes", "Configurações", Settings],
] as const;
export function AdminShell({
  kind,
  tenant,
  children,
}: {
  kind: "master" | "business";
  tenant?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loc, navigate] = useLocation();
  const { data } = useDemo();
  const store = data.stores.find((s) => s.id === tenant);
  const base = kind === "master" ? "/master" : `/business/${tenant}`;
  const nav = kind === "master" ? masterNav : businessNav;
  return (
    <div className="admin-app">
      <aside className={"sidebar " + (open ? "expanded" : "")}>
        <Link href="/">
          <Logo light />
        </Link>
        <div className="workspace-label">QIOSQ {kind === "master" ? "MASTER" : "BUSINESS"}</div>
        <div className="workspace">
          <span className="workspace-icon">
            {kind === "master" ? "Q" : store?.name.slice(0, 1)}
          </span>
          <span>
            <strong>{kind === "master" ? "Central de comando" : store?.name}</strong>
            <small>
              {kind === "master" ? "Administrador global" : "Painel do estabelecimento"}
            </small>
          </span>
          <ChevronDown size={14} />
        </div>
        <nav>
          {nav.map(([slug, title, Icon]) => (
            <Link
              key={slug}
              href={base + (slug ? "/" + slug : "")}
              className={loc === base + (slug ? "/" + slug : "") ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              {title}
              {slug === "pedidos" && (
                <span className="nav-count">
                  {
                    data.orders.filter((o) => o.tenantId === tenant && o.status === "Recebido")
                      .length
                  }
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {kind === "business" && (
            <>
              <Link href={`/menu/${tenant}`}>
                <UtensilsCrossed size={18} /> Abrir cardápio público <ArrowUpRight size={14} />
              </Link>
              <Link href={`/staff/${tenant}`}>
                <Users size={18} /> Abrir QIOSQ Staff
              </Link>
            </>
          )}
          <div className="platform-switch">
            <label htmlFor="workspace-switch">Explorar ambientes</label>
            <select
              id="workspace-switch"
              value={kind}
              onChange={(e) =>
                navigate(
                  e.target.value === "master"
                    ? "/master"
                    : e.target.value === "delivery"
                      ? "/delivery"
                      : `/${e.target.value}/${tenant || "tropical"}`,
                )
              }
            >
              <option value="master">QIOSQ Master</option>
              <option value="business">QIOSQ Business</option>
              <option value="menu">QIOSQ Menu</option>
              <option value="delivery">QIOSQ Delivery</option>
              <option value="staff">QIOSQ Staff</option>
            </select>
          </div>
          <Link href="/">
            <LogOut size={17} /> Sair da demonstração
          </Link>
          <small>QIOSQ © 2026 · Pediu, chegou.</small>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="admin-body">
        <DemoBar />
        <header className="admin-header">
          <button
            className="icon-btn mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menu"
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            QIOSQ {kind === "master" ? "Master" : "Business"} <span>/</span>{" "}
            {nav.find(([slug]) => loc === base + (slug ? "/" + slug : ""))?.[1] || "Visão geral"}
          </div>
          <div className="header-right">
            <span className="desktop-only">Rio de Janeiro, BR</span>
            <Globe size={17} />
            <button
              className="icon-btn"
              aria-label="Notificações"
              onClick={() => navigate(base + (kind === "master" ? "/atividades" : "/pedidos"))}
            >
              <Bell size={18} />
              <i />
            </button>
            <span className="avatar">
              {kind === "master"
                ? "AD"
                : store?.owner
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
            </span>
            <div className="desktop-only">
              <strong>{kind === "master" ? "Administrador" : store?.owner}</strong>
              <small>{kind === "master" ? "Proprietário QIOSQ" : "Gerente · demonstração"}</small>
            </div>
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
export function PageHead({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="head-actions">{actions}</div>
    </div>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  const s = String(children);
  return (
    <span
      className={
        "badge " +
        (s === "Suspenso" || s === "Cancelado"
          ? "red"
          : s === "Teste" || s === "Recebido" || s === "Pendente"
            ? "amber"
            : s === "Em preparação" || s === "Confirmado"
              ? "blue"
              : "green")
      }
    >
      {children}
    </span>
  );
}
export function Metrics({
  items,
}: {
  items: { label: string; value: string | number; detail?: string; icon?: ReactNode }[];
}) {
  return (
    <div className="metrics">
      {items.map((v, i) => (
        <div className="metric" key={v.label}>
          <div>
            {v.label}
            {v.icon || <ChartNoAxesCombined size={18} />}
          </div>
          <strong>{v.value}</strong>
          <small>
            {v.detail || "Dados demonstrativos"} {i === 0 && <ArrowUpRight size={13} />}
          </small>
        </div>
      ))}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    ref.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const all = ref.current?.querySelectorAll<HTMLElement>(
          "button,input,select,textarea,a[href]",
        );
        if (!all?.length) return;
        const first = all[0],
          last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = old;
      prev?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <dialog
        open
        className={"modal " + (wide ? "wide" : "")}
        ref={ref}
        tabIndex={-1}
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={onClose} className="icon-btn" aria-label="Fechar">
            <X />
          </button>
        </div>
        {children}
      </dialog>
    </div>
  );
}
export function Field({
  label,
  name,
  value,
  type = "text",
  options,
  required = false,
  onChange,
}: {
  label: string;
  name?: string;
  value?: string | number;
  type?: string;
  options?: string[];
  required?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {options ? (
        <select
          aria-label={label}
          name={name}
          defaultValue={onChange ? undefined : value}
          value={onChange ? value : undefined}
          required={required}
          onChange={(e) => onChange?.(e.target.value)}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          aria-label={label}
          name={name}
          defaultValue={onChange ? undefined : value}
          value={onChange ? value : undefined}
          required={required}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : (
        <input
          aria-label={label}
          name={name}
          type={type}
          step={type === "number" ? "0.01" : undefined}
          min={type === "number" ? 0 : undefined}
          defaultValue={onChange ? undefined : value}
          value={onChange ? value : undefined}
          required={required}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
    </label>
  );
}
export function Empty({ text = "Nenhum resultado encontrado." }: { text?: string }) {
  return (
    <div className="empty">
      <Search size={32} />
      <h3>{text}</h3>
      <p>Experimente outro filtro ou crie um novo registro.</p>
    </div>
  );
}
export function Chart({
  title = "Receita da plataforma",
  values = [25, 38, 30, 50, 43, 62, 55, 76, 64, 84, 78, 95],
  caption = "Histórico ilustrativo · valores fictícios",
}: {
  title?: string;
  values?: number[];
  caption?: string;
}) {
  return (
    <section className="panel chart-panel">
      <div className="panel-title">
        <div>
          <h3>{title}</h3>
          <p>{caption}</p>
        </div>
        <Badge>+18,4%</Badge>
      </div>
      <div className="chart">
        <div className="chart-axis">
          <span>R$ 5 mil</span>
          <span>R$ 3 mil</span>
          <span>R$ 1 mil</span>
          <span>0</span>
        </div>
        <div className="chart-plot">
          <div className="grid-lines" />
          <svg
            viewBox="0 0 600 180"
            preserveAspectRatio="none"
            aria-label="Gráfico de tendência ilustrativo"
          >
            <defs>
              <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#00b8c3" stopOpacity=".25" />
                <stop offset="1" stopColor="#00b8c3" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M0 180 L${values.map((v, i) => `${(i * 600) / (values.length - 1)} ${180 - v * 1.65}`).join(" L")} L600 180 Z`}
              fill="url(#chartFill)"
            />
            <polyline
              points={values
                .map((v, i) => `${(i * 600) / (values.length - 1)},${180 - v * 1.65}`)
                .join(" ")}
              fill="none"
              stroke="#00afbc"
              strokeWidth="3"
            />
          </svg>
          <div className="chart-months">
            {["Jun", "Jul", "Ago", "Set", "Out", "Nov"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export function DemoMap({
  markers,
  selected,
  onSelect,
  onPlace,
  shape = "Círculo",
  regionPoints = [],
  radius = 8,
  showPoints = false,
}: {
  markers: { id: string; name: string; x: number; y: number }[];
  selected?: string;
  onSelect?: (id: string) => void;
  onPlace?: (x: number, y: number) => void;
  shape?: string;
  regionPoints?: { x: number; y: number }[];
  radius?: number;
  showPoints?: boolean;
}) {
  const [zoom, setZoom] = useState(1);
  const chosen = markers.find((m) => m.id === selected) || markers[0];
  return (
    <div className="demo-map">
      <div className="map-surface" style={{ transform: `scale(${zoom})` }}>
        <button
          className="map-canvas"
          aria-label="Mapa demonstrativo: clique para posicionar; Enter para usar o centro"
          onClick={(e) => {
            if (!onPlace) return;
            if (e.detail === 0) { onPlace(50, 50); return; }
            const r = e.currentTarget.getBoundingClientRect();
            onPlace(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
          }}
        >
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
          <rect width="1000" height="600" fill="#eaece4" />
          <path d="M0 420 Q180 590 320 445 T620 370 T1000 210 L1000 600H0Z" fill="#aadce2" />
          <path
            d="M0 413 Q180 583 320 438 T620 363 T1000 203"
            stroke="#f5dfb0"
            strokeWidth="27"
            fill="none"
          />
          <g stroke="#fff" strokeWidth="8">
            {[80, 150, 220, 290, 360, 430, 500, 570, 640, 710, 780, 850, 920].map((x) => (
              <path key={x} d={`M${x} 0L${x + 90} 470`} />
            ))}
            {[60, 140, 220, 300, 380].map((y) => (
              <path key={y} d={`M0 ${y}L1000 ${y - 90}`} />
            ))}
          </g>
          <g fill="#c8d8bf">
            <path d="M0 0H200L240 160 120 240 0 180Z" />
            <path d="M600 0H820L800 140 650 170Z" />
          </g>
          <path d="M0 350Q350 380 620 250T1000 160" fill="none" stroke="#f1ce98" strokeWidth="10" />
          <g fill="#7f938e" fontSize="20" fontFamily="sans-serif">
            <text x="210" y="340">
              LEBLON
            </text>
            <text x="420" y="270">
              IPANEMA
            </text>
            <text x="680" y="175">
              COPACABANA
            </text>
            <text x="780" y="75">
              BOTAFOGO
            </text>
            <text x="450" y="530" fill="#408e9a" fontSize="23">
              OCEANO ATLÂNTICO
            </text>
          </g>
          {chosen && shape === "Círculo" && (
            <circle
              cx={chosen.x * 10}
              cy={chosen.y * 6}
              r={radius * 12}
              fill="#00b7c220"
              stroke="#00a5b2"
              strokeWidth="2"
              strokeDasharray="8 5"
            />
          )}
          {shape === "Polígono" && regionPoints.length > 1 && (
            <polygon
              points={regionPoints.map((p) => `${p.x * 10},${p.y * 6}`).join(" ")}
              fill="#00b7c230"
              stroke="#00a5b2"
              strokeWidth="3"
            />
          )}
        </svg>
        </button>
        {markers.map((m) => (
          <button
            key={m.id}
            className={"map-pin " + (selected === m.id ? "chosen" : "")}
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            onClick={() => onSelect?.(m.id)}
            title={m.name}
          >
            <MapPin size={showPoints ? 16 : 21} />
            <span>{m.name}</span>
          </button>
        ))}
      </div>
      <div className="map-controls">
        <button onClick={() => setZoom(Math.min(1.6, zoom + 0.15))} aria-label="Ampliar">
          <Plus size={18} />
        </button>
        <button onClick={() => setZoom(Math.max(1, zoom - 0.15))} aria-label="Reduzir">
          <Minus size={18} />
        </button>
        <button onClick={() => setZoom(1)} aria-label="Centralizar">
          <LocateFixed size={18} />
        </button>
      </div>
      <div className="map-note">Mapa ilustrativo QIOSQ · não geográfico</div>
      <div className="map-brand">
        <Logo small />
      </div>
    </div>
  );
}
export function Support() {
  const { notify } = useDemo();
  return (
    <>
      <PageHead
        title="Como podemos ajudar?"
        description="Central de suporte QIOSQ · demonstração"
      />
      <div className="two-col">
        <section className="panel">
          <h3>Abrir chamado</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              notify("Chamado demonstrativo registrado. Nenhuma mensagem foi enviada.");
              e.currentTarget.reset();
            }}
          >
            <Field label="Assunto" required name="subject" />
            <Field
              label="Categoria"
              options={["Acesso e conta", "Pedidos", "Pagamentos", "Outros"]}
            />
            <Field label="Descreva sua solicitação" required type="textarea" />
            <button className="btn">
              Registrar chamado fictício <ArrowRight size={16} />
            </button>
          </form>
        </section>
        <section className="panel">
          <h3>Perguntas frequentes</h3>
          {[
            [
              "Como cadastrar um estabelecimento?",
              "Acesse Master → Estabelecimentos → Cadastrar estabelecimento.",
            ],
            [
              "Como acessar o painel empresarial?",
              "Na listagem de estabelecimentos, use Abrir painel.",
            ],
            [
              "Os pagamentos são reais?",
              "Não. Esta versão utiliza apenas simulações identificadas.",
            ],
            [
              "Os dados estão seguros para operação real?",
              "Este protótipo usa armazenamento local. Autenticação e isolamento no servidor serão implementados na etapa 2.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      </div>
    </>
  );
}
