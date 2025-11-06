// =========================================
// CONTADOR 4.0 - SCRIPT PRINCIPAL
// =========================================

// ===== IMPORTACIÓN DE DATOS =====
import promptsData from './promptsData.js';

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
  STORAGE_KEY: 'userPrompts',
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  SHEETS_URL: 'https://docs.google.com/spreadsheets/d/1LdUoniteMSwjeLTm0RfCtk5rPMVBY4jQte3Sh0SKKNc/edit?usp=sharing',
  EXCEL_URL: 'https://github.com/jairoamayalaverde/contador4-biblioteca/raw/main/Biblioteca%20de%20Prompts%20Contador%204.0.xlsx'
};

// ===== ESTADO DE LA APLICACIÓN =====
const state = {
  userPrompts: [],
  currentFilter: 'todos',
  currentPromptText: '',
  searchDebounceTimer: null
};

// ===== PROMPTS BASE FIJOS =====
const DEFAULT_PROMPTS = [
  {
    id: "base-1",
    name: "Análisis Express Rentabilidad PYME",
    context: "Cliente pregunta por qué bajó la utilidad neta.",
    personalization: "Incluye 'sector retail Colombia' y lenguaje simple.",
    text: "Actúa como analista financiero experto. Evalúa los márgenes de utilidad neta de una PYME del sector retail colombiano.",
    frequency: "semanal",
    fixed: true,
    createdAt: Date.now()
  },
  {
    id: "base-2",
    name: "Propuesta Premium de Servicios",
    context: "Prospecto solicita cotización o upgrade de cliente actual.",
    personalization: "Cambio 'CEO' por 'Gerente', énfasis en ROI cuantificado.",
    text: "Redacta una propuesta contable con enfoque premium para retener clientes y destacar ROI con claridad.",
    frequency: "mensual",
    fixed: true,
    createdAt: Date.now()
  },
  {
    id: "base-3",
    name: "Calendario Fiscal Automatizado",
    context: "Inicio de mes para planificar obligaciones.",
    personalization: "Solo clientes régimen común, formato tabla con alertas.",
    text: "Genera un calendario fiscal automatizado para empresas en régimen común con fechas y alertas críticas.",
    frequency: "mensual",
    fixed: true,
    createdAt: Date.now()
  },
  {
    id: "base-4",
    name: "Reporte Ejecutivo Semanal",
    context: "Todos los lunes para clientes premium.",
    personalization: "Dashboard visual, máximo 1 página, 3 métricas clave.",
    text: "Elabora un reporte ejecutivo semanal con resumen financiero, proyección y 3 métricas clave.",
    frequency: "semanal",
    fixed: true,
    createdAt: Date.now()
  },
  {
    id: "base-5",
    name: "Detección de Irregularidades en Nómina",
    context: "Antes de procesar nómina mensual.",
    personalization: "Detectar duplicados, horas extras inusuales y empleados inactivos.",
    text: "Analiza nómina y devuelve hallazgos: duplicados, horas extras anómalas, posibles empleados fantasma.",
    frequency: "mensual",
    fixed: true,
    createdAt: Date.now()
  }
];

// =========================================
// UTILIDADES GENERALES
// =========================================

/**
 * Muestra una notificación toast
 */
function showToast(message, type = 'success') {
  // Por ahora usamos alert, pero podemos implementar toasts después
  const icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }[type] || 'ℹ️';
  
  alert(`${icon} ${message}`);
  
  // TODO: Implementar toast notifications custom
  // const toast = document.createElement('div');
  // toast.className = `toast ${type}`;
  // toast.textContent = message;
  // document.getElementById('toast-container').appendChild(toast);
  // setTimeout(() => toast.remove(), CONFIG.TOAST_DURATION);
}

/**
 * Trunca texto a una longitud específica
 */
