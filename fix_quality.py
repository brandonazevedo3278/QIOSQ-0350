from pathlib import Path
import re
root=Path('packages/web/src/web')
# Remove unused imports reported by linter.
report=Path('lint-output.txt').read_text()
for m in re.finditer(r"Identifier '([^']+)' is imported but never used\.\n\s+,?-?\[([^:]+):",report):
 name,file=m.groups();p=Path(file);s=p.read_text();s=re.sub(r'\n  '+re.escape(name)+r',','',s);s=s.replace(', '+name+' }',' }');p.write_text(s)
for p in root.rglob('*.tsx'):
 s=p.read_text()
 def inputfix(m):
  tag=m.group(0)
  if 'aria-label' in tag:return tag
  placeholder=re.search(r'placeholder=("[^"]*"|\{[^}]*\})',tag)
  name=re.search(r'name="([^"]+)"',tag)
  value=re.search(r'value=\{(p|ex|item.name)\}',tag)
  label=placeholder.group(1) if placeholder else ('"'+name.group(1)+'"' if name else '"Campo do formulário"')
  return tag.replace('<input','<input aria-label='+label,1)
 s=re.sub(r'<input\b(?:(?!/>).)*?/>',inputfix,s,flags=re.S)
 s=s.replace('<td>','<td aria-label="Informação do registro">')
 p.write_text(s)
p=root/'lib/demo.tsx';s=p.read_text().replace('<div className="toast" role="status">','<output className="toast" aria-live="polite">').replace('✓ {toast}\n        </div>','✓ {toast}\n        </output>');p.write_text(s)
p=root/'components/qiosq.tsx';s=p.read_text().replace('<label>Explorar ambientes</label>','<label htmlFor="workspace-switch">Explorar ambientes</label>').replace('<select\n              value={kind}','<select\n              id="workspace-switch"\n              value={kind}')
s=s.replace('<div className="sidebar-backdrop" onClick={() => setOpen(false)} />','<button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setOpen(false)} />')
s=s.replace('className="modal-backdrop"\n','className="modal-backdrop"\n      role="presentation"\n')
s=s.replace('<div\n        className={"modal "','<dialog open\n        className={"modal "').replace('        role="dialog"\n','').replace('      </div>\n    </div>\n  );\n}\nexport function Field','      </dialog>\n    </div>\n  );\n}\nexport function Field')
s=s.replace('            role="img"\n','')
s=s.replace('<textarea\n            name={name}','<textarea\n            aria-label={label}\n            name={name}').replace('<input aria-label="Campo do formulário"\n            name={name}','<input aria-label={label}\n            name={name}')
s=s.replace('            defaultValue={value}\n            required={required}\n            onChange={(e) => onChange?.(e.target.value)}','            defaultValue={onChange ? undefined : value}\n            value={onChange ? value : undefined}\n            required={required}\n            onChange={(e) => onChange?.(e.target.value)}')
s=s.replace('          viewBox="0 0 1000 600"','          role="application"\n          aria-label="Carte démonstrative : Entrée pour placer au centre"\n          tabIndex={0}\n          onKeyDown={(e) => { if (e.key === "Enter") onPlace?.(50,50); }}\n          viewBox="0 0 1000 600"')
p.write_text(s)
p=root/'pages/master.tsx';s=p.read_text().replace('Store, Plan, DemoData','Store, Plan').replace('<label className="field">\n          <span>Localização','<div className="field">\n          <span>Localização').replace('          />\n        </label>\n        <div className="form-actions">','          />\n        </div>\n        <div className="form-actions">');p.write_text(s)
p=root/'pages/menu.tsx';s=p.read_text();pattern=r'<img\n\s+src=\{p.image\}\n\s+alt=\{tr.name\}\n\s+onClick=\{\(\) => \{(.*?)\}\}\n\s+/>'
s=re.sub(pattern,lambda m:'<button className="food-open" aria-label={tr.name} onClick={() => {'+m.group(1)+'}}><img src={p.image} alt={tr.name}/></button>',s,flags=re.S);p.write_text(s)
