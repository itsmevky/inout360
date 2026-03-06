import re

with open('client/src/Components/Website/LoginPage.css', 'r') as f:
    css = f.read()

# Helpers
def rep(old, new):
    global css
    css = css.replace(old, new)

# 1. Backgrounds
rep('background: #0a1628;', 'background: #f8fafc;')
rep('linear-gradient(135deg, #0a1628 0%, #0f2238 50%, #071525 100%)', 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)')
rep('rgba(28, 72, 140, 0.55)', 'rgba(37, 99, 235, 0.04)')
rep('rgba(15, 42, 80, 0.6)', 'rgba(37, 99, 235, 0.02)')
rep('rgba(42, 106, 191, 0.3)', 'rgba(37, 99, 235, 0.05)')
rep('rgba(74, 157, 237, 0.12)', 'rgba(37, 99, 235, 0.03)')
rep('rgba(42, 106, 191, 0.14)', 'rgba(37, 99, 235, 0.04)')

# 2. Left Panel
rep('linear-gradient(135deg, rgba(15, 34, 56, 0.6) 0%, rgba(10, 22, 40, 0.4) 100%)', 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(241, 245, 249, 0.4) 100%)')
rep('rgba(74, 157, 237, 0.05)', 'rgba(37, 99, 235, 0.05)')
rep('color: #ffffff;\n    line-height: 1.25;\n    margin-bottom: 14px;\n    text-shadow: 0 2px 20px rgba(42, 106, 191, 0.5);', 'color: #0f172a;\n    line-height: 1.25;\n    margin-bottom: 14px;')
rep('--text-muted', '--text-muted-light') # We'll replace the var definition 
css = re.sub(r'--text-muted:.*?;', '--text-muted: #64748b;', css)

# 3. Stats & Badges
rep('background: rgba(42, 106, 191, 0.18);', 'background: #eff6ff;')
rep('border: 1px solid rgba(74, 157, 237, 0.25);', 'border: 1px solid #bfdbfe;')
rep('color: #7ec8ff;', 'color: #2563eb;')
rep('border: 1px solid rgba(74, 157, 237, 0.4);', 'border: 1px solid #93c5fd;')
rep('background: rgba(42, 106, 191, 0.25);', 'background: #dbeafe;')

# 4. Right Glass Card
rep('background: rgba(255, 255, 255, 0.06);', 'background: #ffffff;')
rep('border: 1px solid rgba(255, 255, 255, 0.13);', 'border: 1px solid #e2e8f0;')
rep('box-shadow:\n        0 8px 32px rgba(0, 0, 0, 0.4),\n        0 2px 8px rgba(42, 106, 191, 0.12),\n        inset 0 1px 0 rgba(255, 255, 255, 0.12);', 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);')
rep('background: rgba(255, 255, 255, 0.03);', 'background: #ffffff;')

# Right overlay
rep('background: rgba(255, 255, 255, 0.04);', 'background: rgba(255, 255, 255, 0.4);')
rep('border-left: 1px solid rgba(255, 255, 255, 0.08);', 'border-left: 1px solid #e2e8f0;')

# 5. Logo
rep('mix-blend-mode: screen;', '')
rep('filter: brightness(1.1) drop-shadow(0 0 12px rgba(74, 157, 237, 0.45));', 'filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));')

# 6. Inside Card text
rep('color: #fff;', 'color: #0f172a;')  
rep('color: rgba(255, 255, 255, 0.6);', 'color: #64748b;')

# 7. Inputs
rep('background: rgba(255, 255, 255, 0.07);', 'background: #f8fafc;')
rep('border: 1.5px solid rgba(255, 255, 255, 0.12);', 'border: 1.5px solid #cbd5e1;')
rep('color: rgba(255, 255, 255, 0.35);', 'color: #94a3b8;')
rep('color: rgba(255, 255, 255, 0.28);', 'color: #94a3b8;')
rep('background: rgba(255, 255, 255, 0.11);', 'background: #ffffff;')
rep('color: rgba(255, 255, 255, 0.4);', 'color: #94a3b8;')
rep('color: rgba(255, 255, 255, 0.8);', 'color: #0f172a;')

# 8. Dividers & extra info
rep('color: rgba(255, 255, 255, 0.3);', 'color: #cbd5e1;')
rep('background: rgba(255, 255, 255, 0.1);', 'background: #e2e8f0;')
rep('color: var(--text-muted);', 'color: #64748b;')
rep('background: rgba(255, 107, 107, 0.1);', 'background: #fef2f2;')

# 9. Fix button text color
css = css.replace('color: #0f172a;\n    font-size: 1rem;\n    font-weight: 600;', 'color: #ffffff;\n    font-size: 1rem;\n    font-weight: 600;')
css = css.replace('color: #0f172a;\n    font-size: 0.95rem;', 'color: #ffffff;\n    font-size: 0.95rem;') # if mobile query has it
# The loading spinner border
rep('border: 2px solid rgba(255, 255, 255, 0.4);', 'border: 2px solid rgba(255, 255, 255, 0.4);') 
rep('border-top-color: #0f172a;', 'border-top-color: #fff;') # fix if it became dark

# 10. Fix input focus border
rep('box-shadow: 0 0 0 3px rgba(74, 157, 237, 0.18);', 'box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);')

# Fix left headline text
rep('text-shadow: 0 2px 20px rgba(42, 106, 191, 0.5);', '')
rep('color: #ffffff;\n    line-height: 1.25;\n    margin-bottom: 14px;', 'color: #0f172a;\n    line-height: 1.25;\n    margin-bottom: 14px;')

# Fix the auth bg
rep('background: rgba(10, 22, 40, 0.8);', 'background: rgba(255, 255, 255, 0.8);') # loader overlay
rep('border: 4px solid rgba(255, 255, 255, 0.12);', 'border: 4px solid #e2e8f0;') # loader ring

with open('client/src/Components/Website/LoginPage.css', 'w') as f:
    f.write(css)

