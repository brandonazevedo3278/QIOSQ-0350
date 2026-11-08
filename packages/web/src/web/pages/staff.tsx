import { Link } from "wouter";
import { ArrowUpRight, Users, ClipboardList, Clock, CheckCircle } from "lucide-react";
import { useDemo } from "../lib/demo";
import { Logo, PageHead, Metrics, DemoBar } from "../components/qiosq";
import { OrdersBoard } from "../components/orders";
export function Staff({ tenant }: { tenant: string }) {
  const { data } = useDemo();
  const store = data.stores.find((s) => s.id === tenant);
  const orders = data.orders.filter((o) => o.tenantId === tenant);
  if (!store)
    return (
      <div className="not-found">
        <h1>Estabelecimento não encontrado</h1>
        <Link href="/master">Master</Link>
      </div>
    );
  return (
    <div className="staff-app">
      <DemoBar />
      <header className="staff-header">
        <Link href="/">
          <Logo light small />
        </Link>
        <span className="staff-word">
          STAFF <span>/{store.name}</span>
        </span>
        <Link className="staff-back" href={`/business/${tenant}`}>
          Painel Business <ArrowUpRight size={16} />
        </Link>
      </header>
      <main className="staff-main">
        <PageHead
          eyebrow="OPERAÇÃO AO VIVO · DEMONSTRAÇÃO"
          title="Bom atendimento começa aqui."
          description="Confirme, prepare e entregue. Todo mundo na mesma página."
        />
        <Metrics
          items={[
            {
              label: "Novos pedidos",
              value: orders.filter((o) => o.status === "Recebido").length,
              icon: <ClipboardList size={18} />,
            },
            {
              label: "Em preparação",
              value: orders.filter((o) => o.status === "Em preparação").length,
              icon: <Clock size={18} />,
            },
            {
              label: "Prontos para entregar",
              value: orders.filter((o) => o.status === "Pronto").length,
              icon: <CheckCircle size={18} />,
            },
            {
              label: "Concluídos",
              value: orders.filter((o) => o.status === "Concluído").length,
              icon: <Users size={18} />,
            },
          ]}
        />
        <OrdersBoard tenant={tenant} staff />
      </main>
    </div>
  );
}
