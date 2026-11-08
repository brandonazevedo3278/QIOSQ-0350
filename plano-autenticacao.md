# QIOSQ — login e isolamento multi-tenant

## Acessos
- `/master` e todas as suas subseções: exclusivos do dono da plataforma, identificado por `brandonazevedo3278@gmail.com`.
- Primeiro acesso do dono com Google para comprovar a identidade; depois, opção de definir senha dentro da conta autenticada. Nenhum cadastro comum poderá se tornar Master apenas por informar esse e-mail.
- `/login`: entrada dos donos de quiosques com e-mail e senha, com saída de sessão.
- Cadastro de quiosque fica pendente até aprovação no Master. A ativação vincula a conta ao estabelecimento; suspensão bloqueia o acesso novamente.
- Dono de quiosque acessa somente o Business do estabelecimento autorizado. Rotas Staff também respeitam a associação e o status do estabelecimento.
- Site, descoberta e cardápios continuam públicos. Hero, textos e carrossel não serão redesenhados.

## Segurança e dados
O sistema atual é uma demonstração em localStorage. Colocar apenas uma tela de login não oferece isolamento real.

- Implementar Better Auth no servidor, com sessões, senhas com hash e Google gerenciado pela Runable.
- Persistir contas, estabelecimentos, associações e dados administrativos no banco gerenciado.
- Validar sessão, papel, associação e ativação em cada procedimento administrativo oRPC, não apenas na interface.
- Obter o escopo autorizado no servidor; trocar o tenant na URL ou no payload não permite acessar outro quiosque.
- Separar consultas públicas de catálogo das informações privadas de equipe, pedidos, financeiro e configurações.
- Remover dados privados e mutações administrativas do armazenamento público do navegador.
- Não importar automaticamente alterações existentes em localStorage como dados confiáveis. Preservar o layout e usar os registros de demonstração como exemplos identificados, sem criar credenciais para donos fictícios.

## Arquivos e módulos
- API: configuração Better Auth, schema de autenticação, tabelas de tenants/associações/dados, middleware e procedimentos por escopo.
- Frontend: cliente de autenticação, login/cadastro pendente, proteção das rotas, ações de aprovação/vínculo/suspensão no Master e provider conectado ao servidor.
- Manter as rotas públicas e os componentes visuais existentes; registrar limites restantes em ARCHITECTURE.md.

## Verificação
- Visitante e dono de quiosque não acessam Master por URL nem RPC.
- Conta pendente ou suspensa não acessa Business/Staff.
- Tenant A não consulta nem altera dados do tenant B.
- Aprovação e suspensão pelo Master produzem efeito no servidor.
- Dados persistem entre dispositivos, login/logout e erros funcionam; lint e build aprovados.
- Fluxo Google será implementado, mas o primeiro login real exige que o dono conclua a autenticação pessoalmente.

## Fora desta etapa
Pagamentos reais, cobranças automáticas, mapas/GPS reais e integrações externas continuam fora do escopo. Este trabalho trata de identidade, autorização, aprovação e persistência multi-tenant.