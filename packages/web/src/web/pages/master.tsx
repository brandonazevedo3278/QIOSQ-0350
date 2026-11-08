import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Plus,
  ArrowUpRight,
  ArrowRight,
  Download,
  Search,
  Store as StoreIcon,
  Eye,
  Pencil,
  Pause,
  Play,
  Trash2,
  Wallet,
  CheckCircle,
  Layers,
  MapPin,
} from "lucide-react";
import { useDemo, money, uid, downloadCSV } from "../lib/demo";
import type { Store, Plan } from "../lib/demo";
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
  Support,
} from "../components/qiosq";
export function StoreForm({ store, onClose }: { store?: Store; onClose: () => void }) {
  const { data, mutate } = useDemo();
  const [pos, setPos] = useState({ x: store?.x || 48, y: store?.y || 48 });
  return (
    <Modal
      title={store ? "Editar estabelecimento" : "Cadastrar estabelecimento"}
      onClose={onClose}
      wide
    >
      <p className="muted">
        Crie uma loja de demonstração. Nenhuma cobrança ou conta real será criada.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = Object.fromEntries(new FormData(e.currentTarget));
          const s: Store = {
            id: store?.id || uid(),
            name: String(f.name),
            owner: String(f.owner),
            document: String(f.document),
            email: String(f.email),
            phone: String(f.phone),
            whatsapp: String(f.whatsapp),
            address: String(f.address),
            city: String(f.city),
            state: String(f.state),
            country: String(f.country),
            category: String(f.category),
            plan: String(f.plan),
            status: String(f.status),
            created: store?.created || new Date().toISOString().slice(0, 10),
            ...pos,
            delivery: store?.delivery ?? true,
            radius: store?.radius || 8,
            fee: store?.fee || 9.9,
            minimum: store?.minimum || 30,
            estimate: store?.estimate || "35–50 min",
            hours: store?.hours || "10:00–23:00",
            description: store?.description || "Bem-vindo ao nosso estabelecimento.",
          };
          mutate(
            (d) => ({
              ...d,
              stores: store ? d.stores.map((v) => (v.id === s.id ? s : v)) : [s, ...d.stores],
              categories: store
                ? d.categories
                : [
                    ...d.categories,
                    ...["Grelhados", "Bebidas", "Petiscos", "Combos"].map((name) => ({
                      id: uid(),
                      tenantId: s.id,
                      name,
                    })),
                  ],
            }),
            store ? "Estabelecimento atualizado." : "Estabelecimento demonstrativo cadastrado.",
          );
          onClose();
        }}
      >
        <div className="form-grid">
          <Field label="Nome do estabelecimento" name="name" value={store?.name} required />
          <Field label="Nome do responsável" name="owner" value={store?.owner} required />
          <Field label="CNPJ / identificação empresarial" name="document" value={store?.document} />
          <Field label="E-mail" name="email" type="email" value={store?.email} required />
          <Field label="Telefone" name="phone" value={store?.phone} />
          <Field label="WhatsApp" name="whatsapp" value={store?.whatsapp} />
          <Field label="Endereço" name="address" value={store?.address} required />
          <Field label="Cidade" name="city" value={store?.city || "Rio de Janeiro"} required />
          <Field label="Estado / província" name="state" value={store?.state || "RJ"} />
          <Field label="País" name="country" value={store?.country || "Brasil"} required />
          <Field
            label="Categoria comercial"
            name="category"
            value={store?.category}
            options={data.settings.categories.split(";")}
          />
          <Field
            label="Plano contratado"
            name="plan"
            value={store?.plan || "Profissional"}
            options={data.plans.map((p) => p.name)}
          />
          <Field
            label="Status da conta"
            name="status"
            value={store?.status || "Teste"}
            options={["Ativo", "Teste", "Suspenso"]}
          />
        </div>
        <div className="field">
          <span>Localização demonstrativa — clique no mapa para posicionar</span>
          <DemoMap
            markers={[{ id: "new", name: "Seu estabelecimento", ...pos }]}
            selected="new"
            radius={2}
            onPlace={(x, y) => setPos({ x, y })}
          />
        </div>
        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn">
            <Plus size={17} />
            {store ? "Salvar alterações" : "Cadastrar estabelecimento"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function Master() {
  const { data, mutate } = useDemo();
  const [loc] = useLocation();
  const section = loc.split("/")[2] || "";
  const [form, setForm] = useState<Store | true | null>(null);
  const [detail, setDetail] = useState<Store | null>(null);
  const [remove, setRemove] = useState<Store | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [planForm, setPlanForm] = useState<Plan | null>(null);
  const revenue = data.stores
    .filter((s) => s.status === "Ativo")
    .reduce((sum, s) => sum + (data.plans.find((p) => p.name === s.plan)?.price || 0), 0);
  const active = data.stores.filter((s) => s.status === "Ativo").length;
  const listed = data.stores.filter(
    (s) =>
      (s.name + " " + s.owner + " " + s.city).toLowerCase().includes(query.toLowerCase()) &&
      (filter === "Todos" || s.status === filter),
  );
  function toggle(s: Store) {
    mutate(
      (d) => ({
        ...d,
        stores: d.stores.map((v) =>
          v.id === s.id ? { ...v, status: s.status === "Suspenso" ? "Ativo" : "Suspenso" } : v,
        ),
      }),
      s.status === "Suspenso" ? "Estabelecimento ativado." : "Estabelecimento suspenso.",
    );
  }
  const table = (rows: Store[]) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Estabelecimento</th>
            <th>Plano</th>
            <th>Status</th>
            <th>Cadastro</th>
            <th>Assinatura / mês</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <td aria-label="Informação do registro">
                <div className="store-cell">
                  <span className="store-avatar">{s.name[0]}</span>
                  <div>
                    <strong>{s.name}</strong>
                    <small>
                      {s.category} · {s.city}
                    </small>
                  </div>
                </div>
              </td>
              <td aria-label="Informação do registro">{s.plan}</td>
              <td aria-label="Informação do registro">
                <Badge>{s.status}</Badge>
              </td>
              <td aria-label="Informação do registro">
                {s.created.split("-").reverse().join("/")}
              </td>
              <td aria-label="Informação do registro">
                {money(data.plans.find((p) => p.name === s.plan)?.price || 0)}
              </td>
              <td aria-label="Informação do registro">
                <div className="table-actions">
                  <Link className="text-link" href={`/business/${s.id}`}>
                    Abrir painel <ArrowUpRight size={14} />
                  </Link>
                  <button
                    className="icon-btn"
                    title="Visualizar"
                    aria-label={`Visualizar ${s.name}`}
                    onClick={() => setDetail(s)}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    title="Editar"
                    aria-label={`Editar ${s.name}`}
                    onClick={() => setForm(s)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    title={s.status === "Suspenso" ? "Ativar" : "Suspender"}
                    onClick={() => toggle(s)}
                  >
                    {s.status === "Suspenso" ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                  <button className="icon-btn danger" title="Excluir" onClick={() => setRemove(s)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <Empty />}
    </div>
  );
  return (
    <AdminShell kind="master">
      {section === "" && (
        <>
          <PageHead
            eyebrow="SUA PLATAFORMA, SOB CONTROLE"
            title="Uma visão de todo o QIOSQ."
            description="Acompanhe seus estabelecimentos e o crescimento da plataforma."
            actions={
              <>
                <button
                  className="btn secondary"
                  onClick={() => downloadCSV("qiosq-estabelecimentos", data.stores)}
                >
                  <Download size={16} /> Exportar
                </button>
                <button className="btn" onClick={() => setForm(true)}>
                  <Plus size={17} /> Cadastrar estabelecimento
                </button>
              </>
            }
          />
          <div className="welcome-banner">
            <div>
              <span className="eyebrow">QIOSQ MASTER</span>
              <h2>
                Conectando negócios.
                <br />
                Criando bons momentos.
              </h2>
              <p>Seu próximo estabelecimento começa por aqui.</p>
              <button onClick={() => setForm(true)}>
                Expandir minha rede <ArrowRight size={17} />
              </button>
            </div>
            <div className="banner-art">
              <StoreIcon size={78} strokeWidth={1} />
              <span>QIOSQ</span>
              <small>PEDIU, CHEGOU.</small>
            </div>
          </div>
          <Metrics
            items={[
              {
                label: "Estabelecimentos",
                value: data.stores.length,
                detail: `${active} ativos · ${data.stores.filter((s) => s.status === "Suspenso").length} suspensos`,
                icon: <StoreIcon size={18} />,
              },
              {
                label: "Receita recorrente mensal",
                value: money(revenue),
                detail: "MRR de assinaturas fictícias",
                icon: <Wallet size={18} />,
              },
              {
                label: "Assinaturas ativas",
                value: active,
                detail: `${data.stores.filter((s) => s.status === "Teste").length} em período de teste`,
                icon: <Layers size={18} />,
              },
              {
                label: "Pedidos processados",
                value: data.orders.length,
                detail: `${data.orders.filter((o) => o.status === "Concluído").length} concluídos`,
                icon: <CheckCircle size={18} />,
              },
            ]}
          />
          <div className="dashboard-grid">
            <Chart />
            <section className="panel">
              <div className="panel-title">
                <h3>Saúde da plataforma</h3>
                <span className="live-label">Demonstração</span>
              </div>
              {[
                ["Estabelecimentos ativos", active, "green"],
                [
                  "Em período de teste",
                  data.stores.filter((s) => s.status === "Teste").length,
                  "amber",
                ],
                [
                  "Contas suspensas",
                  data.stores.filter((s) => s.status === "Suspenso").length,
                  "red",
                ],
                [
                  "Novos cadastros (novembro)",
                  data.stores.filter((s) => s.created.startsWith("2026-11")).length,
                  "blue",
                ],
              ].map(([l, v, c]) => (
                <div className="health-row" key={String(l)}>
                  <span>
                    <i className={String(c)} />
                    {l}
                  </span>
                  <strong>{v}</strong>
                </div>
              ))}
              <div className="health-footer">
                <CheckCircle size={18} />
                <span>
                  Todos os ambientes disponíveis
                  <small>Protótipo local · sem serviços externos</small>
                </span>
              </div>
            </section>
          </div>
          <section className="panel no-pad">
            <div className="panel-title padded">
              <div>
                <h3>Seus estabelecimentos</h3>
                <p>Gerencie os negócios que fazem parte do QIOSQ.</p>
              </div>
              <Link href="/master/estabelecimentos" className="text-link">
                Ver todos <ArrowRight size={15} />
              </Link>
            </div>
            {table(data.stores.slice(0, 4))}
          </section>
          <div className="quick-links">
            {[
              ["/delivery", "Explorar delivery", MapPin],
              ["/menu/tropical", "Experimentar o cardápio", StoreIcon],
              ["/staff/tropical", "Conhecer o QIOSQ Staff", CheckCircle],
            ].map(([url, label, Icon]: any) => (
              <Link key={url} href={url}>
                <Icon size={22} />
                <span>{label}</span>
                <ArrowUpRight size={19} />
              </Link>
            ))}
          </div>
        </>
      )}
      {section === "estabelecimentos" && (
        <>
          <PageHead
            title="Estabelecimentos"
            description="Crie, gerencie e acesse todos os negócios da sua rede."
            actions={
              <button className="btn" onClick={() => setForm(true)}>
                <Plus size={17} /> Cadastrar estabelecimento
              </button>
            }
          />
          <Metrics
            items={[
              { label: "Total cadastrados", value: data.stores.length },
              { label: "Ativos", value: active },
              { label: "Em teste", value: data.stores.filter((s) => s.status === "Teste").length },
              {
                label: "Suspensos",
                value: data.stores.filter((s) => s.status === "Suspenso").length,
              },
            ]}
          />
          <section className="panel no-pad">
            <div className="toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  aria-label="Buscar estabelecimento, responsável ou cidade"
                  placeholder="Buscar estabelecimento, responsável ou cidade"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                {["Todos", "Ativo", "Teste", "Suspenso"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button
                className="btn secondary"
                onClick={() => downloadCSV("estabelecimentos", listed)}
              >
                <Download size={16} /> Exportar
              </button>
            </div>
            {table(listed)}
            <div className="table-footer">
              {listed.length} estabelecimentos · Dados demonstrativos
            </div>
          </section>
        </>
      )}
      {section === "financeiro" && (
        <>
          <PageHead
            title="Financeiro da plataforma"
            description="Assinaturas, recebimentos e histórico financeiro fictício."
            actions={
              <button
                className="btn secondary"
                onClick={() =>
                  downloadCSV(
                    "assinaturas-demo",
                    data.stores.map((s) => ({
                      estabelecimento: s.name,
                      plano: s.plan,
                      status: s.status,
                      mensalidade: data.plans.find((p) => p.name === s.plan)?.price,
                    })),
                  )
                }
              >
                <Download size={16} /> Exportar histórico
              </button>
            }
          />
          <Metrics
            items={[
              { label: "Receita mensal (MRR)", value: money(revenue) },
              { label: "Receita acumulada ilustrativa", value: money(revenue * 6) },
              { label: "Pagamentos recebidos", value: money(revenue) },
              {
                label: "Pendentes / inadimplência",
                value: money(
                  data.stores
                    .filter((s) => s.status === "Suspenso")
                    .reduce(
                      (t, s) => t + (data.plans.find((p) => p.name === s.plan)?.price || 0),
                      0,
                    ),
                ),
              },
            ]}
          />
          <Chart title="Histórico financeiro" />
          <section className="panel no-pad">
            <div className="panel-title padded">
              <h3>Assinaturas e pagamentos</h3>
              <Badge>Demonstração</Badge>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Estabelecimento</th>
                    <th>Plano</th>
                    <th>Mensalidade</th>
                    <th>Vencimento</th>
                    <th>Situação</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stores.map((s) => (
                    <tr key={s.id}>
                      <td aria-label="Informação do registro">{s.name}</td>
                      <td aria-label="Informação do registro">{s.plan}</td>
                      <td aria-label="Informação do registro">
                        {money(data.plans.find((p) => p.name === s.plan)?.price || 0)}
                      </td>
                      <td aria-label="Informação do registro">10/11/2026</td>
                      <td aria-label="Informação do registro">
                        <Badge>
                          {s.status === "Ativo"
                            ? "Pago"
                            : s.status === "Teste"
                              ? "Teste"
                              : "Pendente"}
                        </Badge>
                      </td>
                      <td aria-label="Informação do registro">
                        <button className="text-link" onClick={() => setForm(s)}>
                          Gerenciar assinatura <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              Cancelamentos: {data.stores.filter((s) => s.status === "Suspenso").length} contas
              suspensas · sem cobranças reais
            </div>
          </section>
        </>
      )}
      {section === "planos" && (
        <>
          <PageHead
            title="Planos e assinaturas"
            description="Configure os preços, limites e recursos de cada plano comercial."
          />
          <div className="plan-grid">
            {data.plans.map((p, i) => (
              <section className={"plan-card " + (i === 1 ? "featured" : "")} key={p.id}>
                <span className="eyebrow">QIOSQ {p.name.toUpperCase()}</span>
                <h2>{p.name}</h2>
                <div className="plan-price">
                  {money(p.price)}
                  <small>/mês</small>
                </div>
                <p>Até {p.limit.toLocaleString("pt-BR")} pedidos por mês</p>
                <ul>
                  {p.features.split(";").map((f) => (
                    <li key={f}>
                      <CheckCircle size={16} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={"btn " + (i === 1 ? "" : "secondary")}
                  onClick={() => setPlanForm(p)}
                >
                  <Pencil size={16} /> Configurar plano
                </button>
                <small>
                  {data.stores.filter((s) => s.plan === p.name).length} estabelecimentos neste plano
                </small>
              </section>
            ))}
          </div>
          <div className="notice">
            As configurações são demonstrativas. Não há contratação ou cobrança nesta versão.
          </div>
        </>
      )}
      {section === "relatorios" && (
        <>
          <PageHead
            title="Relatórios e crescimento"
            description="Indicadores consolidados da plataforma. Tendências históricas são ilustrativas."
            actions={
              <button
                className="btn secondary"
                onClick={() =>
                  downloadCSV(
                    "relatorio-qiosq",
                    data.stores.map((s) => ({
                      loja: s.name,
                      pedidos: data.orders.filter((o) => o.tenantId === s.id).length,
                      total: data.orders
                        .filter((o) => o.tenantId === s.id)
                        .reduce((t, o) => t + o.total, 0),
                    })),
                  )
                }
              >
                <Download size={16} /> Exportar relatório
              </button>
            }
          />
          <Metrics
            items={[
              { label: "Volume de pedidos", value: data.orders.length },
              {
                label: "Volume transacionado fictício",
                value: money(data.orders.reduce((t, o) => t + o.total, 0)),
              },
              {
                label: "Ticket médio",
                value: money(
                  data.orders.reduce((t, o) => t + o.total, 0) / (data.orders.length || 1),
                ),
              },
              { label: "Crescimento ilustrativo", value: "+18,4%" },
            ]}
          />
          <Chart title="Crescimento da rede" />
          <section className="panel">
            <h3>Utilização por estabelecimento</h3>
            {data.stores.map((s) => (
              <div className="rank-row" key={s.id}>
                <span>{s.name}</span>
                <div className="progress">
                  <i
                    style={{
                      width: `${(data.orders.filter((o) => o.tenantId === s.id).length / data.orders.length) * 100}%`,
                    }}
                  />
                </div>
                <strong>{data.orders.filter((o) => o.tenantId === s.id).length} pedidos</strong>
              </div>
            ))}
          </section>
          <div className="notice">
            Relatórios inteligentes e análises com IA estão previstos na etapa de expansão. Nenhuma
            IA externa foi integrada.
          </div>
        </>
      )}
      {section === "configuracoes" && <GlobalSettings />}
      {section === "atividades" && (
        <>
          <PageHead
            title="Registros de atividades"
            description="Histórico local de alterações realizadas na demonstração."
          />
          <section className="panel">
            <div className="timeline">
              {data.logs.map((l, i) => (
                <div key={i}>
                  <span className="timeline-dot" />
                  <strong>{l.action}</strong>
                  <small>{l.date}</small>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
      {section === "suporte" && <Support />}
      {form && <StoreForm store={form === true ? undefined : form} onClose={() => setForm(null)} />}
      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <div className="detail-grid">
            {Object.entries({
              Responsável: detail.owner,
              "E-mail": detail.email,
              Telefone: detail.phone,
              WhatsApp: detail.whatsapp,
              Documento: detail.document,
              Endereço: detail.address,
              Cidade: detail.city,
              País: detail.country,
              Plano: detail.plan,
              Status: detail.status,
              Cadastro: detail.created,
              Pedidos: data.orders.filter((o) => o.tenantId === detail.id).length,
            }).map(([k, v]) => (
              <div key={k}>
                <small>{k}</small>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <div className="form-actions">
            <Link className="btn secondary" href={`/menu/${detail.id}`}>
              Ver loja pública
            </Link>
            <Link className="btn" href={`/business/${detail.id}`}>
              Abrir painel <ArrowUpRight size={16} />
            </Link>
          </div>
        </Modal>
      )}
      {remove && (
        <Modal title="Excluir estabelecimento?" onClose={() => setRemove(null)}>
          <p>
            Excluir <strong>{remove.name}</strong> e seus dados locais de demonstração? Esta ação
            não pode ser desfeita.
          </p>
          <div className="form-actions">
            <button className="btn secondary" onClick={() => setRemove(null)}>
              Cancelar
            </button>
            <button
              className="btn destructive"
              onClick={() => {
                const id = remove.id;
                mutate(
                  (d) => ({
                    ...d,
                    stores: d.stores.filter((s) => s.id !== id),
                    products: d.products.filter((p) => p.tenantId !== id),
                    orders: d.orders.filter((o) => o.tenantId !== id),
                    members: d.members.filter((o) => o.tenantId !== id),
                    points: d.points.filter((o) => o.tenantId !== id),
                    regions: d.regions.filter((o) => o.tenantId !== id),
                    categories: d.categories.filter((o) => o.tenantId !== id),
                  }),
                  "Estabelecimento e dados locais excluídos.",
                );
                setRemove(null);
              }}
            >
              Excluir demonstração
            </button>
          </div>
        </Modal>
      )}
      {planForm && (
        <Modal title={"Configurar " + planForm.name} onClose={() => setPlanForm(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const updated = {
                ...planForm,
                price: Number(f.get("price")),
                limit: Number(f.get("limit")),
                features: String(f.get("features")),
              };
              mutate(
                (d) => ({ ...d, plans: d.plans.map((p) => (p.id === updated.id ? updated : p)) }),
                "Plano atualizado na demonstração.",
              );
              setPlanForm(null);
            }}
          >
            <Field
              label="Preço mensal (R$)"
              name="price"
              type="number"
              value={planForm.price}
              required
            />
            <Field
              label="Limite de pedidos"
              name="limit"
              type="number"
              value={planForm.limit}
              required
            />
            <Field
              label="Funcionalidades (separadas por ;)"
              name="features"
              type="textarea"
              value={planForm.features}
              required
            />
            <div className="form-actions">
              <button className="btn">Salvar plano</button>
            </div>
          </form>
        </Modal>
      )}
    </AdminShell>
  );
}
function GlobalSettings() {
  const { data, mutate } = useDemo();
  const [tab, setTab] = useState("Geral");
  return (
    <>
      <PageHead
        title="Configurações globais"
        description="Preferências da plataforma, idiomas, categorias e permissões demonstrativas."
      />
      <div className="tabs">
        {["Geral", "Idiomas", "Categorias", "Permissões"].map((t) => (
          <button className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>
            {t}
          </button>
        ))}
      </div>
      <section className="panel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = Object.fromEntries(new FormData(e.currentTarget));
            mutate(
              (d) => ({ ...d, settings: { ...d.settings, ...f } as Record<string, string> }),
              "Configurações globais salvas.",
            );
          }}
        >
          {tab === "Geral" && (
            <div className="form-grid">
              <Field
                label="Moeda"
                name="currency"
                options={["BRL", "USD", "EUR"]}
                value={data.settings.currency}
              />
              <Field label="Fuso horário" name="timezone" value={data.settings.timezone} />
              <Field
                label="E-mail de suporte (fictício)"
                name="support"
                type="email"
                value={data.settings.support}
              />
              <Field
                label="Notificações demonstrativas"
                name="notifications"
                options={["Ativas", "Desativadas"]}
                value={data.settings.notifications}
              />
            </div>
          )}
          {tab === "Idiomas" && (
            <>
              <h3>Atendimento internacional</h3>
              <p className="muted">
                Cinco idiomas disponíveis no cardápio. Tradução automática avançada na etapa 5.
              </p>
              <Field
                label="Idiomas disponíveis (separados por ;)"
                name="languages"
                value={data.settings.languages}
              />
            </>
          )}
          {tab === "Categorias" && (
            <Field
              label="Categorias comerciais (separadas por ;)"
              name="categories"
              value={data.settings.categories}
            />
          )}
          {tab === "Permissões" && (
            <>
              <h3>Matriz de acesso planejada</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Perfil</th>
                      <th>Escopo</th>
                      <th>Permissões</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Master", "Global", "Estabelecimentos, planos, financeiro e auditoria"],
                      [
                        "Gerente",
                        "Próprio estabelecimento",
                        "Equipe, produtos, pedidos e relatórios",
                      ],
                      ["Atendente / Garçom", "Próprio estabelecimento", "Pedidos e atendimento"],
                      ["Caixa", "Próprio estabelecimento", "Pedidos e pagamentos"],
                      ["Cozinha", "Próprio estabelecimento", "Preparação de pedidos"],
                    ].map((r) => (
                      <tr key={r[0]}>
                        {r.map((c) => (
                          <td key={c}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="notice">
                Nesta versão os ambientes são acessos livres de demonstração. Autenticação,
                permissões e isolamento de dados no servidor ainda não estão implementados.
              </div>
            </>
          )}
          <div className="form-actions">
            <button className="btn">Salvar configurações</button>
          </div>
        </form>
      </section>
    </>
  );
}
