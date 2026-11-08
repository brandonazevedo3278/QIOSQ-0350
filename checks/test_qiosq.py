from playwright.sync_api import sync_playwright,expect
import json
base='http://localhost:4200'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(base);page.evaluate('localStorage.clear()');page.reload()
 for url,name in [('/','home-final'),('/master','master-final'),('/menu/tropical','menu-final')]:
  page.goto(base+url);page.screenshot(path='checks/'+name+'.png')
 # All screens render
 routes=['/master','/master/estabelecimentos','/master/financeiro','/master/planos','/master/relatorios','/master/configuracoes','/master/atividades','/master/suporte']+['/business/tropical'+s for s in ['','/pedidos','/cardapio','/equipe','/qrcodes','/localizacao','/delivery','/financeiro','/relatorios','/configuracoes']]+['/menu/tropical','/delivery','/staff/tropical']
 for route in routes:
  page.goto(base+route);expect(page.locator('h1')).to_be_visible();assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),route
 print('PASS: 21 pages desktop render, no overflow')
 # Create establishment
 page.goto(base+'/master/estabelecimentos');page.get_by_role('button',name='Cadastrar estabelecimento',exact=True).click()
 dialog=page.get_by_role('dialog');expect(dialog).to_be_visible()
 dialog.get_by_label('Nome do estabelecimento',exact=True).fill('Loja Teste Praia')
 dialog.get_by_label('Nome do responsável',exact=True).fill('Pessoa Teste')
 dialog.get_by_label('E-mail',exact=True).fill('teste@example.com')
 dialog.get_by_label('Endereço',exact=True).fill('Av. da Praia, 100')
 dialog.get_by_role('button',name='Cadastrar estabelecimento',exact=True).click()
 expect(page.get_by_text('Loja Teste Praia',exact=True)).to_be_visible()
 stored=page.evaluate('JSON.parse(localStorage.getItem("qiosq-demo-v1"))');tenant=next(s['id'] for s in stored['stores'] if s['name']=='Loja Teste Praia')
 page.reload();expect(page.get_by_text('Loja Teste Praia',exact=True)).to_be_visible()
 page.get_by_role('button',name='Editar Loja Teste Praia',exact=True).click();dialog.get_by_label('Nome do estabelecimento',exact=True).fill('Loja Praia Editada');dialog.get_by_role('button',name='Salvar alterações').click();expect(page.get_by_text('Loja Praia Editada',exact=True)).to_be_visible()
 row=page.locator('tr').filter(has_text='Loja Praia Editada');row.get_by_title('Suspender',exact=True).click();expect(row.get_by_text('Suspenso',exact=True)).to_be_visible();row.get_by_title('Ativar',exact=True).click();expect(row.get_by_text('Ativo',exact=True)).to_be_visible()
 print('PASS: establishment create/edit/suspend/reactivate/persistence')
 # Tenant-specific product
 page.goto(base+f'/business/{tenant}/cardapio');page.get_by_role('button',name='Adicionar produto',exact=True).click()
 dialog.get_by_label('Nome do produto',exact=True).fill('Produto da loja teste');dialog.get_by_label('Preço (R$)',exact=True).fill('32.5');dialog.get_by_label('Descrição',exact=True).fill('Produto demonstrativo desta loja.');dialog.get_by_role('button',name='Salvar produto',exact=True).click()
 expect(page.get_by_text('Produto da loja teste',exact=True)).to_be_visible()
 page.goto(base+'/business/tropical/cardapio');expect(page.get_by_text('Produto da loja teste',exact=True)).to_have_count(0)
 page.goto(base+f'/menu/{tenant}');expect(page.get_by_role('heading',name='Produto da loja teste',exact=True)).to_be_visible()
 print('PASS: product creation and visual tenant filtering')
 # Menu personalization & checkout
 page.goto(base+'/menu/tropical');page.get_by_role('button',name='Adicionar ao pedido Camarão à Brasileira',exact=True).click()
 dialog.get_by_label('Campo do formulário').first if False else None
 dialog.locator('input[type=checkbox]').first.check();dialog.get_by_label('Observações',exact=True).fill('Sem sal')
 dialog.get_by_role('button',name='Adicionar ao pedido ·',exact=False).click()
 page.get_by_role('button',name='Meu pedido · 1 itens',exact=False).click();page.get_by_role('button',name='Finalizar pedido',exact=True).click()
 dialog.get_by_label('Seu nome',exact=True).fill('Cliente E2E');dialog.get_by_role('button',name='Pagamento presencial',exact=True).click();dialog.get_by_role('button',name='Enviar pedido demonstrativo',exact=True).click()
 expect(dialog.get_by_text('Recebido',exact=True).first).to_be_visible()
 d=page.evaluate('JSON.parse(localStorage.getItem("qiosq-demo-v1"))');o=next(o for o in d['orders'] if o['customer']=='Cliente E2E');oid=o['id'];assert o['paid']==0 and 'Sem sal' in o['items'][0]['note']
 dialog.get_by_role('button',name='Fechar',exact=True).click();page.reload();page.get_by_role('button',name='Meus pedidos',exact=True).first.click();expect(page.get_by_text('#'+oid+' · Cliente E2E',exact=True)).to_be_visible()
 print('PASS: menu extras, notes, checkout and persisted order')
 page.goto(base+'/staff/tropical');page.get_by_role('button',name='Lista',exact=True).click();row=page.locator('tr').filter(has_text='Cliente E2E');row.get_by_role('button',name='Avançar',exact=False).click();expect(row.get_by_text('Confirmado',exact=True)).to_be_visible()
 row.get_by_role('button',name='Ver detalhes',exact=False).click();dialog.get_by_label('Atualizar status',exact=True).select_option('Em preparação');dialog.get_by_role('button',name='Fechar',exact=True).click()
 page.goto(base+'/menu/tropical');page.get_by_role('button',name='Meus pedidos',exact=True).first.click();card=page.locator('.consumer-orders .panel').filter(has_text='Cliente E2E');expect(card.get_by_text('Em preparação',exact=True)).to_be_visible();card.get_by_role('button',name='Dividir conta',exact=True).click();dialog.get_by_role('button',name='Pagar ficticiamente',exact=True).first.click();d=page.evaluate('JSON.parse(localStorage.getItem("qiosq-demo-v1"))');o=next(o for o in d['orders'] if o['id']==oid);assert 0<o['paid']<o['total'];dialog.get_by_role('button',name='Individual',exact=True).click();dialog.get_by_label('Valor individual (R$)',exact=True).fill('10000');dialog.get_by_role('button',name='Confirmar parcela fictícia',exact=True).click();d=page.evaluate('JSON.parse(localStorage.getItem("qiosq-demo-v1"))');o=next(o for o in d['orders'] if o['id']==oid);assert o['paid']==o['total'];dialog.get_by_role('button',name='Fechar',exact=True).click()
 print('PASS: staff updates propagate; split partial/full fictitious payment')
 # Language switching
 page.goto(base+'/menu/tropical');page.get_by_label('Idioma',exact=True).select_option('EN');expect(page.get_by_role('heading',name='Brazilian-style shrimp',exact=True)).to_be_visible();page.get_by_label('Idioma',exact=True).select_option('PT')
 print('PASS: consumer language translation')
 # QR dialog and region drawing
 page.goto(base+'/business/tropical/qrcodes');page.get_by_role('button',name='Visualizar QR Code',exact=True).first.click();expect(dialog.locator('.qr-preview img')).to_be_visible();dialog.get_by_role('button',name='Fechar',exact=True).click()
 page.goto(base+'/business/tropical/localizacao');page.get_by_role('button',name='Região',exact=True).click();page.get_by_label('Forma',exact=True).select_option('Polígono');canvas=page.locator('.map-canvas');box=canvas.bounding_box();canvas.click(position={'x':100,'y':100});canvas.click(position={'x':180,'y':160});canvas.click(position={'x':80,'y':200});page.get_by_role('button',name='Salvar região',exact=True).click();expect(page.locator('.region-row').filter(has_text='Nova região')).to_be_visible()
 print('PASS: local QR generation and polygon editor')
 # All pages mobile
 page.set_viewport_size({'width':390,'height':844})
 for route in routes+['/']:
  page.goto(base+route);assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),route
 for route,name in [('/','home-mobile-final'),('/master','master-mobile-final'),('/menu/tropical','menu-mobile-final'),('/delivery','delivery-mobile-final')]:
  page.goto(base+route);page.screenshot(path='checks/'+name+'.png')
 print('PASS: 22 pages at 390px, no document overflow')
 print('PAGE ERRORS:',errors);assert not errors
 # Clean only this isolated test browser (not user data)
 page.evaluate('localStorage.clear()')
 b.close()