function truncate(str, maxLength) {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

/**
 * Capitaliza primera letra
 */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Debounce function
 */
function debounce(func, delay) {
  return function(...args) {
    clearTimeout(state.searchDebounceTimer);
    state.searchDebounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Copia texto al portapapeles
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Prompt copiado al portapapeles', 'success');
    return true;
  } catch (err) {
    console.error('Error al copiar:', err);
    showToast('No se pudo copiar el prompt', 'error');
    return false;
  }
}

// =========================================
// GESTIÓN DE ALMACENAMIENTO
// =========================================

/**
 * Carga prompts del localStorage
 */
function loadUserPrompts() {
  try {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    state.userPrompts = stored ? JSON.parse(stored) : [];
    return state.userPrompts;
  } catch (error) {
    console.error('Error al cargar prompts:', error);
    showToast('Error al cargar prompts guardados', 'error');
    state.userPrompts = [];
    return [];
  }
}

/**
 * Guarda prompts en localStorage
 */
function saveUserPrompts() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.userPrompts));
    return true;
  } catch (error) {
    console.error('Error al guardar prompts:', error);
    showToast('Error al guardar en el navegador', 'error');
    return false;
  }
}

/**
 * Obtiene todos los prompts (usuario + base)
 */
function getAllPrompts() {
  const sortedUserPrompts = [...state.userPrompts].sort((a, b) => b.createdAt - a.createdAt);
  return [...sortedUserPrompts, ...DEFAULT_PROMPTS];
}

/**
 * Encuentra un prompt por ID
 */
function findPromptById(id) {
  return getAllPrompts().find(p => p.id === id);
}

// =========================================
// BIBLIOTECA PERSONAL - RENDERIZADO
// =========================================

/**
 * Renderiza la lista de prompts
 */
function renderPrompts(prompts) {
  const promptList = document.getElementById("promptList");
  promptList.innerHTML = "";
  
  if (!Array.isArray(prompts) || prompts.length === 0) {
    renderEmptyState(promptList);
    return;
  }

  prompts.forEach(prompt => {
    const card = createPromptCard(prompt);
    promptList.appendChild(card);
  });
}

/**
 * Renderiza estado vacío
 */
function renderEmptyState(container) {
  const searchTerm = document.getElementById("searchInput").value;
  const message = (searchTerm || state.currentFilter !== 'todos')
    ? "No se encontraron prompts que coincidan con tu filtro o búsqueda."
    : "No hay prompts aún. Presiona '+ Nuevo Prompt' para crear uno.";
  
  const empty = document.createElement("div");
  empty.className = "prompt-empty-message";
  empty.textContent = message;
  container.appendChild(empty);
}

/**
 * Crea una tarjeta de prompt
 */
function createPromptCard(prompt) {
  const card = document.createElement("div");
  card.className = "prompt-card";
  if (prompt.fixed) card.classList.add("fixed-prompt");
  
  const categoria = capitalize(prompt.frequency) || 'General';
  const contexto = truncate(prompt.context || 'Sin contexto', 100);
  const contenido = truncate(prompt.text || 'Prompt vacío', 150);

  card.innerHTML = `
    <div class="prompt-header">
      <span class="prompt-categoria">${categoria}</span>
    </div>
    <h3 class="prompt-titulo">${prompt.name}</h3>
    <p class="prompt-subcategoria">${contexto}</p>
    <div class="prompt-contenido">${contenido}</div>
    <div class="prompt-actions">
      ${createPromptActions(prompt)}
    </div>
  `;

  attachPromptCardListeners(card, prompt);
  return card;
}

/**
 * Crea botones de acciones para un prompt
 */
function createPromptActions(prompt) {
  if (prompt.fixed) {
    return `<button class="btn-action primary btn-copy" data-id="${prompt.id}">📋 Copiar</button>`;
  }
  
  return `
    <button class="btn-action primary btn-copy" data-id="${prompt.id}">📋 Copiar</button>
    <button class="btn-action btn-view" data-id="${prompt.id}">👁️ Ver / Editar</button>
    <button class="btn-action danger btn-delete" data-id="${prompt.id}">🗑️ Eliminar</button>
  `;
}

/**
 * Adjunta event listeners a una tarjeta
 */
function attachPromptCardListeners(card, prompt) {
  const copyBtn = card.querySelector('.btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCopyPrompt(prompt.id);
    });
  }

  if (!prompt.fixed) {
    const viewBtn = card.querySelector('.btn-view');
    const deleteBtn = card.querySelector('.btn-delete');
    
    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(prompt);
      });
    }
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeletePrompt(prompt.id);
      });
    }
  }
}

