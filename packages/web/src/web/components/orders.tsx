import { useState } from "react";
import {
  ArrowRight,
  Search,
  Truck,
  UtensilsCrossed,
  Clock,
  Volume2,
  Eye,
} from "lucide-react";
import { useDemo, money, stages } from "../lib/demo";
import type { Order } from "../lib/demo";
import { Modal, Badge, Field, Empty } from "./qiosq";
export function sound() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.07;
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.stop(ctx.currentTime + 0.4);
    o.onended = () => ctx.close();
  } catch {}
}
export function OrderDetail({
  order,
  onClose,
  editable = false,
}: {
  order: Order;
  onClose: () => void;
  editable?: boolean;
}) {
  const { data, mutate } = useDemo();
  const o = data.orders.find((v) => v.id === order.id) || order;
  const [payment, setPayment] = useState(false);
  return (
    <Modal title={`Pedido #${o.id}`} onClose={onClose}>
      <div className="order-meta">
        <Badge>{o.status}</Badge>
        <span>
          {o.type === "Delivery" ? <Truck size={18} /> : <UtensilsCrossed size={18} />} {o.point}
        </span>
      </div>
      <p>
        <strong>{o.customer}</strong> ·{" "}
        {new Date(o.created).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      </p>
      {o.type === "Delivery" && <p className="muted">{o.address}</p>}
      <div className="order-items">
        {o.items.map((i, k) => (
          <div key={k}>
            <span>
              {i.qty}× {i.name}
              <small>{i.note}</small>
            </span>
            <strong>{money(i.price * i.qty)}</strong>
          </div>
        ))}
      </div>
      <div className="sum-row">
        <span>Total</span>
        <strong>{money(o.total)}</strong>
      </div>
      <div className="sum-row">
        <span>{o.payment} · pago</span>
        <strong>{money(o.paid)}</strong>
      </div>
      <div className="sum-row">
        <span>Pendente</span>
        <strong>{money(Math.max(0, o.total - o.paid))}</strong>
      </div>
      {editable && (
        <>
          <Field
            label="Atualizar status"
            value={o.status}
            options={stages.filter((s) => o.type === "Delivery" || s !== "Saiu para entrega")}
            onChange={(status) =>
              mutate(
                (d) => ({
                  ...d,
                  orders: d.orders.map((v) => (v.id === o.id ? { ...v, status } : v)),
                }),
                `Pedido #${o.id}: ${status}.`,
              )
            }
          />
          <button className="btn secondary full" onClick={() => setPayment(!payment)}>
            Gerenciar pagamento fictício
          </button>
        </>
      )}
      {payment && (
        <div className="payment-inline">
          <p>Confirmação fictícia. Nenhuma transação será efetuada.</p>
          <button
            className="btn full"
            onClick={() => {
              mutate(
                (d) => ({
                  ...d,
                  orders: d.orders.map((v) => (v.id === o.id ? { ...v, paid: v.total } : v)),
                }),
                "Pagamento integral confirmado apenas na demonstração.",
              );
              setPayment(false);
            }}
          >
            Confirmar pagamento fictício
          </button>
        </div>
      )}
      <div className="notice">
        Pedido demonstrativo · os estados são compartilhados entre Menu, Business e Staff no mesmo
        navegador.
      </div>
    </Modal>
  );
}
export function OrdersBoard({ tenant, staff = false }: { tenant: string; staff?: boolean }) {
  const { data, mutate, notify } = useDemo();
  const [filter, setFilter] = useState("Todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [mode, setMode] = useState(staff ? "Quadro" : "Lista");
  const [role, setRole] = useState("Cozinha");
  const orders = data.orders.filter(
    (o) =>
      o.tenantId === tenant &&
      (filter === "Todos" || filter === o.type || filter === o.status) &&
      (o.id + " " + o.customer + " " + o.point).toLowerCase().includes(query.toLowerCase()),
  );
  function next(o: Order) {
    const track = stages.filter(
      (s) => s !== "Cancelado" && (o.type === "Delivery" || s !== "Saiu para entrega"),
    );
    const status = track[Math.min(track.length - 1, track.indexOf(o.status) + 1)];
    mutate(
      (d) => ({ ...d, orders: d.orders.map((v) => (v.id === o.id ? { ...v, status } : v)) }),
      `Pedido #${o.id}: ${status}.`,
    );
  }
  return (
    <>
      <div className="toolbar flat">
        <div className="search-box">
          <Search size={17} />
          <input aria-label="Buscar pedido, cliente ou mesa"
            placeholder="Buscar pedido, cliente ou mesa"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {["Todos", "Local", "Delivery", ...stages].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {staff && (
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {["Cozinha", "Atendente", "Garçom", "Caixa", "Gerente"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
        <div className="segmented">
          {["Lista", "Quadro"].map((m) => (
            <button key={m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>
        <button
          className="icon-btn"
          title="Testar notificação sonora"
          onClick={() => {
            sound();
            notify("Notificação sonora demonstrativa ativada.");
          }}
        >
          <Volume2 size={19} />
        </button>
      </div>
      {staff && (
        <div className="staff-role">
          Visualização de função: <strong>{role}</strong> · troca de perfil demonstrativa, sem
          autenticação.
        </div>
      )}
      {mode === "Lista" ? (
        <section className="panel no-pad">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pedido / cliente</th>
                  <th>Origem</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Pagamento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td aria-label="Informação do registro">
                      <strong>#{o.id}</strong>
                      <small>{o.customer}</small>
                    </td>
                    <td aria-label="Informação do registro">
                      {o.type === "Delivery" ? <Truck size={16} /> : <UtensilsCrossed size={16} />}{" "}
                      {o.point}
                    </td>
                    <td aria-label="Informação do registro">
                      <Badge>{o.status}</Badge>
                    </td>
                    <td aria-label="Informação do registro">{money(o.total)}</td>
                    <td aria-label="Informação do registro">
                      <Badge>{o.paid >= o.total ? "Pago" : "Pendente"}</Badge>
                    </td>
                    <td aria-label="Informação do registro">
                      <div className="table-actions">
                        <button className="text-link" onClick={() => setSelected(o)}>
                          Ver detalhes <Eye size={15} />
                        </button>
                        {!["Concluído", "Cancelado"].includes(o.status) && (
                          <button className="btn mini secondary" onClick={() => next(o)}>
                            Avançar <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!orders.length && <Empty />}
          </div>
        </section>
      ) : (
        <div className="kanban">
          {[
            "Recebido",
            "Confirmado",
            "Em preparação",
            "Pronto",
            "Saiu para entrega",
            "Concluído",
            "Cancelado",
          ].map((s) => (
            <section className="kanban-col" key={s}>
              <div className="kanban-title">
                <span>{s}</span>
                <b>{orders.filter((o) => o.status === s).length}</b>
              </div>
              {orders
                .filter((o) => o.status === s)
                .map((o) => (
                  <article className="order-card" key={o.id}>
                    <div>
                      <strong>#{o.id}</strong>
                      <span className="muted">
                        <Clock size={13} />{" "}
                        {new Date(o.created).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p>
                      <strong>{o.point}</strong> · {o.customer}
                    </p>
                    {o.items.map((i, k) => (
                      <div className="order-line" key={k}>
                        {i.qty}× {i.name}
                        {i.note && <small className="order-note">{i.note}</small>}
                      </div>
                    ))}
                    <div className="order-card-bottom">
                      <Badge>{o.type}</Badge>
                      <strong>{money(o.total)}</strong>
                    </div>
                    <button className="text-link" onClick={() => setSelected(o)}>
                      Detalhes e pagamento <Eye size={14} />
                    </button>
                    {!["Concluído", "Cancelado"].includes(s) && (
                      <button className="btn full mini" onClick={() => next(o)}>
                        {s === "Recebido"
                          ? "Confirmar pedido"
                          : s === "Confirmado"
                            ? "Iniciar preparação"
                            : s === "Em preparação"
                              ? "Marcar pronto"
                              : s === "Pronto" && o.type === "Delivery"
                                ? "Saiu para entrega"
                                : "Avançar status"}
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </article>
                ))}
            </section>
          ))}
        </div>
      )}
      {selected && <OrderDetail order={selected} editable onClose={() => setSelected(null)} />}
    </>
  );
}
