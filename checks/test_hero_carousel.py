from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto('http://localhost:4200')
    slides = page.locator('.hero-carousel-slides img')
    expect(slides).to_have_count(6)
    page.wait_for_function('Array.from(document.querySelectorAll(".hero-carousel-slides img")).every(i => i.complete && i.naturalWidth > 0)')
    expect(slides.nth(0)).to_have_class('active')
    bounds = page.locator('.hero-carousel').bounding_box()
    assert bounds['x'] == 0 and bounds['width'] == 1440, bounds
    assert page.locator('h1').inner_text() == 'A praia inteira\nna palma da\nsua mão.'
    page.screenshot(path='/home/user/qiosq/checks/hero-carousel-desktop.png')
    page.get_by_role('button', name='Próxima imagem', exact=True).click()
    expect(slides.nth(1)).to_have_class('active')
    page.get_by_role('button', name='Imagem anterior', exact=True).click()
    expect(slides.nth(0)).to_have_class('active')
    for i in range(6):
        page.get_by_role('button', name=f'Mostrar imagem {i+1} de 6', exact=True).click()
        expect(slides.nth(i)).to_have_class('active')
    page.get_by_role('button', name='Pausar carrossel', exact=True).click()
    expect(page.get_by_role('button', name='Retomar carrossel')).to_have_attribute('aria-pressed', 'true')
    page.get_by_role('button', name='Retomar carrossel', exact=True).click()
    page.mouse.click(1400, 850)
    page.mouse.move(1430, 900)
    expect(slides.nth(0)).to_have_class('active', timeout=8500)
    page.get_by_role('button', name='Acessar minha administração', exact=True).click()
    expect(page.get_by_role('dialog')).to_be_visible()
    page.keyboard.press('Escape')
    page.goto('http://localhost:4200')
    page.get_by_role('link', name='Experimentar o QIOSQ', exact=False).click()
    expect(page).to_have_url('http://localhost:4200/menu/tropical')
    page.set_viewport_size({'width': 390, 'height': 844})
    page.goto('http://localhost:4200')
    expect(page.locator('.hero-carousel-slides img').nth(0)).to_have_class('active')
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    bounds = page.locator('.hero-carousel').bounding_box()
    assert bounds['x'] == 0 and bounds['width'] == 390, bounds
    page.screenshot(path='/home/user/qiosq/checks/hero-carousel-mobile.png')
    page.get_by_role('button', name='Próxima imagem', exact=True).click()
    expect(page.locator('.hero-carousel-slides img').nth(1)).to_have_class('active')
    page.get_by_role('button', name='Abrir navegação', exact=True).click()
    expect(page.get_by_role('link', name='Para seu negócio', exact=True)).to_be_visible()
    assert not errors, errors
    browser.close()
    print('PASS: six images, full-width desktop/mobile, controls, autoplay, copy, CTA, admin, navigation, no overflow or JS errors')