// =========================================
// BIBLIOTECA PERSONAL - FILTRADO Y BÚSQUEDA
// =========================================

/**
 * Aplica filtros y búsqueda
 */
function applyFiltersAndSearch() {
  const allPrompts = getAllPrompts();
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  // Filtrar por categoría
  const filteredByCategory = allPrompts.filter(p => {
    if (state.currentFilter === 'todos') return true;
    return p.frequency === state.currentFilter;
  });

  // Filtrar por búsqueda
  const filteredBySearch = filteredByCategory.filter(p => {
    if (searchTerm === '') return true;
    return (
      p.name.toLowerCase().includes(searchTerm) ||
      (p.context && p.context.toLowerCase().includes(searchTerm)) ||
      (p.text && p.text.toLowerCase().includes(searchTerm))
    );
  });
  
  renderPrompts(filteredBySearch);
}

/**
 * Maneja cambio de filtro
 */
function handleFilterChange(filter) {
  state.currentFilter = filter;
  
  // Actualizar UI de filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  applyFiltersAndSearch();
}

// =========================================
// BIBLIOTECA PERSONAL - ACCIONES
// =========================================

/**
 * Copia un prompt al portapapeles
 */
function handleCopyPrompt(id) {
  const prompt = findPromptById(id);
  if (!prompt) return;
  copyToClipboard(prompt.text);
}

/**
 * Elimina un prompt
 */
function handleDeletePrompt(id) {
  if (!id) return;
  
  if (!confirm("¿Seguro que deseas eliminar este prompt? Esta acción no se puede deshacer.")) {
    return;
  }
  
  state.userPrompts = state.userPrompts.filter(p => p.id !== id);
  saveUserPrompts();
  applyFiltersAndSearch();
  closeModal();
  showToast('Prompt eliminado correctamente', 'success');
}

/**
 * Guarda un prompt (crear o editar)
 */
function handleSavePrompt(formData) {
  const id = formData.id || String(Date.now());
  const existingIndex = state.userPrompts.findIndex(p => p.id === id);
  
  let createdAt = Date.now();
  if (existingIndex > -1) {
    createdAt = state.userPrompts[existingIndex].createdAt;
  }

  const prompt = {
    id,
    name: formData.name.trim() || "Sin título",
    text: formData.text.trim(),
    context: formData.context.trim(),
    personalization: formData.personalization.trim(),
    frequency: formData.frequency,
    fixed: false,
    createdAt
  };

  if (existingIndex > -1) {
    state.userPrompts[existingIndex] = prompt;
    showToast('Prompt actualizado correctamente', 'success');
  } else {
    state.userPrompts.push(prompt);
    showToast('Prompt creado correctamente', 'success');
  }

  saveUserPrompts();
  applyFiltersAndSearch();
  closeModal();
}

// =========================================
// MODAL - GESTIÓN
// =========================================

/**
 * Abre el modal para crear/editar
 */
function openModal(prompt = null) {
  const modal = document.getElementById("promptModal");
  const overlay = document.getElementById("modalOverlay");
  const form = document.getElementById("promptForm");
  const title = document.getElementById("modalTitle");
  const deleteBtn = document.getElementById("deletePrompt");
  const saveBtn = document.getElementById("savePrompt");
  
  // Resetear formulario
  form.reset();
  delete form.dataset.editId;
  delete form.dataset.isFixed;
  deleteBtn.style.display = "none";
  saveBtn.style.display = "inline-block";

  if (prompt) {
    // Modo edición
    title.textContent = prompt.fixed ? "Vista de Prompt Base" : "Editar Prompt";
    document.getElementById("promptName").value = prompt.name || "";
    document.getElementById("promptText").value = prompt.text || "";
    document.getElementById("promptContext").value = prompt.context || "";
    document.getElementById("promptPersonalization").value = prompt.personalization || "";
    document.getElementById("promptFrequency").value = prompt.frequency || "semanal";
    
    form.dataset.editId = prompt.id;
    form.dataset.isFixed = prompt.fixed ? "true" : "false";
    
    const readonly = !!prompt.fixed;
    const fields = [
      document.getElementById("promptName"),
      document.getElementById("promptText"),
      document.getElementById("promptContext"),
      document.getElementById("promptPersonalization"),
      document.getElementById("promptFrequency")
    ];
    
    fields.forEach(field => {
      field.disabled = readonly;
    });
    
    if (prompt.fixed) {
      saveBtn.style.display = "none";
    } else {
      deleteBtn.style.display = "inline-block";
    }
  } else {
    // Modo creación
    title.textContent = "Nuevo Prompt";
    const fields = [
      document.getElementById("promptName"),
      document.getElementById("promptText"),
      document.getElementById("promptContext"),
      document.getElementById("promptPersonalization"),
      document.getElementById("promptFrequency")
    ];
    fields.forEach(field => {
      field.disabled = false;
    });
  }

  // Mostrar modal
  overlay.classList.add("active");
  modal.classList.add("active");
}

