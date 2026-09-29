import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change the login modal style
old_style = 'id="login-modal" class="sub-panel" style="z-index: 999999; display:none; justify-content:center; align-items:center; background: rgba(0,0,0,0.9);"'

# We'll make it absolute, positioned near the bottom right (where the padlock is)
# or just a centered card but without the black background.
new_style = 'id="login-modal" class="sub-panel" style="z-index: 999999; display:none; position:fixed; bottom: 80px; right: 20px; align-items:center; background: transparent; pointer-events:none;"'

html = html.replace(old_style, new_style)

# And add pointer-events: auto to the card inside
old_card = 'style="background: var(--bg-card); padding: 40px; border-radius: 20px; border: 1px solid var(--line-bright); width: 100%; max-width: 350px; text-align:center;"'
new_card = 'style="background: var(--bg-card); padding: 20px; border-radius: 20px; border: 1px solid var(--line-bright); width: 280px; text-align:center; pointer-events:auto; box-shadow: 0 10px 30px rgba(0,0,0,0.8);"'

html = html.replace(old_card, new_card)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
