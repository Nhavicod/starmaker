const fs = require("fs");

const content = fs.readFileSync("index.html", "utf8");

const tests = [
  {
    name: "1. Entrance button in header",
    pass: content.includes('id="btn-open-admin"') && content.includes('openExecutiveAdmin()')
  },
  {
    name: "2. Scoped Executive Overlay container",
    pass: content.includes('id="adminExecutiveOverlay"') && content.includes('class="admin-executive-overlay"')
  },
  {
    name: "3. Executive Shell and Brand",
    pass: content.includes('id="adminApp"') && content.includes('Executive Command Suite')
  },
  {
    name: "4. Return to App button in Executive header",
    pass: content.includes('closeExecutiveAdmin()') && content.includes('Volver a la App')
  },
  {
    name: "5. All 6 Navigation Tabs",
    pass: content.includes('data-tab="overview"') &&
          content.includes('data-tab="requests"') &&
          content.includes('data-tab="verification"') &&
          content.includes('data-tab="support"') &&
          content.includes('data-tab="activity"') &&
          content.includes('data-tab="settings"')
  },
  {
    name: "6. Candidate Dossier Drawer",
    pass: content.includes('id="drawer"') && content.includes('id="drawerPanel"')
  },
  {
    name: "7. Video Review Modal",
    pass: content.includes('id="videoReviewModal"') && content.includes('id="reviewVideoArea"')
  },
  {
    name: "8. New Request Modal & New Ticket Modal",
    pass: content.includes('id="newRequestModal"') && content.includes('id="newTicketModal"')
  },
  {
    name: "9. 3D Spatial Mascot Calibrator Modal",
    pass: content.includes('id="extraMascotModal"') && content.includes('id="extraMascotModalBody"')
  },
  {
    name: "10. Public Simulation Preview Modal",
    pass: content.includes('id="publicPreviewModal"') && content.includes('id="publicPreviewArea"')
  },
  {
    name: "11. Protected Executive Lock Modal",
    pass: content.includes('id="lockModal"') && content.includes('unlockConsole()')
  },
  {
    name: "12. Bi-directional Candidate Registration Hook",
    pass: content.includes('Auto-register dossier into Executive Command Center') &&
          content.includes('state.requests.unshift') &&
          content.includes('addActivity("Nueva solicitud desde Portal 1"')
  },
  {
    name: "13. Bi-directional Mascot Stage Sync (--vpX-x, --vpX-y, --vpX-s)",
    pass: content.includes('--vp${pid}-x') &&
          content.includes('--vp${pid}-y') &&
          content.includes('--vp${pid}-s')
  },
  {
    name: "14. Portal 2 Academy Tutorials Sync (syncTutorialsToPortal)",
    pass: content.includes('function syncTutorialsToPortal()') &&
          content.includes("tutoriales-list")
  },
  {
    name: "15. Portal 3 Concierge Support Sync (syncSupportToPortal)",
    pass: content.includes('function syncSupportToPortal()') &&
          content.includes("soporte-list")
  },
  {
    name: "16. Candidate Database CSV Export (exportCandidatesCsv)",
    pass: content.includes('function exportCandidatesCsv()') || content.includes('window.exportCandidatesCsv')
  },
  {
    name: "17. External Scripts Loaded in <head>",
    pass: content.includes('lucide@latest') && content.includes('chart.js')
  }
];

let failed = 0;
console.log("\n═══════════════════════════════════════════════════════════════");
console.log("   VERIFICACIÓN TÉCNICA: INTEGRACIÓN PANEL EJECUTIVO STARMAKER  ");
console.log("═══════════════════════════════════════════════════════════════\n");

tests.forEach(t => {
  if (t.pass) {
    console.log(`✅ PASS: ${t.name}`);
  } else {
    console.log(`❌ FAIL: ${t.name}`);
    failed++;
  }
});

console.log("\n───────────────────────────────────────────────────────────────");
if (failed === 0) {
  console.log(`🏆 TODOS LOS TESTS PASARON (${tests.length}/${tests.length}) CON ÉXITO ABSOLUTO.`);
  process.exit(0);
} else {
  console.error(`⚠️ FALLARON ${failed} TESTS.`);
  process.exit(1);
}
