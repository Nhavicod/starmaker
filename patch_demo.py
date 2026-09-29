import re

with open('mascot_showroom.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add buttons to toggle modes
demo_buttons = """
    <div style="position:absolute; top:20px; left:20px; z-index:99999; display:flex; gap:10px;">
        <button id="btn-mode-b" style="padding:10px; background:var(--coral, #E64381); color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">Opción B: Panel Flotante (Recomendada)</button>
        <button id="btn-mode-a" style="padding:10px; background:#4ade80; color:#000; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">Opción A: Transición Completa</button>
    </div>
"""

# Add dummy panel for Option B
dummy_panel = """
    <!-- PANEL FLOTANTE (OPCIÓN B) -->
    <div id="demo-panel" style="position:absolute; top:0; right:-100%; width: 50vw; min-width: 400px; height: 100vh; background: rgba(14, 11, 22, 0.85); backdrop-filter: blur(24px); border-left: 1px solid rgba(255,255,255,0.1); z-index:9999; transition: right 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); display:flex; flex-direction:column; padding: 40px; box-sizing: border-box;">
        <button id="btn-close-demo" style="position:absolute; top:20px; left:20px; background:transparent; border:none; color:#fff; font-size:24px; cursor:pointer;">✕</button>
        <h2 style="font-size:32px; font-weight:900; margin-top:40px; color:#E64381;">REGISTRO DE AGENTES</h2>
        <p style="color:#aaa; margin-top:20px;">Aquí viviría tu formulario de registro (el que ya tienes en index.html) integrado mágicamente encima del entorno 3D.</p>
        <div style="width:100%; height: 50px; background: rgba(255,255,255,0.1); border-radius:8px; margin-top: 30px;"></div>
        <div style="width:100%; height: 50px; background: rgba(255,255,255,0.1); border-radius:8px; margin-top: 15px;"></div>
        <div style="width:100%; height: 50px; background: rgba(255,255,255,0.1); border-radius:8px; margin-top: 15px;"></div>
    </div>
"""

# Add Fullscreen view for Option A
dummy_full = """
    <!-- VISTA COMPLETA (OPCIÓN A) -->
    <div id="demo-full" style="position:absolute; top:0; left:0; width: 100vw; height: 100vh; background: #06050b; z-index:9998; opacity:0; pointer-events:none; transition: opacity 0.6s; display:flex; justify-content:center; align-items:center;">
        <div style="text-align:center;">
            <h2 style="font-size:48px; font-weight:900; color:#E64381;">NUEVA PÁGINA (ESTILO NETFLIX)</h2>
            <p style="color:#aaa; margin-top:20px; font-size: 18px;">Has salido del menú 3D y ahora estás en una vista plana y enfocada.</p>
            <button id="btn-close-full" style="padding:15px 30px; background:#fff; color:#000; border:none; border-radius:30px; font-weight:bold; margin-top:30px; cursor:pointer;">Volver al Inicio 3D</button>
        </div>
    </div>
"""

html = html.replace('<body>', '<body>\n' + demo_buttons + dummy_panel + dummy_full)

js_logic = """
            // DEMO LOGIC
            let currentMode = 'B'; // Default to floating
            document.getElementById('btn-mode-b').onclick = () => {
                currentMode = 'B';
                alert("Modo cambiado a Opción B. ¡Haz clic en el portal León Star para verlo!");
            };
            document.getElementById('btn-mode-a').onclick = () => {
                currentMode = 'A';
                alert("Modo cambiado a Opción A. ¡Haz clic en el portal León Star para verlo!");
            };
            document.getElementById('btn-close-demo').onclick = () => {
                document.getElementById('demo-panel').style.right = '-100%';
                window.AppCore.resetTransition();
            };
            document.getElementById('btn-close-full').onclick = () => {
                document.getElementById('demo-full').style.opacity = '0';
                document.getElementById('demo-full').style.pointerEvents = 'none';
                window.AppCore.resetTransition();
            };
"""

# Modify executeTransition to trigger the modes
old_exec = """setTimeout(() => {
                        const destination = PORTAL_DESTINATIONS[id];
                        if (destination) {
                            window.location.href = destination;
                        } else {
                            console.warn(`Portal [${id}] activado. No hay URL configurada en PORTAL_DESTINATIONS.`);
                            // Reset temporal para pruebas si no hay URL
                            setTimeout(() => this.resetTransition(), 1000);
                        }
                    }, 1200);"""

new_exec = """setTimeout(() => {
                        if (currentMode === 'B') {
                           // MODO PANEL FLOTANTE
                           document.getElementById('demo-panel').style.right = '0';
                        } else {
                           // MODO FULLSCREEN
                           document.getElementById('demo-full').style.opacity = '1';
                           document.getElementById('demo-full').style.pointerEvents = 'all';
                        }
                    }, 600);"""

html = html.replace(old_exec, new_exec)
html = html.replace('// Iniciar reproducción a través del procesador', js_logic + '\n                        // Iniciar reproducción a través del procesador')

with open('showroom_demo.html', 'w', encoding='utf-8') as f:
    f.write(html)