/**
 * Cierra el modal
 */
function closeModal() {
  const modal = document.getElementById("promptModal");
  const overlay = document.getElementById("modalOverlay");
  
  modal.classList.remove("active");
  overlay.classList.remove("active");
}

// =========================================
// GENERADOR EXPRESS - INICIALIZACIÓN
// =========================================

/**
 * Inicializa el generador con las categorías
 */
function initGenerator() {
  const catSelect = document.getElementById('cat-pro');
  
  // Poblar categorías
  promptsData.forEach((category, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = category.title;
    catSelect.appendChild(option);
  });
}

/**
 * Maneja cambio de categoría
 */
function handleCategoryChange(categoryIndex) {
  const subcatSelect = document.getElementById('subcat-pro');
  const taskSelect = document.getElementById('task-pro');
  const preview = document.getElementById('prompt-template-preview');
  const dynamicInputs = document.getElementById('dynamic-inputs-container');
  
  // Resetear selects dependientes
  subcatSelect.innerHTML = '<option value="">Selecciona una subcategoría...</option>';
  taskSelect.innerHTML = '<option value="">Selecciona un prompt...</option>';
  preview.textContent = 'Selecciona una subcategoría primero...';
  dynamicInputs.innerHTML = '';
  clearGeneratorOutput();

  if (categoryIndex !== '') {
    const subcategories = promptsData[categoryIndex].subcategories;
    subcategories.forEach((sub, subIdx) => {
      const option = document.createElement('option');
      option.value = subIdx;
      option.textContent = sub.title;
      subcatSelect.appendChild(option);
    });
  }
}

/**
 * Maneja cambio de subcategoría
 */
function handleSubcategoryChange(categoryIndex, subcategoryIndex) {
  const taskSelect = document.getElementById('task-pro');
  const preview = document.getElementById('prompt-template-preview');
  const dynamicInputs = document.getElementById('dynamic-inputs-container');
  
  taskSelect.innerHTML = '<option value="">Selecciona un prompt...</option>';
  preview.textContent = 'Selecciona un prompt...';
  dynamicInputs.innerHTML = '';
  clearGeneratorOutput();

  if (categoryIndex !== '' && subcategoryIndex !== '') {
    const prompts = promptsData[categoryIndex].subcategories[subcategoryIndex].prompts;
    prompts.forEach((prompt, promptIdx) => {
      const option = document.createElement('option');
      option.value = promptIdx;
      option.textContent = prompt.title;
      taskSelect.appendChild(option);
    });
  }
}

/**
 * Maneja cambio de prompt
 */
