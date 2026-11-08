import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  Globe,
  Store,
  Users,
  MapPin,
  QrCode,
  CheckCircle,
  Truck,
  UtensilsCrossed,
  ChartNoAxesCombined,
  Wallet,
} from "lucide-react";
import { useDemo, money } from "../lib/demo";
import { Logo, Modal, Field } from "../components/qiosq";
import { HeroCarousel } from "../components/hero-carousel";
import { StoreForm } from "./master";
export function Landing() {
  const { data, notify } = useDemo();
  const [open, setOpen] = useState(false);
  const [access, setAccess] = useState(false);
  const [register, setRegister] = useState(false);
  const [support, setSupport] = useState(false);
  const [lang, setLang] = useState("PT");
  return (
    <div className="landing">
      <section className="minimal-hero" id="inicio">
        <header className="minimal-header">
          <Link href="/" aria-label="QIOSQ — Início">
            <Logo light />
          </Link>
          <nav className={open ? "open" : ""} aria-label="Navegação principal">
            <a href="#restaurantes" onClick={() => setOpen(false)}>
              Para seu negócio
            </a>
            <a href="#consumidores" onClick={() => setOpen(false)}>
              Para você
            </a>
            <a href="#planos" onClick={() => setOpen(false)}>
              Planos
            </a>
            <button
              onClick={() => {
                setSupport(true);
                setOpen(false);
              }}
            >
              Suporte
            </button>
          </nav>
          <div className="minimal-header-actions">
            <div className="minimal-language">
              <Globe size={15} />
              <select
                aria-label="Idioma do site"
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value);
                  notify(
                    "O cardápio possui 5 idiomas. O site institucional está em português nesta demonstração.",
                  );
                }}
              >
                {["PT", "EN", "ES", "FR", "DE"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <button
              className="minimal-menu-toggle"
              aria-label={open ? "Fechar navegação" : "Abrir navegação"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </header>
        <div className="minimal-hero-body">
          <div className="minimal-hero-copy">
            <span className="minimal-kicker">PEDIU, CHEGOU.</span>
            <h1>
              A praia inteira
              <br />
              na palma da
              <br />
              <em>sua mão.</em>
            </h1>
            <p>
              Seu lugar favorito. Seu próximo pedido.
              <br />
              Tudo mais simples, com o QIOSQ.
            </p>
            <div className="minimal-hero-actions">
              <Link href="/menu/tropical" className="minimal-primary">
                Experimentar o QIOSQ <ArrowRight size={18} />
              </Link>
              <button className="minimal-secondary" onClick={() => setAccess(true)}>
                Acessar minha administração <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="minimal-proof">
              <span>Sem aplicativo</span>
              <i />
              <span>Sem filas</span>
              <i />
              <span>5 idiomas</span>
            </div>
          </div>
          <HeroCarousel />
        </div>
      </section>
      <div className="demo-entry">
        <span>
          <i /> O QIOSQ inteiro, pronto para você explorar.
        </span>
        <button onClick={() => setAccess(true)}>
          Acessar ambientes demonstrativos <ArrowUpRight size={17} />
        </button>
      </div>
      <section className="site-section intro-section" id="consumidores">
        <div className="section-heading">
          <span className="eyebrow">MENOS ESPERA. MAIS MOMENTOS.</span>
          <h2>
            Seu único trabalho
            <br />é <em>aproveitar.</em>
          </h2>
        </div>
        <div className="intro-copy">
          <p>
            Da cadeira de praia à sua casa. O QIOSQ conecta você aos sabores, às pessoas e aos
            lugares que fazem o seu dia melhor.
          </p>
          <p>Sem baixar aplicativo. Sem cadastro obrigatório. Só escolher, pedir e acompanhar.</p>
          <Link href="/menu/tropical" className="text-link">
            Experimentar o cardápio <ArrowRight size={18} />
          </Link>
        </div>
        <div className="how-steps">
          {[
            [QrCode, "01", "Escaneie", "Cada mesa, cadeira ou guarda-sol tem um ponto de acesso."],
            [
              UtensilsCrossed,
              "02",
              "Escolha",
              "Explore o cardápio, personalize e adicione seus favoritos.",
            ],
            [Wallet, "03", "Peça", "Escolha o pagamento e divida a conta como preferir."],
            [CheckCircle, "04", "Aproveite", "Acompanhe seu pedido e deixe o resto com a gente."],
          ].map(([Icon, n, title, desc]: any) => (
            <div key={n}>
              <Icon size={27} />
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="business-site-section" id="restaurantes">
        <div className="business-site-image">
          <img src="/images/beach.jpg" alt="Orla do Rio de Janeiro com restaurantes e quiosques" />
          <div>
            <Logo light />
            <span>
              Um novo horizonte
              <br />
              para o seu negócio.
            </span>
          </div>
        </div>
        <div className="business-site-copy">
          <span className="eyebrow">PARA RESTAURANTES, QUIOSQUES E BARRACAS</span>
          <h2>
            Mais tecnologia.
            <br />
            <em>Mais vendas.</em>
          </h2>
          <p>
            Um cardápio que encanta. Uma operação que flui. Uma plataforma que cresce com o seu
            estabelecimento.
          </p>
          <ul>
            {[
              "Cardápio digital com produtos, combos e promoções",
              "Equipe, pedidos e atendimento em um único painel",
              "QR Codes para cada ponto de atendimento",
              "Financeiro, relatórios e delivery integrados",
            ].map((t) => (
              <li key={t}>
                <CheckCircle size={17} />
                {t}
              </li>
            ))}
          </ul>
          <div className="site-actions">
            <button className="btn" onClick={() => setRegister(true)}>
              Cadastrar meu estabelecimento <ArrowRight size={17} />
            </button>
            <Link className="text-link" href="/business/tropical">
              Ver o painel Business <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="site-section delivery-site-section" id="delivery">
        <div>
          <span className="eyebrow">QIOSQ DELIVERY</span>
          <h2>
            A brisa não chega.
            <br />
            <em>O seu pedido, sim.</em>
          </h2>
          <p>
            Descubra estabelecimentos pelo mapa, consulte áreas de entrega e leve um pouco da praia
            para casa.
          </p>
          <Link href="/delivery" className="btn">
            Explorar o mapa QIOSQ <ArrowRight size={17} />
          </Link>
          <div className="delivery-site-details">
            <span>
              <MapPin /> Perto de você
            </span>
            <span>
              <Truck /> Até sua porta
            </span>
            <span>
              <ClockIcon /> Acompanhe cada etapa
            </span>
          </div>
        </div>
        <div className="delivery-site-photo">
          <img src="/images/shrimp.jpg" alt="Camarões grelhados prontos para servir" />
          <div>
            <MapPin size={20} />
            <span>
              Leblon → Copacabana<small>Do seu lugar favorito até você.</small>
            </span>
            <ArrowRight size={20} />
          </div>
        </div>
      </section>
      <section className="international-section">
        <Globe size={54} strokeWidth={1} />
        <span className="eyebrow">O SABOR NÃO TEM FRONTEIRAS.</span>
        <h2>
          Cinco idiomas.
          <br />
          Uma experiência QIOSQ.
        </h2>
        <div className="language-list">
          <span>Português</span>
          <span>English</span>
          <span>Español</span>
          <span>Français</span>
          <span>Deutsch</span>
        </div>
        <p>
          Cardápio multilíngue, pagamentos e divisão de contas.
          <br />
          Receba o mundo no seu estabelecimento.
        </p>
        <Link href="/menu/tropical" className="text-link">
          Conhecer a experiência <ArrowRight size={17} />
        </Link>
      </section>
      <section className="site-section plans-section" id="planos">
        <div className="section-heading">
          <span className="eyebrow">PLANOS QUE ACOMPANHAM SEU NEGÓCIO</span>
          <h2>
            Comece do seu jeito.
            <br />
            <em>Cresça com o QIOSQ.</em>
          </h2>
          <p>Valores demonstrativos. Nenhuma assinatura ou cobrança real será realizada.</p>
        </div>
        <div className="plan-grid">
          {data.plans.map((p, i) => (
            <article className={"plan-card " + (i === 1 ? "featured" : "")} key={p.id}>
              {i === 1 && <span className="popular-tag">PARA IR MAIS LONGE</span>}
              <span className="eyebrow">QIOSQ</span>
              <h3>{p.name}</h3>
              <div className="plan-price">
                {money(p.price)}
                <small>/mês</small>
              </div>
              <p>Até {p.limit.toLocaleString("pt-BR")} pedidos/mês</p>
              <ul>
                {p.features.split(";").map((f) => (
                  <li key={f}>
                    <CheckCircle size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={"btn full " + (i === 1 ? "" : "secondary")}
                onClick={() => setRegister(true)}
              >
                Experimentar {p.name}
                <ArrowRight size={17} />
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="ecosystem-section">
        <div>
          <span className="eyebrow">UMA PLATAFORMA. TODO O SEU MUNDO.</span>
          <h2>Conheça cada lado do QIOSQ.</h2>
        </div>
        <div className="ecosystem-links">
          {[
            ["/master", "Master", "A central de comando da plataforma", ChartNoAxesCombined],
            ["/business/tropical", "Business", "O controle do seu estabelecimento", Store],
            ["/menu/tropical", "Menu", "O cardápio na palma da mão", UtensilsCrossed],
            ["/delivery", "Delivery", "Descoberta, mapa e pedidos em casa", Truck],
            ["/staff/tropical", "Staff", "A equipe conectada ao atendimento", Users],
          ].map(([url, name, desc, Icon]: any) => (
            <Link href={url} key={url}>
              <Icon size={27} />
              <div>
                <strong>QIOSQ {name}</strong>
                <p>{desc}</p>
              </div>
              <ArrowUpRight size={23} />
            </Link>
          ))}
        </div>
      </section>
      <section className="site-section faq-section">
        <div>
          <span className="eyebrow">SEM COMPLICAÇÃO</span>
          <h2>Bom saber.</h2>
        </div>
        <div>
          {[
            [
              "Preciso baixar um aplicativo?",
              "Não. O consumidor acessa pelo navegador, a partir do QR Code ou do delivery.",
            ],
            [
              "Posso testar minha própria loja?",
              "Sim. Acesse o QIOSQ Master, cadastre um estabelecimento de demonstração e abra o painel para criar produtos e testar pedidos.",
            ],
            [
              "O QIOSQ é só um cardápio digital?",
              "Não. A proposta reúne descoberta, atendimento, pedidos, localização, pagamentos e gestão multiempresa.",
            ],
            [
              "Esta versão já recebe pagamentos reais?",
              "Não. Todos os pagamentos, assinaturas, mapas e indicadores históricos desta versão são demonstrativos. O backend, autenticação e operação real serão desenvolvidos após aprovação visual.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <footer className="site-footer">
        <div>
          <Logo light />
          <p>
            Tecnologia que aproxima.
            <br />
            Momentos que ficam.
          </p>
        </div>
        <div>
          <h4>Para seu negócio</h4>
          <a href="#restaurantes">QIOSQ Business</a>
          <a href="#planos">Planos</a>
          <button onClick={() => setRegister(true)}>Cadastrar estabelecimento</button>
        </div>
        <div>
          <h4>Para você</h4>
          <Link href="/menu/tropical">Cardápio demonstrativo</Link>
          <Link href="/delivery">Explorar delivery</Link>
          <button onClick={() => setSupport(true)}>Suporte</button>
        </div>
        <div>
          <h4>Administração</h4>
          <Link href="/master">Acessar QIOSQ Master</Link>
          <Link href="/staff/tropical">QIOSQ Staff</Link>
          <button onClick={() => setAccess(true)}>Todos os ambientes</button>
        </div>
        <div className="footer-bottom">
          <span>© 2026 QIOSQ — Pediu, chegou.</span>
          <span>Protótipo demonstrativo · Sem transações reais</span>
        </div>
      </footer>
      {access && (
        <Modal title="Explore o universo QIOSQ" onClose={() => setAccess(false)}>
          <p className="muted">
            Acessos livres de demonstração, sem autenticação. Comece pelo Master para cadastrar sua
            própria loja.
          </p>
          {[
            ["/master", "QIOSQ Master", "Minha administração geral"],
            ["/business/tropical", "QIOSQ Business", "Painel de uma loja demonstrativa"],
            ["/menu/tropical", "QIOSQ Menu", "Escolher, personalizar e pedir"],
            ["/delivery", "QIOSQ Delivery", "Descobrir no mapa e pedir em casa"],
            ["/staff/tropical", "QIOSQ Staff", "Receber e atualizar pedidos"],
          ].map(([url, title, desc]) => (
            <Link key={url} href={url} className="access-link">
              <span>
                <strong>{title}</strong>
                <small>{desc}</small>
              </span>
              <ArrowUpRight size={20} />
            </Link>
          ))}
        </Modal>
      )}
      {register && <StoreForm onClose={() => setRegister(false)} />}
      {support && (
        <Modal title="Fale com o QIOSQ" onClose={() => setSupport(false)}>
          <p className="muted">Formulário demonstrativo. Nenhuma mensagem externa será enviada.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              notify("Solicitação fictícia registrada. Nenhuma mensagem enviada.");
              setSupport(false);
            }}
          >
            <Field label="Seu nome" required />
            <Field label="E-mail" type="email" required />
            <Field label="Sua mensagem" type="textarea" required />
            <button className="btn full">Registrar solicitação</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
function ClockIcon() {
  return <ChartNoAxesCombined />;
}
