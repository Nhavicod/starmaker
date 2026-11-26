import {
  state,
  onStateChange,
  initCloudListeners,
  refreshIcons
} from "./services/bridge.js";
import {
  initShowroomStage,
  seleccionarPunto,
  irAlPuntoActual,
  volverAlShowroom,
  syncMascotStageFromState
} from "./showroom/stage.js";
import {
  initRegistrationPortal,
  syncTutorialsToPortal,
  abrirRecursoAcademia,
  cerrarVideoModal,
  syncSupportToPortal,
  syncSocialsToPortal,
  enviarMensajeChat,
  enviarMensajeChip,
  conectarAsesorHumano,
  togglePublicTicketForm,
  submitPublicTicket
} from "./portals/portals.js";
import {
  initMascotWidget,
  toggleMascotWidget,
  closeMascotWidget,
  liveTransform,
  saveTransform,
  uploadVideo,
  deleteVideo,
  syncMascotSlidersFromState
} from "./admin/mascotWidget.js";
import {
  initExecutiveConsole,
  openExecutiveAdmin,
  closeExecutiveAdmin,
  setAdminTab,
  renderAdmin,
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  togglePin,
  wakeWidget,
  openRequest,
  setRequest,
  deleteRequest,
  openVideoReview,
  openNewRequestModal,
  handleNewRequestVideoUpload,
  createNewRequest,
  setReqFilter,
  setRequestViewMode,
  setReqSearch,
  uploadTutorialFile,
  addTutorialByUrl,
  previewTutorial,
  removeTutorial,
  setTicketFilter,
  openNewTicketModal,
  createNewTicket,
  toggleTicketStatus,
  deleteTicket,
  addSupportContact,
  editSupport,
  removeSupportContact,
  updateNotes,
  updateSocial,
  exportBackupJson,
  importBackupJson,
  resetDemo,
  exportCandidatesCsv
} from "./admin/console.js";

// Expose clean global API for declarative HTML handlers
Object.assign(window, {
  adminExecutiveState: state,
  // Showroom & Capsule Trackpad
  seleccionarPunto,
  irAlPuntoActual,
  volverAlShowroom,
  trackpadSwitchPortal: (idx) => window.capsuleDock?.goTo(idx),
  trackpadGoNext: () => window.capsuleDock?.next(),
  trackpadGoPrev: () => window.capsuleDock?.prev(),
  // Portals 2 & 3
  abrirRecursoAcademia,
  cerrarVideoModal,
  enviarMensajeChat,
  enviarMensajeChip,
  conectarAsesorHumano,
  togglePublicTicketForm,
  submitPublicTicket,
  syncTutorialsToPortal,
  syncSupportToPortal,
  // Floating Mascot 3D Calibrator
  toggleMascotWidget,
  closeMascotWidget,
  liveTransform,
  saveTransform,
  uploadVideo,
  deleteVideo,
  // Executive Command Suite
  openExecutiveAdmin,
  closeExecutiveAdmin,
  setAdminTab,
  renderAdmin,
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  togglePin,
  wakeWidget,
  openRequest,
  setRequest,
  deleteRequest,
  openVideoReview,
  openNewRequestModal,
  handleNewRequestVideoUpload,
  createNewRequest,
  setReqFilter,
  setRequestViewMode,
  setReqSearch,
  uploadTutorialFile,
  addTutorialByUrl,
  previewTutorial,
  removeTutorial,
  setTicketFilter,
  openNewTicketModal,
  createNewTicket,
  toggleTicketStatus,
  deleteTicket,
  addSupportContact,
  editSupport,
  removeSupportContact,
  updateNotes,
  updateSocial,
  exportBackupJson,
  importBackupJson,
  resetDemo,
  exportCandidatesCsv
});

function bootstrap() {
  initShowroomStage();
  initRegistrationPortal();
  initMascotWidget();
  initExecutiveConsole();

  // Keep UI reactive whenever cloud or local state updates
  onStateChange((_nextState, source) => {
    window.adminExecutiveState = state;
    syncTutorialsToPortal();
    syncSupportToPortal();
    syncSocialsToPortal();
    if (source.startsWith("cloud")) {
      if (document.getElementById("adminExecutiveOverlay")?.classList.contains("is-open")) {
        renderAdmin();
      }
      if (document.getElementById("mascot-widget")?.classList.contains("is-open")) {
        syncMascotSlidersFromState();
      }
    }
  });

  initCloudListeners({
    onMascotUpdate: () => {
      syncMascotStageFromState();
      syncMascotSlidersFromState();
    }
  });

  refreshIcons();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