function handlePromptChange(categoryIndex, subcategoryIndex, promptIndex) {
  const preview = document.getElementById('prompt-template-preview');
  const dynamicInputs = document.getElementById('dynamic-inputs-container');
  
  dynamicInputs.innerHTML = '';
  clearGeneratorOutput();

  if (categoryIndex !== '' && subcategoryIndex !== '' && promptIndex !== '') {
    const selectedPrompt = promptsData[categoryIndex].subcategories[subcategoryIndex].prompts[promptIndex];
    const rawPrompt = selectedPrompt.prompt;

    // Highlight variables en preview
    const highlighted = rawPrompt.replace(/\[([^\]]+)\]/g, '<span class="bracket-content">[$1]</span>');
    preview.innerHTML = highlighted;

    // Extraer variables únicas
    const brackets = rawPrompt.match(/\[([^\]]+)\]/g) || [];
    const uniqueBrackets = [...new Set(brackets)];

    // Crear inputs dinámicos
    if (uniqueBrackets.length > 0) {
      uniqueBrackets.forEach(bracket => {
        const cleanLabel = bracket.replace(/\[|\]/g, '');
        const group = document.createElement('div');
        group.className = 'dynamic-input-group';

        const label = document.createElement('label');
        label.textContent = cleanLabel;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.dataset.bracket = bracket;
        input.placeholder = `Ingresa ${cleanLabel}`;

        group.appendChild(label);
        group.appendChild(input);
        dynamicInputs.appendChild(group);
      });
    }
  } else {
    preview.textContent = 'Selecciona una tarea para ver la plantilla...';
  }
}

// =========================================
// GENERADOR EXPRESS - GENERACIÓN
// =========================================

/**
 * Genera el prompt personalizado
 */
function handleGeneratePrompt() {
  const catIdx = document.getElementById('cat-pro').value;
  const subIdx = document.getElementById('subcat-pro').value;
  const taskIdx = document.getElementById('task-pro').value;
  const outputConsole = document.getElementById('output-console');
  const copyBtn = document.getElementById('copy-pro');
  const execContainer = document.getElementById('execution-btn-container');

  if (catIdx === '' || subIdx === '' || taskIdx === '') {
    outputConsole.innerHTML = '<div class="output-error">Por favor, completa la selección de categoría, subcategoría y tarea.</div>';
    copyBtn.style.display = 'none';
    execContainer.style.display = 'none';
    state.currentPromptText = '';
    return;
  }

  const selectedPrompt = promptsData[catIdx].subcategories[subIdx].prompts[taskIdx];
  let finalPrompt = selectedPrompt.prompt;

  // Reemplazar variables con valores de inputs
  const inputs = document.querySelectorAll('#dynamic-inputs-container input[data-bracket]');
  let allFilled = true;
  
  inputs.forEach(input => {
    const value = input.value.trim();
    if (!value) {
      allFilled = false;
    }
    const bracketPattern = input.dataset.bracket.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    const regex = new RegExp(bracketPattern, 'g');
    finalPrompt = finalPrompt.replace(regex, value);
  });

  if (!allFilled) {
    outputConsole.innerHTML = '<div class="output-error">Por favor, completa todos los campos personalizables antes de generar.</div>';
    copyBtn.style.display = 'none';
    execContainer.style.display = 'none';
    state.currentPromptText = '';
    return;
  }

  // Mostrar resultado
  state.currentPromptText = finalPrompt;
  outputConsole.innerHTML = `
    <div class="output-section">
      <strong class="output-title">Prompt Generado:</strong>
      <div class="output-content">${finalPrompt}</div>
    </div>
  `;
  copyBtn.style.display = 'inline-block';
  execContainer.style.display = 'grid';
}

/**
 * Limpia el output del generador
 */
function clearGeneratorOutput() {
  document.getElementById('output-console').innerHTML = '';
  document.getElementById('copy-pro').style.display = 'none';
  document.getElementById('execution-btn-container').style.display = 'none';
  state.currentPromptText = '';
}

/**
 * Ejecuta el prompt en una plataforma externa
 */
function executePromptInPlatform(platform) {
  if (!state.currentPromptText) return;
  
  const encoded = encodeURIComponent(state.currentPromptText);
  const urls = {
    claude: `https://claude.ai/new?q=${encoded}`,
    chatgpt: `https://chat.openai.com/?q=${encoded}`,
    gemini: `https://gemini.google.com/app?q=${encoded}`
  };
  
  if (urls[platform]) {
    window.open(urls[platform], '_blank');
  }
}

// =========================================
// NAVEGACIÓN DE PESTAÑAS
// =========================================

/**
 * Cambia entre pestañas
 */
