import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import QRCode from "qrcode";
import {
  Plus,
  ArrowUpRight,
  Download,
  Pencil,
  Trash2,
  Search,
  Users,
  Wallet,
  ShoppingBag,
  Clock,
  CheckCircle,
  MapPin,
  Image as ImageIcon,
  QrCode,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";
import { useDemo, money, uid, downloadCSV } from "../lib/demo";
import type { Product, Member, Point, Store, Region } from "../lib/demo";
import {
  AdminShell,
  PageHead,
  Metrics,
  Badge,
  Chart,
  Modal,
  Field,
  Empty,
  DemoMap,
} from "../components/qiosq";
import { OrdersBoard } from "../components/orders";
export function Business({ tenant }: { tenant: string }) {
  const { data } = useDemo();
  const [loc] = useLocation();
  const section = loc.split("/")[3] || "";
  const s = data.stores.find((v) => v.id === tenant);
  const orders = data.orders.filter((o) => o.tenantId === tenant);
  const total = orders.filter((o) => o.status !== "Cancelado").reduce((t, o) => t + o.total, 0);
  if (!s)
    return (
      <div className="not-found">
        <h1>Estabelecimento não encontrado</h1>
        <Link href="/master/estabelecimentos" className="btn">
          Voltar ao Master
        </Link>
      </div>
    );
  return (
    <AdminShell kind="business" tenant={tenant}>
      {s.status === "Suspenso" && (
        <div className="notice danger">
          Conta suspensa. O painel continua acessível somente para demonstração; pedidos públicos
          estão desativados.
        </div>
      )}
      {section === "" && (
        <>
          <PageHead
            eyebrow="QIOSQ BUSINESS"
            title={`Bom dia, ${s.owner.split(" ")[0]}.`}
            description={`Tudo o que acontece no ${s.name}, em um só lugar.`}
            actions={
              <>
                <Link href={`/menu/${tenant}`} className="btn secondary">
                  Ver cardápio <ArrowUpRight size={16} />
                </Link>
                <Link className="btn" href={`/business/${tenant}/pedidos`}>
                  Gerenciar pedidos <ArrowRight size={16} />
                </Link>
              </>
            }
          />
          <div className="business-banner">
            <div>
              <Badge>{s.status}</Badge>
              <h2>{s.name}</h2>
              <p>
                <MapPin size={16} /> {s.address} · {s.city}
              </p>
              <span>
                {s.hours} · Plano {s.plan}
              </span>
            </div>
            <img src="/images/beach.jpg" alt="Praia do Rio de Janeiro" />
          </div>
          <Metrics
            items={[
              { label: "Vendas demonstrativas", value: money(total), icon: <Wallet size={18} /> },
              {
                label: "Pedidos recebidos",
                value: orders.length,
                detail: `${orders.filter((o) => o.status === "Recebido").length} aguardando confirmação`,
                icon: <ShoppingBag size={18} />,
              },
              {
                label: "Em preparação",
                value: orders.filter((o) => o.status === "Em preparação").length,
                detail: `${orders.filter((o) => o.status === "Concluído").length} concluídos`,
                icon: <Clock size={18} />,
              },
              {
                label: "Ticket médio",
                value: money(total / (orders.length || 1)),
                detail: "Média dos pedidos de demonstração",
                icon: <ChartIcon />,
              },
            ]}
          />
          <div className="dashboard-grid">
            <Chart title="Vendas do estabelecimento" />
            <section className="panel">
              <h3>Mais vendidos</h3>
              {Object.entries(
                orders.reduce(
                  (a, o) => {
                    o.items.forEach((i) => (a[i.name] = (a[i.name] || 0) + i.qty));
                    return a;
                  },
                  {} as Record<string, number>,
                ),
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([name, qty], i) => (
                  <div className="bestseller" key={name}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{name}</strong>
                      <small>{qty} unidades</small>
                    </div>
                    <UtensilsCrossed size={17} />
                  </div>
                ))}
            </section>
          </div>
          <section className="panel">
            <div className="panel-title">
              <h3>Operação de hoje</h3>
              <Link href={`/staff/${tenant}`} className="text-link">
                Abrir QIOSQ Staff <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="operation-grid">
              {[
                ["Recebidos", orders.filter((o) => o.status === "Recebido").length],
                ["Em preparação", orders.filter((o) => o.status === "Em preparação").length],
                ["Prontos", orders.filter((o) => o.status === "Pronto").length],
                ["Concluídos", orders.filter((o) => o.status === "Concluído").length],
              ].map(([l, v]) => (
                <Link key={l} href={`/business/${tenant}/pedidos`}>
                  <strong>{v}</strong>
                  <span>{l}</span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
      {section === "pedidos" && (
        <>
          <PageHead
            title="Central de pedidos"
            description="Pedidos locais e delivery. Alterações aparecem no Staff e no acompanhamento do cliente."
            actions={
              <button
                className="btn secondary"
                onClick={() => downloadCSV("pedidos-" + tenant, orders)}
              >
                <Download size={16} /> Exportar
              </button>
            }
          />
          <OrdersBoard tenant={tenant} />
        </>
      )}
      {section === "cardapio" && <Products tenant={tenant} />}
      {section === "equipe" && <Team tenant={tenant} />}
      {section === "qrcodes" && <Points tenant={tenant} />}
      {section === "localizacao" && <Location store={s} />}
      {section === "delivery" && <DeliverySettings store={s} />}
      {section === "financeiro" && <Finance tenant={tenant} />}
      {section === "relatorios" && <Reports tenant={tenant} />}
      {section === "configuracoes" && <BusinessSettings store={s} />}
    </AdminShell>
  );
}
function ChartIcon() {
  return <ShoppingBag size={18} />;
}
function Products({ tenant }: { tenant: string }) {
  const { data, mutate, notify } = useDemo();
  const [edit, setEdit] = useState<Product | true | null>(null);
  const [remove, setRemove] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [catModal, setCatModal] = useState(false);
  const [preview, setPreview] = useState("/images/shrimp.jpg");
  const products = data.products.filter(
    (p) =>
      p.tenantId === tenant &&
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (category === "Todos" || category === p.category),
  );
  const cats = data.categories.filter((c) => c.tenantId === tenant);
  return (
    <>
      <PageHead
        title="Seu cardápio, sua identidade."
        description="Produtos, categorias, combos e promoções em um só lugar."
        actions={
          <>
            <button className="btn secondary" onClick={() => setCatModal(true)}>
              Gerenciar categorias
            </button>
            <button
              className="btn"
              onClick={() => {
                setEdit(true);
                setPreview("/images/shrimp.jpg");
              }}
            >
              <Plus size={17} /> Adicionar produto
            </button>
          </>
        }
      />
      <section className="panel no-pad">
        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input aria-label="Buscar produto"
              placeholder="Buscar produto"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {["Todos", ...cats.map((c) => c.name)].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <Link className="text-link" href={`/menu/${tenant}`}>
            Prévia do cardápio <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Disponibilidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td aria-label="Informação do registro">
                    <div className="product-cell">
                      <img src={p.image} alt={p.name} />
                      <div>
                        <strong>
                          {p.name}
                          {p.promo && <Badge>Promoção</Badge>}
                        </strong>
                        <small>{p.description}</small>
                      </div>
                    </div>
                  </td>
                  <td aria-label="Informação do registro">{p.category}</td>
                  <td aria-label="Informação do registro">{money(p.price)}</td>
                  <td aria-label="Informação do registro">
                    <button
                      className={"toggle " + (p.available ? "on" : "")}
                      onClick={() =>
                        mutate(
                          (d) => ({
                            ...d,
                            products: d.products.map((v) =>
                              v.id === p.id ? { ...v, available: !v.available } : v,
                            ),
                          }),
                          "Disponibilidade atualizada.",
                        )
                      }
                      aria-label={`Disponibilidade ${p.name}`}
                      aria-pressed={p.available}
                    >
                      <i />
                    </button>
                    <small>{p.available ? "Disponível" : "Indisponível"}</small>
                  </td>
                  <td aria-label="Informação do registro">
                    <div className="table-actions">
                      <button
                        className="icon-btn"
                        title="Editar produto"
                        onClick={() => {
                          setEdit(p);
                          setPreview(p.image);
                        }}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        className="icon-btn danger"
                        title="Excluir produto"
                        onClick={() => setRemove(p)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length && <Empty text="Seu cardápio está pronto para receber produtos." />}
        </div>
      </section>
      {edit && (
        <Modal
          title={edit === true ? "Adicionar produto" : "Editar produto"}
          onClose={() => setEdit(null)}
          wide
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const p: Product = {
                id: edit === true ? uid() : edit.id,
                tenantId: tenant,
                name: String(f.get("name")),
                description: String(f.get("description")),
                price: Number(f.get("price")),
                category: String(f.get("category")),
                image: preview,
                available: f.get("available") === "on",
                extras: String(f.get("extras")),
                variations: String(f.get("variations")),
                promo: f.get("promo") === "on",
              };
              mutate(
                (d) => ({
                  ...d,
                  products:
                    edit === true
                      ? [...d.products, p]
                      : d.products.map((v) => (v.id === p.id ? p : v)),
                }),
                "Produto salvo no cardápio demonstrativo.",
              );
              setEdit(null);
            }}
          >
            <div className="product-editor-photo">
              <img src={preview} alt="Prévia do produto" />
              <label className="btn secondary">
                <ImageIcon size={16} /> Adicionar fotografia
                <input aria-label="Campo do formulário"
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.size > 2 * 1024 * 1024) {
                        notify("Use uma imagem menor que 2 MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => setPreview(String(reader.result));
                      reader.readAsDataURL(f);
                    }
                  }}
                />
              </label>
              <select
                value={preview.startsWith("data:") ? "upload" : preview}
                onChange={(e) => setPreview(e.target.value)}
              >
                <option value="/images/shrimp.jpg">Camarão</option>
                <option value="/images/drink.jpg">Bebida</option>
                <option value="/images/burger.jpg">Burger</option>
                <option value="/images/fish.jpg">Peixe</option>
                {preview.startsWith("data:") && <option value="upload">Sua fotografia</option>}
              </select>
            </div>
            <div className="form-grid">
              <Field
                label="Nome do produto"
                name="name"
                value={edit === true ? "" : edit.name}
                required
              />
              <Field
                label="Preço (R$)"
                name="price"
                type="number"
                value={edit === true ? 0 : edit.price}
                required
              />
              <Field
                label="Categoria"
                name="category"
                options={cats.length ? cats.map((c) => c.name) : ["Grelhados"]}
                value={edit === true ? "Grelhados" : edit.category}
              />
              <Field
                label="Variações (separadas por ;)"
                name="variations"
                value={edit === true ? "Tradicional;Sem pimenta" : edit.variations}
              />
            </div>
            <Field
              label="Descrição"
              name="description"
              type="textarea"
              value={edit === true ? "" : edit.description}
              required
            />
            <Field
              label="Adicionais e complementos (Nome:preço;Nome:preço)"
              name="extras"
              value={edit === true ? "Molho extra:5;Fritas extra:12" : edit.extras}
            />
            <div className="check-row">
              <label>
                <input aria-label="available"
                  type="checkbox"
                  name="available"
                  defaultChecked={edit === true || edit.available}
                />{" "}
                Disponível no cardápio
              </label>
              <label>
                <input aria-label="promo" type="checkbox" name="promo" defaultChecked={edit !== true && edit.promo} />{" "}
                Promoção / combo
              </label>
            </div>
            <div className="form-actions">
              <button className="btn secondary" type="button" onClick={() => setEdit(null)}>
                Cancelar
              </button>
              <button className="btn">Salvar produto</button>
            </div>
          </form>
        </Modal>
      )}
      {remove && (
        <Modal title="Excluir produto?" onClose={() => setRemove(null)}>
          <p>Remover {remove.name} do cardápio demonstrativo?</p>
          <div className="form-actions">
            <button className="btn secondary" onClick={() => setRemove(null)}>
              Cancelar
            </button>
            <button
              className="btn destructive"
              onClick={() => {
                mutate(
                  (d) => ({ ...d, products: d.products.filter((p) => p.id !== remove.id) }),
                  "Produto excluído.",
                );
                setRemove(null);
              }}
            >
              Excluir
            </button>
          </div>
        </Modal>
      )}
      {catModal && (
        <Modal title="Categorias do cardápio" onClose={() => setCatModal(false)}>
          {cats.map((c) => (
            <div className="category-edit-row" key={c.id}>
              <input
                aria-label="Nome da categoria"
                defaultValue={c.name}
                onBlur={(e) => {
                  const name = e.target.value.trim();
                  if (name && name !== c.name)
                    mutate(
                      (d) => ({
                        ...d,
                        categories: d.categories.map((v) => (v.id === c.id ? { ...v, name } : v)),
                        products: d.products.map((p) =>
                          p.tenantId === tenant && p.category === c.name
                            ? { ...p, category: name }
                            : p,
                        ),
                      }),
                      "Categoria renomeada.",
                    );
                }}
              />
              <button
                className="icon-btn danger"
                title="Remover categoria vazia"
                onClick={() => {
                  if (data.products.some((p) => p.tenantId === tenant && p.category === c.name)) {
                    notify("Mova os produtos para outra categoria antes de excluir.");
                    return;
                  }
                  mutate(
                    (d) => ({ ...d, categories: d.categories.filter((v) => v.id !== c.id) }),
                    "Categoria vazia removida.",
                  );
                }}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget),
                name = String(f.get("name")).trim();
              if (cats.some((c) => c.name === name)) {
                notify("Esta categoria já existe.");
                return;
              }
              mutate(
                (d) => ({
                  ...d,
                  categories: [...d.categories, { id: uid(), tenantId: tenant, name }],
                }),
                "Categoria criada.",
              );
              e.currentTarget.reset();
            }}
          >
            <Field label="Nova categoria" name="name" required />
            <button className="btn full">
              <Plus size={16} /> Criar categoria
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
function Team({ tenant }: { tenant: string }) {
  const { data, mutate } = useDemo();
  const [edit, setEdit] = useState<Member | true | null>(null);
  const [remove, setRemove] = useState<Member | null>(null);
  return (
    <>
      <PageHead
        title="Equipe e permissões"
        description="Acessos individuais por função — representação visual, sem credenciais reais."
        actions={
          <button className="btn" onClick={() => setEdit(true)}>
            <Plus size={17} /> Adicionar funcionário
          </button>
        }
      />
      <section className="panel no-pad">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Função</th>
                <th>Permissões</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.members
                .filter((m) => m.tenantId === tenant)
                .map((m) => (
                  <tr key={m.id}>
                    <td aria-label="Informação do registro">
                      <strong>{m.name}</strong>
                      <small>{m.email}</small>
                    </td>
                    <td aria-label="Informação do registro">{m.role}</td>
                    <td aria-label="Informação do registro">{m.permissions.join(", ")}</td>
                    <td aria-label="Informação do registro">
                      <Badge>{m.active ? "Ativo" : "Suspenso"}</Badge>
                    </td>
                    <td aria-label="Informação do registro">
                      <div className="table-actions">
                        <button
                          className="icon-btn"
                          title="Editar funcionário"
                          onClick={() => setEdit(m)}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Excluir funcionário"
                          onClick={() => setRemove(m)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      {edit && (
        <Modal
          title={edit === true ? "Adicionar funcionário" : "Editar funcionário"}
          onClose={() => setEdit(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const m: Member = {
                id: edit === true ? uid() : edit.id,
                tenantId: tenant,
                name: String(f.get("name")),
                email: String(f.get("email")),
                role: String(f.get("role")),
                active: f.get("active") === "on",
                permissions: f.getAll("permissions").map(String),
              };
              mutate(
                (d) => ({
                  ...d,
                  members:
                    edit === true
                      ? [...d.members, m]
                      : d.members.map((v) => (v.id === m.id ? m : v)),
                }),
                "Funcionário salvo. Nenhum convite real foi enviado.",
              );
              setEdit(null);
            }}
          >
            <Field label="Nome" name="name" value={edit === true ? "" : edit.name} required />
            <Field
              label="E-mail"
              type="email"
              name="email"
              value={edit === true ? "" : edit.email}
              required
            />
            <Field
              label="Função"
              name="role"
              options={["Gerente", "Atendente", "Garçom", "Caixa", "Cozinha"]}
              value={edit === true ? "Atendente" : edit.role}
            />
            <h4>Permissões demonstrativas</h4>
            <div className="check-row">
              {["Pedidos", "Cardápio", "Financeiro", "Equipe", "Relatórios"].map((p) => (
                <label key={p}>
                  <input aria-label="permissions"
                    type="checkbox"
                    name="permissions"
                    value={p}
                    defaultChecked={edit === true ? p === "Pedidos" : edit.permissions.includes(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
            <label className="check-label">
              <input aria-label="active" type="checkbox" name="active" defaultChecked={edit === true || edit.active} />
              Funcionário ativo
            </label>
            <div className="form-actions">
              <button className="btn">Salvar funcionário</button>
            </div>
          </form>
        </Modal>
      )}
      {remove && (
        <Modal title="Excluir funcionário?" onClose={() => setRemove(null)}>
          <p>Excluir o acesso demonstrativo de {remove.name}?</p>
          <div className="form-actions">
            <button className="btn secondary" onClick={() => setRemove(null)}>
              Cancelar
            </button>
            <button
              className="btn destructive"
              onClick={() => {
                mutate(
                  (d) => ({ ...d, members: d.members.filter((m) => m.id !== remove.id) }),
                  "Funcionário removido.",
                );
                setRemove(null);
              }}
            >
              Excluir
            </button>
          </div>
        </Modal>
      )}
      <div className="notice">
        Os perfis organizam a interface. O controle de acesso real será aplicado também no servidor
        na etapa de backend.
      </div>
    </>
  );
}
function QrPreview({ tenant, point }: { tenant: string; point: Point }) {
  const [img, setImg] = useState("");
  const url = window.location.origin + `/menu/${tenant}?point=${encodeURIComponent(point.name)}`;
  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: { dark: "#063d57", light: "#ffffff" },
    }).then(setImg);
  }, [url]);
  return (
    <div className="qr-preview">
      {img ? <img src={img} alt={`QR Code de ${point.name}`} /> : <QrCode size={120} />}
      <strong>{point.name}</strong>
      <small>QR para o protótipo · válido neste endereço de acesso</small>
      <Link
        className="btn secondary"
        href={`/menu/${tenant}?point=${encodeURIComponent(point.name)}`}
      >
        Testar acesso <ArrowUpRight size={14} />
      </Link>
      <a className="text-link" href={img} download={`qiosq-${point.name}.png`}>
        <Download size={16} /> Baixar QR de demonstração
      </a>
    </div>
  );
}
function Points({ tenant }: { tenant: string }) {
  const { data, mutate } = useDemo();
  const [edit, setEdit] = useState<Point | true | null>(null);
  const [qr, setQr] = useState<Point | null>(null);
  const [remove, setRemove] = useState<Point | null>(null);
  return (
    <>
      <PageHead
        title="QR Codes e pontos de atendimento"
        description="Uma experiência personalizada para cada mesa, cadeira ou guarda-sol."
        actions={
          <button className="btn" onClick={() => setEdit(true)}>
            <Plus size={17} /> Criar ponto / QR Code
          </button>
        }
      />
      <div className="qr-grid">
        {data.points
          .filter((p) => p.tenantId === tenant)
          .map((p) => (
            <section className="panel qr-card" key={p.id}>
              <div className="panel-title">
                <Badge>{p.type}</Badge>
                <button className="icon-btn" title="Editar ponto" onClick={() => setEdit(p)}>
                  <Pencil size={16} />
                </button>
              </div>
              <div className="qr-icon">
                <QrCode size={64} strokeWidth={1.2} />
              </div>
              <h3>{p.name}</h3>
              <button className="btn secondary full" onClick={() => setQr(p)}>
                Visualizar QR Code
              </button>
              <button className="text-link danger" onClick={() => setRemove(p)}>
                Remover ponto
              </button>
            </section>
          ))}
      </div>
      {edit && (
        <Modal
          title={edit === true ? "Criar ponto de atendimento" : "Editar ponto"}
          onClose={() => setEdit(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const p: Point = {
                id: edit === true ? uid() : edit.id,
                tenantId: tenant,
                name: String(f.get("name")),
                type: String(f.get("type")),
                x: Number(f.get("x")),
                y: Number(f.get("y")),
              };
              mutate(
                (d) => ({
                  ...d,
                  points:
                    edit === true ? [...d.points, p] : d.points.map((v) => (v.id === p.id ? p : v)),
                }),
                "Ponto de atendimento salvo.",
              );
              setEdit(null);
            }}
          >
            <Field
              label="Nome / identificação"
              name="name"
              required
              value={edit === true ? "" : edit.name}
            />
            <Field
              label="Tipo"
              name="type"
              options={[
                "Mesa",
                "Cadeira",
                "Guarda-sol",
                "Área VIP",
                "Balcão",
                "Ponto de atendimento",
              ]}
              value={edit === true ? "Mesa" : edit.type}
            />
            <div className="form-grid">
              <Field
                label="Posição X (0 a 100)"
                name="x"
                type="number"
                value={edit === true ? 50 : edit.x}
                required
              />
              <Field
                label="Posição Y (0 a 100)"
                name="y"
                type="number"
                value={edit === true ? 50 : edit.y}
                required
              />
            </div>
            <button className="btn full">Salvar ponto</button>
          </form>
        </Modal>
      )}
      {qr && (
        <Modal title="QR Code demonstrativo" onClose={() => setQr(null)}>
          <QrPreview tenant={tenant} point={qr} />
        </Modal>
      )}
      {remove && (
        <Modal title="Remover ponto?" onClose={() => setRemove(null)}>
          <p>Excluir {remove.name} e seu QR Code demonstrativo?</p>
          <div className="form-actions">
            <button className="btn secondary" onClick={() => setRemove(null)}>
              Cancelar
            </button>
            <button
              className="btn destructive"
              onClick={() => {
                mutate(
                  (d) => ({ ...d, points: d.points.filter((p) => p.id !== remove.id) }),
                  "Ponto removido.",
                );
                setRemove(null);
              }}
            >
              Remover
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function Location({ store }: { store: Store }) {
  const { data, mutate } = useDemo();
  const [pos, setPos] = useState({ x: store.x, y: store.y });
  const [tool, setTool] = useState("Localização");
  const [shape, setShape] = useState("Círculo");
  const [radius, setRadius] = useState(store.radius);
  const [vertices, setVertices] = useState<{ x: number; y: number }[]>([]);
  const [name, setName] = useState("Nova região");
  const [remove, setRemove] = useState<Region | null>(null);
  return (
    <>
      <PageHead
        title="Localização e áreas de atendimento"
        description="Posicione seu negócio, organize pontos e desenhe regiões no mapa demonstrativo."
      />
      <div className="map-editor-grid">
        <section className="panel">
          <div className="tabs compact">
            {["Localização", "Região", "Pontos"].map((t) => (
              <button className={tool === t ? "active" : ""} key={t} onClick={() => setTool(t)}>
                {t}
              </button>
            ))}
          </div>
          {tool === "Localização" && (
            <>
              <p className="muted">Clique no mapa para posicionar o estabelecimento.</p>
              <p>
                <MapPin size={16} /> {store.address}
              </p>
              <button
                className="btn full"
                onClick={() =>
                  mutate(
                    (d) => ({
                      ...d,
                      stores: d.stores.map((s) => (s.id === store.id ? { ...s, ...pos } : s)),
                    }),
                    "Localização demonstrativa salva.",
                  )
                }
              >
                Salvar localização
              </button>
            </>
          )}
          {tool === "Região" && (
            <>
              <Field label="Nome da região" value={name} onChange={setName} />
              <Field
                label="Forma"
                options={["Círculo", "Polígono"]}
                value={shape}
                onChange={setShape}
              />
              {shape === "Círculo" ? (
                <Field
                  label="Raio ilustrativo (km)"
                  type="number"
                  value={radius}
                  onChange={(v) => setRadius(Number(v))}
                />
              ) : (
                <p className="muted">
                  Clique no mapa para desenhar. {vertices.length} vértices adicionados.
                </p>
              )}
              <button
                className="btn full"
                disabled={shape === "Polígono" && vertices.length < 3}
                onClick={() => {
                  mutate(
                    (d) => ({
                      ...d,
                      regions: [
                        ...d.regions,
                        {
                          id: uid(),
                          tenantId: store.id,
                          name,
                          shape,
                          radius,
                          points: shape === "Polígono" ? vertices : [pos],
                        },
                      ],
                    }),
                    "Região demonstrativa criada.",
                  );
                  setVertices([]);
                }}
              >
                Salvar região
              </button>
              <button className="text-link" onClick={() => setVertices([])}>
                Limpar desenho
              </button>
            </>
          )}
          {tool === "Pontos" && (
            <>
              <p className="muted">Clique num ponto e depois no mapa para reposicioná-lo.</p>
              <Link href={`/business/${store.id}/qrcodes`} className="btn secondary full">
                Gerenciar pontos e QR Codes
              </Link>
            </>
          )}
          <h4>Regiões salvas</h4>
          {data.regions
            .filter((r) => r.tenantId === store.id)
            .map((r) => (
              <div className="region-row" key={r.id}>
                <button className="region-select" onClick={() => {
                  setTool("Região"); setName(r.name); setShape(r.shape); setRadius(r.radius);
                  setVertices(r.shape === "Polígono" ? r.points : []);
                  if (r.shape === "Círculo" && r.points[0]) setPos(r.points[0]);
                }}>
                  {r.name}
                  <small>
                    {r.shape} · {r.radius} km ilustrativos
                  </small>
                </button>
                <button
                  className="icon-btn danger"
                  title="Excluir região"
                  onClick={() => setRemove(r)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
        </section>
        <LocationMap
          store={store}
          pos={pos}
          setPos={setPos}
          tool={tool}
          shape={shape}
          vertices={vertices}
          setVertices={setVertices}
          radius={radius}
        />
      </div>
      {remove && (
        <Modal title="Excluir região?" onClose={() => setRemove(null)}>
          <p>Excluir a região demonstrativa {remove.name}?</p>
          <div className="form-actions">
            <button className="btn secondary" onClick={() => setRemove(null)}>
              Cancelar
            </button>
            <button
              className="btn destructive"
              onClick={() => {
                mutate(
                  (d) => ({ ...d, regions: d.regions.filter((r) => r.id !== remove.id) }),
                  "Região removida.",
                );
                setRemove(null);
              }}
            >
              Excluir
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function LocationMap({ store, pos, setPos, tool, shape, vertices, setVertices, radius }: any) {
  const { data, mutate } = useDemo();
  const [selected, setSelected] = useState("");
  const markers =
    tool === "Pontos"
      ? data.points.filter((p) => p.tenantId === store.id)
      : [{ id: store.id, name: store.name, ...pos }];
  return (
    <DemoMap
      markers={markers}
      selected={tool === "Pontos" ? selected : store.id}
      showPoints={tool === "Pontos"}
      onSelect={setSelected}
      shape={shape}
      regionPoints={vertices}
      radius={radius}
      onPlace={(x, y) => {
        if (tool === "Região" && shape === "Polígono") {
          setVertices([...vertices, { x, y }]);
          return;
        }
        if (tool === "Pontos" && selected) {
          mutate(
            (d) => ({
              ...d,
              points: d.points.map((p) => (p.id === selected ? { ...p, x, y } : p)),
            }),
            "Ponto reposicionado.",
          );
          return;
        }
        setPos({ x, y });
      }}
    />
  );
}
function DeliverySettings({ store }: { store: Store }) {
  const { mutate } = useDemo();
  const [couriers, setCouriers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("qiosq-couriers-" + store.id) || "[]");
    } catch {
      return [];
    }
  });
  const [add, setAdd] = useState(false);
  return (
    <>
      <PageHead
        title="Delivery do estabelecimento"
        description="Defina como os sabores do seu negócio chegam mais longe."
        actions={
          <Link href="/delivery" className="btn secondary">
            Explorar mapa público <ArrowUpRight size={16} />
          </Link>
        }
      />
      <div className="two-col">
        <section className="panel">
          <h3>Configurações de entrega</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              mutate(
                (d) => ({
                  ...d,
                  stores: d.stores.map((s) =>
                    s.id === store.id
                      ? {
                          ...s,
                          delivery: f.get("delivery") === "on",
                          radius: Number(f.get("radius")),
                          fee: Number(f.get("fee")),
                          minimum: Number(f.get("minimum")),
                          estimate: String(f.get("estimate")),
                          hours: String(f.get("hours")),
                        }
                      : s,
                  ),
                }),
                "Configurações de delivery salvas.",
              );
            }}
          >
            <label className="check-label">
              <input aria-label="delivery" name="delivery" type="checkbox" defaultChecked={store.delivery} /> Delivery
              ativado
            </label>
            <div className="form-grid">
              <Field
                label="Raio de entrega (km)"
                name="radius"
                type="number"
                value={store.radius}
                required
              />
              <Field
                label="Taxa de entrega (R$)"
                name="fee"
                type="number"
                value={store.fee}
                required
              />
              <Field
                label="Pedido mínimo (R$)"
                name="minimum"
                type="number"
                value={store.minimum}
                required
              />
              <Field label="Tempo estimado" name="estimate" value={store.estimate} required />
            </div>
            <Field label="Horários de delivery" name="hours" value={store.hours} />
            <button className="btn full">Salvar configurações</button>
          </form>
        </section>
        <section className="panel">
          <h3>Área de entrega demonstrativa</h3>
          <DemoMap markers={[store]} selected={store.id} radius={store.radius} />
          <Link href={`/business/${store.id}/localizacao`} className="text-link">
            Desenhar círculos e polígonos <ArrowRight size={16} />
          </Link>
          <div className="notice">
            As distâncias são ilustrativas. Verificação geográfica e cálculo real de taxas pertencem
            à etapa 4.
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="panel-title">
          <h3>Entregadores</h3>
          <button className="btn secondary mini" onClick={() => setAdd(true)}>
            <Plus size={15} /> Adicionar entregador
          </button>
        </div>
        {couriers.length ? (
          couriers.map((c: any) => (
            <div className="courier-row" key={c.id}>
              <span className="avatar">{c.name[0]}</span>
              <div>
                <strong>{c.name}</strong>
                <small>
                  {c.phone} · {c.vehicle}
                </small>
              </div>
              <button
                className="text-link"
                onClick={() => {
                  const next = couriers.map((v: any) =>
                    v.id === c.id ? { ...v, available: !v.available } : v,
                  );
                  setCouriers(next);
                  localStorage.setItem("qiosq-couriers-" + store.id, JSON.stringify(next));
                }}
              >
                {c.available ? "Disponível" : "Indisponível"}
              </button>
            </div>
          ))
        ) : (
          <p className="muted">Nenhum entregador cadastrado. Adicione um perfil demonstrativo.</p>
        )}
      </section>
      {add && (
        <Modal title="Adicionar entregador" onClose={() => setAdd(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const next = [
                ...couriers,
                {
                  id: uid(),
                  name: String(f.get("name")),
                  phone: String(f.get("phone")),
                  vehicle: String(f.get("vehicle")),
                  available: true,
                },
              ];
              setCouriers(next);
              localStorage.setItem("qiosq-couriers-" + store.id, JSON.stringify(next));
              setAdd(false);
            }}
          >
            <Field label="Nome" name="name" required />
            <Field label="Telefone" name="phone" required />
            <Field label="Veículo" name="vehicle" options={["Bicicleta", "Moto", "A pé"]} />
            <button className="btn full">Salvar entregador demonstrativo</button>
          </form>
        </Modal>
      )}
    </>
  );
}
function Finance({ tenant }: { tenant: string }) {
  const { data, mutate } = useDemo();
  const orders = data.orders.filter((o) => o.tenantId === tenant && o.status !== "Cancelado");
  const paid = orders.reduce((t, o) => t + o.paid, 0),
    total = orders.reduce((t, o) => t + o.total, 0);
  return (
    <>
      <PageHead
        title="Financeiro do estabelecimento"
        description="Faturamento, pagamentos e saldos. Valores exclusivamente fictícios."
        actions={
          <button
            className="btn secondary"
            onClick={() =>
              downloadCSV(
                "financeiro-" + tenant,
                orders.map((o) => ({
                  pedido: o.id,
                  total: o.total,
                  pago: o.paid,
                  pendente: o.total - o.paid,
                  metodo: o.payment,
                })),
              )
            }
          >
            <Download size={16} /> Exportar
          </button>
        }
      />
      <Metrics
        items={[
          { label: "Faturamento demonstrativo", value: money(total) },
          { label: "Pagamentos confirmados", value: money(paid) },
          { label: "Saldo pendente", value: money(total - paid) },
          {
            label: "Taxa de entrega configurada",
            value: money(data.stores.find((s) => s.id === tenant)?.fee || 0),
          },
        ]}
      />
      <Chart title="Faturamento ilustrativo" />
      <section className="panel no-pad">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Método</th>
                <th>Total</th>
                <th>Pago / pendente</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td aria-label="Informação do registro">#{o.id}</td>
                  <td aria-label="Informação do registro">{o.customer}</td>
                  <td aria-label="Informação do registro">{o.payment}</td>
                  <td aria-label="Informação do registro">{money(o.total)}</td>
                  <td aria-label="Informação do registro">
                    {money(o.paid)} / {money(o.total - o.paid)}
                  </td>
                  <td aria-label="Informação do registro">
                    {o.paid < o.total ? (
                      <button
                        className="text-link"
                        onClick={() =>
                          mutate(
                            (d) => ({
                              ...d,
                              orders: d.orders.map((v) =>
                                v.id === o.id ? { ...v, paid: v.total } : v,
                              ),
                            }),
                            "Pagamento confirmado somente na demonstração.",
                          )
                        }
                      >
                        Confirmar pagamento fictício
                      </button>
                    ) : (
                      <Badge>Pago</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function Reports({ tenant }: { tenant: string }) {
  const { data } = useDemo();
  const [period, setPeriod] = useState("Todos");
  const orders = data.orders.filter(
    (o) =>
      o.tenantId === tenant &&
      (period === "Todos" || (period === "Local" ? o.type === "Local" : o.type === "Delivery")),
  );
  const total = orders.reduce((t, o) => t + o.total, 0);
  return (
    <>
      <PageHead
        title="Relatórios e inteligência"
        description="Conheça seus produtos, seus clientes e seu desempenho demonstrativo."
        actions={
          <>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              {["Todos", "Local", "Delivery"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button
              className="btn secondary"
              onClick={() => downloadCSV("relatorio-" + tenant, orders)}
            >
              <Download size={16} /> Exportar
            </button>
          </>
        }
      />
      <Metrics
        items={[
          { label: "Faturamento", value: money(total) },
          { label: "Pedidos", value: orders.length },
          { label: "Ticket médio", value: money(total / (orders.length || 1)) },
          {
            label: "Pedidos concluídos",
            value: orders.filter((o) => o.status === "Concluído").length,
          },
        ]}
      />
      <div className="two-col">
        <Chart title="Vendas ilustrativas" />
        <section className="panel">
          <h3>Distribuição por canal</h3>
          {["Local", "Delivery"].map((t) => (
            <div className="rank-row" key={t}>
              <span>{t}</span>
              <div className="progress">
                <i
                  style={{
                    width: `${(orders.filter((o) => o.type === t).length / (orders.length || 1)) * 100}%`,
                  }}
                />
              </div>
              <strong>{orders.filter((o) => o.type === t).length}</strong>
            </div>
          ))}
          <div className="notice">
            Estatísticas calculadas dos pedidos locais. Histórico, tempo de atendimento e
            crescimento ilustrativos, não medições operacionais.
          </div>
        </section>
      </div>
      <section className="panel">
        <h3>Produtos mais vendidos</h3>
        {Object.entries(
          orders.reduce(
            (a, o) => {
              o.items.forEach((i) => (a[i.name] = (a[i.name] || 0) + i.qty));
              return a;
            },
            {} as Record<string, number>,
          ),
        )
          .sort((a, b) => b[1] - a[1])
          .map(([name, n]) => (
            <div className="health-row" key={name}>
              <span>{name}</span>
              <strong>{n} unidades</strong>
            </div>
          ))}
      </section>
      <div className="notice">
        Insights automáticos, IA e relatórios avançados preparados para a fase de expansão, sem
        serviço externo nesta entrega.
      </div>
    </>
  );
}
function BusinessSettings({ store }: { store: Store }) {
  const { mutate } = useDemo();
  return (
    <>
      <PageHead
        title="Configurações do estabelecimento"
        description="Informações comerciais, horários e identidade pública."
      />
      <section className="panel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = Object.fromEntries(new FormData(e.currentTarget));
            mutate(
              (d) => ({
                ...d,
                stores: d.stores.map((s) => (s.id === store.id ? { ...s, ...f } : s)),
              }),
              "Informações do estabelecimento atualizadas.",
            );
          }}
        >
          <div className="form-grid">
            <Field label="Nome comercial" name="name" value={store.name} required />
            <Field label="Responsável" name="owner" value={store.owner} required />
            <Field label="E-mail" name="email" type="email" value={store.email} required />
            <Field label="Telefone" name="phone" value={store.phone} />
            <Field label="WhatsApp" name="whatsapp" value={store.whatsapp} />
            <Field label="Horários de funcionamento" name="hours" value={store.hours} />
            <Field label="Endereço" name="address" value={store.address} />
            <Field label="Cidade" name="city" value={store.city} />
          </div>
          <Field
            label="Descrição pública"
            name="description"
            type="textarea"
            value={store.description}
          />
          <div className="form-actions">
            <button className="btn">Salvar configurações</button>
          </div>
        </form>
      </section>
      <section className="panel">
        <h3>Recursos preparados para expansão</h3>
        <div className="future-features">
          <div>
            <ImageIcon />
            <h4>Alimentos em 3D</h4>
            <p>Prévia visual disponível no cardápio. Modelo 3D real na etapa 5.</p>
          </div>
          <div>
            <Users />
            <h4>Tradução avançada</h4>
            <p>Interface em 5 idiomas; traduções automáticas futuras.</p>
          </div>
          <div>
            <CheckCircle />
            <h4>Avaliações</h4>
            <p>Cliente pode avaliar pedidos concluídos na demonstração.</p>
          </div>
        </div>
      </section>
    </>
  );
}
