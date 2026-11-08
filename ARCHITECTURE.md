# QIOSQ — arquitetura e continuidade

## Etapa entregue: protótipo web responsivo
Bun + Vite + React no template gerenciado. Frontend único para navegadores desktop, tablet e celular. Os pacotes nativos do template não foram personalizados; não há APK/IPA ou executável nesta entrega.

### Módulos
- `pages/landing.tsx`: institucional com hero minimalista revisado, benefícios, planos, acessos e cadastro.
- `pages/master.tsx`: administração global, CRUD de lojas, estados, planos, finanças fictícias, relatórios, configurações, auditoria local e suporte.
- `pages/business.tsx`: gestão de produtos/categorias, fotos locais, adicionais, variações, promoções/combos, equipe/permissões, QR/pontos, regiões, delivery/entregadores, finanças e relatórios.
- `pages/menu.tsx`: consumidor, customização, carrinho, checkout fictício, conta dividida, pedidos/status, favoritos, avaliações e prévia 3D com fotografia.
- `pages/delivery.tsx`: descoberta em mapa ilustrativo, endereço/bairro, autorização geolocation, distância/cobertura simuladas e entrada para pedido delivery.
- `pages/staff.tsx` e `components/orders.tsx`: operação em lista/quadro, origens, observações, estados, detalhes e confirmação de pagamento fictício.
- `lib/demo.tsx`: contratos dos registros, seed, provider e mutações compartilhadas. `tenantId` nas entidades da loja; filtros locais. Persistência em localStorage com sincronização de abas da mesma origem.
- `lib/languages.ts`: interface e produtos exemplares em PT/EN/ES/FR/DE. Produtos adicionados manualmente preservam seu texto original; tradução automática não implementada.
- `components/qiosq.tsx`: marca, navegação, campos, modais, tabelas, gráficos, mapa e feedback reutilizáveis.

## Limites explícitos
- Acessos são livres, sem credenciais: não representam segurança real, isolamento de banco, permissões reais ou autenticação.
- Cada navegador possui sua cópia da demonstração; não há banco nem sincronização entre dispositivos. Alterações simultâneas de abas usam último estado gravado, não resolução de conflitos.
- Pagamentos, assinaturas e recebimentos são fictícios. Nunca inserir dados bancários. Pix é um estado visual, sem chave válida.
- Distâncias são aproximações fictícias por posição/bairro, não distância geográfica. Raio é usado no filtro de cobertura simulado; polígonos podem ser desenhados, salvos e revistos, mas não validam endereço real.
- Rastreamento move marcadores ilustrativos por status; sem GPS. Autorização de localização informa coordenadas, não geocodifica.
- QR gerado localmente aponta para a URL desta demonstração e carrega o ponto. O QR impresso na imagem de referência é arte, não o QR gerado.
- 3D usa rotação CSS de uma fotografia. Modelo 3D real não foi implementado.
- Gráficos históricos, crescimento e avaliação agregada são ilustrativos; totais, rankings, saldo e pedidos usam registros locais.
- Divisão igualitária recalcula parcelas sobre saldo pendente; por produtos abate os valores selecionados, sem conciliação persistente de pessoa/item. A contabilidade granular fica na etapa financeira.
- Chamados e cadastro não enviam mensagens, credenciais, convites ou cobranças.

## Fase 2 — backend e isolamento real
Trocar as operações do provider por hooks de queries/mutations oRPC (clientes tipados). Manter componentes e contratos, mover regras para procedimentos de domínio. Em cada requisição: sessão autenticada → associação do usuário à empresa → permissão → escopo tenantId → validação → auditoria. O servidor deve obter tenantId da sessão/autorização; não confiar em um id enviado pelo navegador.

### Entidades planejadas
`tenants`, `users`, `tenant_memberships`, `roles`, `permissions`, `products`, `categories`, `product_variants`, `product_extras`, `combos`, `service_points`, `qr_codes`, `delivery_regions`, `couriers`, `orders`, `order_items`, `order_events`, `payments`, `bill_splits`, `bill_allocations`, `plans`, `subscriptions`, `invoices`, `reviews`, `favorites`, `tenant_settings`, `global_settings`, `audit_events`.
TenantId obrigatório em entidades empresariais, chaves compostas tenantId + id, referências e índices escopados. Planos/configurações globais restritos ao Master. Foto em storage com prefixo tenant, metadados e acesso validados. Consultas financeiras e relatórios nunca agregam outra empresa sem permissão global. Quando o banco suportar, adicionar políticas por linha além dos filtros obrigatórios no servidor.

### Procedimentos oRPC por domínio (planejados, não ativos)
- `master.tenants.{list,create,update,suspend,activate,delete}`, `master.plans`, `master.subscriptions`, `master.audit`.
- `business.catalog`, `business.team`, `business.points`, `business.regions`, `business.delivery`, `business.reports`, `business.settings`.
- `orders.{create,list,detail,transition,cancel}` com máquina de estados, autorização e idempotência.
- `public.discovery`, `public.catalog`, `public.orderTracking` com tokens de cliente, não ids enumeráveis sem controle.
- `payments.{create,confirm,split,status}` somente na fase financeira real; webhooks assinados, valor/recebedor conferidos e idempotência.

### Testes obrigatórios futuros
Empresa A não acessa registros da B por URL, RPC, relatório, upload ou websocket. Funcionário sem permissão não altera catálogo/financeiro. Master auditado. Manipular tenantId não muda o escopo. Testar exclusão lógica, status suspenso, autorização de QR/ponto e transições inválidas. Nenhum valor calculado pelo cliente deve determinar pagamento real.

## Fases 3 a 5 preservadas
3: pedidos/eventos em tempo real, notificações e QR operacionais, equipe real e menu publicado.
4: recebedor correto por empresa, Pix/cartão/assinaturas, conciliação de divisões, geocodificação, distância por rota, polígonos geográficos e entregadores/rastreamento.
5: captura/renderização 3D, tradução avançada, relatórios inteligentes, integrações, desempenho e expansão internacional.

## Verificação
`bun run build` aprovado; `bun run lint` aprovado. Teste Playwright em `checks/test_qiosq.py`: 21 telas administrativas/públicas desktop e 22 rotas mobile sem overflow; CRUD de estabelecimento, produto próprio, persistência, personalização e checkout, atualização Staff, divisão fictícia parcial/integral, idioma e QR/polígono. Nenhum erro JavaScript nesses testes. Isso não é certificação de segurança ou operação de produção.