function switchTab(tabName) {
  const tabs = {
    generator: {
      btn: document.getElementById('tab-generator'),
      content: document.getElementById('assistant-view')
    },
    library: {
      btn: document.getElementById('tab-library'),
      content: document.getElementById('library-view')
    }
  };

  // Desactivar todas las pestañas
  Object.values(tabs).forEach(tab => {
    tab.btn.classList.remove('active');
    tab.content.classList.remove('active');
  });

  // Activar pestaña seleccionada
  if (tabs[tabName]) {
    tabs[tabName].btn.classList.add('active');
    tabs[tabName].content.classList.add('active');
  }
}

// =========================================
// EVENT LISTENERS - INICIALIZACIÓN
// =========================================

/**
 * Inicializa todos los event listeners
 */
function initEventListeners() {
  // === NAVEGACIÓN DE PESTAÑAS ===
  document.getElementById('tab-generator').addEventListener('click', () => switchTab('generator'));
  document.getElementById('tab-library').addEventListener('click', () => switchTab('library'));

  // === BIBLIOTECA PERSONAL ===
  
  // Búsqueda con debounce
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', debounce(applyFiltersAndSearch, CONFIG.DEBOUNCE_DELAY));

  // Filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => handleFilterChange(btn.dataset.filter));
  });

  // Botón agregar prompt
  document.getElementById('addPromptBtn').addEventListener('click', () => openModal(null));

  // Botón exportar
  document.getElementById('exportBtn').addEventListener('click', () => {
    window.open(CONFIG.EXCEL_URL, '_blank');
  });

  // Botón ver Google Sheets
  document.getElementById('viewSheetBtn').addEventListener('click', () => {
    window.open(CONFIG.SHEETS_URL, '_blank');
  });

  // === MODAL ===
  
  // Cerrar modal
  document.getElementById('modalOverlay').addEventListener('click', closeModal);
  document.querySelectorAll('.close-btn, .close-modal').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  document.getElementById('cancelBtn').addEventListener('click', closeModal);

  // Formulario de prompt
  const form = document.getElementById('promptForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (form.dataset.isFixed === "true") return;

    const formData = {
      id: form.dataset.editId,
      name: document.getElementById('promptName').value,
      text: document.getElementById('promptText').value,
      context: document.getElementById('promptContext').value,
      personalization: document.getElementById('promptPersonalization').value,
      frequency: document.getElementById('promptFrequency').value
    };

    handleSavePrompt(formData);
  });

  // Botón eliminar en modal
  document.getElementById('deletePrompt').addEventListener('click', () => {
    const id = form.dataset.editId;
    if (id) handleDeletePrompt(id);
  });

  // === GENERADOR EXPRESS ===
  
  const catSelect = document.getElementById('cat-pro');
  const subcatSelect = document.getElementById('subcat-pro');
  const taskSelect = document.getElementById('task-pro');

  catSelect.addEventListener('change', () => {
    handleCategoryChange(catSelect.value);
  });

  subcatSelect.addEventListener('change', () => {
    handleSubcategoryChange(catSelect.value, subcatSelect.value);
  });

  taskSelect.addEventListener('change', () => {
    handlePromptChange(catSelect.value, subcatSelect.value, taskSelect.value);
  });

  // Botón generar
  document.getElementById('generate-pro').addEventListener('click', handleGeneratePrompt);

  // Botón copiar
  document.getElementById('copy-pro').addEventListener('click', () => {
    if (state.currentPromptText) {
      copyToClipboard(state.currentPromptText);
    }
  });

  // Botones de ejecución
  document.getElementById('exec-claude').addEventListener('click', () => executePromptInPlatform('claude'));
  document.getElementById('exec-chatgpt').addEventListener('click', () => executePromptInPlatform('chatgpt'));
  document.getElementById('exec-gemini').addEventListener('click', () => executePromptInPlatform('gemini'));

  // Prevenir envío de formulario con Enter en inputs del generador
  document.querySelectorAll('#dynamic-inputs-container input').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleGeneratePrompt();
      }
    });
  });
}

// =========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =========================================

/**
 * Función principal de inicialización
 */
function init() {
  console.log('🚀 Iniciando Contador 4.0...');
  
  // Cargar datos
  loadUserPrompts();
  
  // Inicializar componentes
  initGenerator();
  initEventListeners();
  
  // Renderizar biblioteca
  applyFiltersAndSearch();
  
  console.log('✅ Contador 4.0 iniciado correctamente');
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
