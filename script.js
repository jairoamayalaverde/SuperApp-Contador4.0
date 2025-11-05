// Importar los datos
import promptsData from './promptsData.js';

document.addEventListener("DOMContentLoaded", () => {

  // ========================================================
  // === LÓGICA DE LA BIBLIOTECA PERSONAL ==================
  // ========================================================

  const addPromptBtn = document.getElementById("addPromptBtn");
  const viewSheetBtn = document.getElementById("viewSheetBtn");
  const promptModal = document.getElementById("promptModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const closeBtns = document.querySelectorAll(".close-modal, .close-btn");
  const cancelBtn = document.getElementById("cancelBtn");
  const promptForm = document.getElementById("promptForm");
  const promptList = document.getElementById("promptList");
  const modalTitle = document.getElementById("modalTitle");
  const exportBtn = document.getElementById("exportBtn");
  const searchInput = document.getElementById("searchInput");
  const deleteBtn = document.getElementById("deletePrompt");
  const saveBtn = document.getElementById("savePrompt");
  const filterBtns = document.querySelectorAll(".filter-btn");

  const nameInput = document.getElementById("promptName");
  const textInput = document.getElementById("promptText");
  const contextInput = document.getElementById("promptContext");
  const personalizationInput = document.getElementById("promptPersonalization");
  const freqSelect = document.getElementById("promptFrequency");

  let userPrompts = [];
  let currentFilter = 'todos';

  const defaultPrompts = [
    { id: "base-1", name: "Análisis Express Rentabilidad PYME", context: "Cliente pregunta por qué bajó la utilidad neta.", personalization: "Incluye 'sector retail Colombia' y lenguaje simple.", text: "Actúa como analista financiero experto. Evalúa los márgenes de utilidad neta de una PYME del sector retail colombiano.", frequency: "semanal", fixed: true, createdAt: Date.now() },
    { id: "base-2", name: "Propuesta Premium de Servicios", context: "Prospecto solicita cotización o upgrade de cliente actual.", personalization: "Cambio 'CEO' por 'Gerente', énfasis en ROI cuantificado.", text: "Redacta una propuesta contable con enfoque premium para retener clientes y destacar ROI con claridad.", frequency: "mensual", fixed: true, createdAt: Date.now() },
    { id: "base-3", name: "Calendario Fiscal Automatizado", context: "Inicio de mes para planificar obligaciones.", personalization: "Solo clientes régimen común, formato tabla con alertas.", text: "Genera un calendario fiscal automatizado para empresas en régimen común con fechas y alertas críticas.", frequency: "mensual", fixed: true, createdAt: Date.now() },
    { id: "base-4", name: "Reporte Ejecutivo Semanal", context: "Todos los lunes para clientes premium.", personalization: "Dashboard visual, máximo 1 página, 3 métricas clave.", text: "Elabora un reporte ejecutivo semanal con resumen financiero, proyección y 3 métricas clave.", frequency: "semanal", fixed: true, createdAt: Date.now() },
    { id: "base-5", name: "Detección de Irregularidades en Nómina", context: "Antes de procesar nómina mensual.", personalization: "Detectar duplicados, horas extras inusuales y empleados inactivos.", text: "Analiza nómina y devuelve hallazgos: duplicados, horas extras anómalas, posibles empleados fantasma.", frequency: "mensual", fixed: true, createdAt: Date.now() }
  ];

  try {
    userPrompts = JSON.parse(localStorage.getItem("userPrompts")) || [];
  } catch (e) {
    console.warn("Error al cargar userPrompts de localStorage:", e);
    userPrompts = [];
  }

  function getAllPrompts() {
    const sortedUserPrompts = userPrompts.sort((a, b) => b.createdAt - a.createdAt);
    return [...sortedUserPrompts, ...defaultPrompts];
  }

  const truncate = (str, len) => {
    if (!str) return "";
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  function applyFiltersAndSearch() {
    const allPrompts = getAllPrompts();
    const searchTerm = searchInput.value.toLowerCase();

    const filteredByCategory = allPrompts.filter(p => {
      if (currentFilter === 'todos') return true;
      return p.frequency === currentFilter;
    });

    const filteredBySearch = filteredByCategory.filter(p => {
      if (searchTerm === '') return true;
      return p.name.toLowerCase().includes(searchTerm) ||
             (p.context && p.context.toLowerCase().includes(searchTerm)) ||
             (p.text && p.text.toLowerCase().includes(searchTerm));
    });
    
    renderPromptsUI(filteredBySearch);
  }

  function renderPromptsUI(listToRender) {
    promptList.innerHTML = "";
    
    if (!Array.isArray(listToRender) || listToRender.length === 0) {
      const emptyMsg = (searchInput.value || currentFilter !== 'todos')
        ? "No se encontraron prompts que coincidan con tu filtro o búsqueda."
        : "No hay prompts aún. Presiona '+ Nuevo Prompt' para crear uno.";
      
      const empty = document.createElement("div");
      empty.className = "prompt-empty-message";
      empty.textContent = emptyMsg;
      promptList.appendChild(empty);
      return;
    }

    listToRender.forEach(p => {
      const card = document.createElement("div");
      card.className = "prompt-card";
      if (p.fixed) card.classList.add("fixed-prompt");
      
      const categoria = capitalize(p.frequency) || 'General';
      const contexto = truncate(p.context || 'Sin contexto', 100);
      const contenido = truncate(p.text || 'Prompt vacío', 150);

      let actionsHTML = '';
      if (p.fixed) {
        actionsHTML = `<button class="btn-action primary btn-copy" data-id="${p.id}">📋 Copiar</button>`;
      } else {
        actionsHTML = `
          <button class="btn-action primary btn-copy" data-id="${p.id}">📋 Copiar</button>
          <button class="btn-action btn-view" data-id="${p.id}">👁️ Ver / Editar</button>
          <button class="btn-action danger btn-delete" data-id="${p.id}">🗑️ Eliminar</button>
        `;
      }

      card.innerHTML = `
        <div class="prompt-header">
          <span class="prompt-categoria">${categoria}</span>
        </div>
        <h3 class="prompt-titulo">${p.name}</h3>
        <p class="prompt-subcategoria">${contexto}</p>
        <div class="prompt-contenido">
          ${contenido}
        </div>
        <div class="prompt-actions">
          ${actionsHTML}
        </div>
      `;

      card.querySelector('.btn-copy').addEventListener('click', (e) => {
        e.stopPropagation();
        copiarPrompt(p.id);
      });

      if (!p.fixed) {
        card.querySelector('.btn-view').addEventListener('click', (e) => {
          e.stopPropagation();
          openModal(p);
        });
        card.querySelector('.btn-delete').addEventListener('click', (e) => {
          e.stopPropagation();
          eliminarPrompt(p.id);
        });
      }

      promptList.appendChild(card);
    });
  }

  function copiarPrompt(id) {
    const prompt = getAllPrompts().find(p => p.id === id);
    if (!prompt) return;
    navigator.clipboard.writeText(prompt.text).then(() => {
      alert("✅ Prompt copiado al portapapeles");
    }).catch(err => console.error('Error al copiar:', err));
  }

  function eliminarPrompt(id) {
    if (!id || !confirm("¿Seguro que deseas eliminar este prompt? Esta acción no se puede deshacer.")) return;
    userPrompts = userPrompts.filter(p => p.id !== id);
    localStorage.setItem("userPrompts", JSON.stringify(userPrompts));
    applyFiltersAndSearch();
    closeModal();
  }

  function openModal(prompt = null) {
    promptForm.reset();
    delete promptForm.dataset.editId;
    delete promptForm.dataset.isFixed;
    deleteBtn.style.display = "none";
    saveBtn.style.display = "inline-block";

    if (prompt) {
      modalTitle.textContent = prompt.fixed ? "Vista de Prompt Base" : "Editar Prompt";
      nameInput.value = prompt.name || "";
      textInput.value = prompt.text || "";
      contextInput.value = prompt.context || "";
      personalizationInput.value = prompt.personalization || "";
      freqSelect.value = prompt.frequency || "semanal";
      promptForm.dataset.editId = prompt.id;
      promptForm.dataset.isFixed = prompt.fixed ? "true" : "false";
      const readonly = !!prompt.fixed;
      [nameInput, textInput, contextInput, personalizationInput, freqSelect].forEach(el => { el.disabled = readonly; });
      if (prompt.fixed) saveBtn.style.display = "none";
      else deleteBtn.style.display = "inline-block";
    } else {
      modalTitle.textContent = "Nuevo Prompt";
      [nameInput, textInput, contextInput, personalizationInput, freqSelect].forEach(el => { el.disabled = false; });
    }
    showOverlay();
    promptModal.classList.add("active");
  }

  function closeModal() {
    promptModal.classList.remove("active");
    hideOverlay();
  }

  function showOverlay() {
    modalOverlay.classList.add("active");
  }

  function hideOverlay() {
    modalOverlay.classList.remove("active");
  }

  modalOverlay.addEventListener("click", closeModal);
  closeBtns.forEach(b => b.addEventListener("click", closeModal));
  cancelBtn.addEventListener("click", closeModal);
  addPromptBtn.addEventListener("click", () => openModal(null));

  promptForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (promptForm.dataset.isFixed === "true") return;

    const id = promptForm.dataset.editId || String(Date.now());
    let createdAt = Date.now();
    const existingIndex = userPrompts.findIndex(p => p.id === id);
    if (existingIndex > -1) createdAt = userPrompts[existingIndex].createdAt;

    const newPrompt = {
      id,
      name: nameInput.value.trim() || "Sin título",
      text: textInput.value.trim(),
      context: contextInput.value.trim(),
      personalization: personalizationInput.value.trim(),
      frequency: freqSelect.value,
      fixed: false,
      createdAt: createdAt
    };

    if (existingIndex > -1) userPrompts[existingIndex] = newPrompt;
    else userPrompts.push(newPrompt);

    localStorage.setItem("userPrompts", JSON.stringify(userPrompts));
    applyFiltersAndSearch();
    closeModal();
  });

  deleteBtn.addEventListener("click", () => {
    const id = promptForm.dataset.editId;
    eliminarPrompt(id);
  });

  searchInput.addEventListener("input", () => {
    applyFiltersAndSearch();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFiltersAndSearch();
    });
  });

  viewSheetBtn.addEventListener("click", () => {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/1LdUoniteMSwjeLTm0RfCtk5rPMVBY4jQte3Sh0SKKNc/edit?usp=sharing";
    window.open(sheetUrl, "_blank");
  });

  exportBtn.addEventListener("click", () => {
    const url = "https://github.com/jairoamayalaverde/contador4-biblioteca/raw/main/Biblioteca%20de%20Prompts%20Contador%204.0.xlsx";
    window.open(url, "_blank");
  });

  // ========================================================
  // === LÓGICA DE NAVEGACIÓN DE PESTAÑAS ==================
  // ========================================================
  
  const tabGenerator = document.getElementById("tab-generator");
  const tabLibrary = document.getElementById("tab-library");
  const assistantView = document.getElementById("assistant-view");
  const libraryView = document.getElementById("library-view");

  tabGenerator.addEventListener("click", () => {
    tabGenerator.classList.add("active");
    tabLibrary.classList.remove("active");
    assistantView.classList.add("active");
    libraryView.classList.remove("active");
  });

  tabLibrary.addEventListener("click", () => {
    tabLibrary.classList.add("active");
    tabGenerator.classList.remove("active");
    libraryView.classList.add("active");
    assistantView.classList.remove("active");
  });

  // ========================================================
  // === LÓGICA DEL GENERADOR EXPRESS ======================
  // ========================================================

  const catPro = document.getElementById('cat-pro');
  const subcatPro = document.getElementById('subcat-pro');
  const taskPro = document.getElementById('task-pro');
  const templatePreview = document.getElementById('prompt-template-preview');
  const dynamicInputsContainer = document.getElementById('dynamic-inputs-container');
  const generateBtn = document.getElementById('generate-pro');
  const outputConsole = document.getElementById('output-console');
  const copyBtn = document.getElementById('copy-pro');
  const executionBtnContainer = document.getElementById('execution-btn-container');

  let currentPromptText = '';

  // Poblar categorías usando promptsData importado
  promptsData.forEach((cat, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = cat.title;
    catPro.appendChild(opt);
  });

  catPro.addEventListener('change', () => {
    const catIdx = catPro.value;
    subcatPro.innerHTML = '<option value="">Selecciona una subcategoría...</option>';
    taskPro.innerHTML = '<option value="">Selecciona un prompt...</option>';
    templatePreview.textContent = 'Selecciona una subcategoría primero...';
    dynamicInputsContainer.innerHTML = '';
    outputConsole.innerHTML = '';
    copyBtn.style.display = 'none';
    executionBtnContainer.style.display = 'none';
    currentPromptText = '';

    if (catIdx !== '') {
      const subs = promptsData[catIdx].subcategories;
      subs.forEach((sub, subIdx) => {
        const opt = document.createElement('option');
        opt.value = subIdx;
        opt.textContent = sub.title;
        subcatPro.appendChild(opt);
      });
    }
  });

  subcatPro.addEventListener('change', () => {
    const catIdx = catPro.value;
    const subIdx = subcatPro.value;
    taskPro.innerHTML = '<option value="">Selecciona un prompt...</option>';
    templatePreview.textContent = 'Selecciona un prompt...';
    dynamicInputsContainer.innerHTML = '';
    outputConsole.innerHTML = '';
    copyBtn.style.display = 'none';
    executionBtnContainer.style.display = 'none';
    currentPromptText = '';

    if (catIdx !== '' && subIdx !== '') {
      const tasks = promptsData[catIdx].subcategories[subIdx].prompts;
      tasks.forEach((t, tIdx) => {
        const opt = document.createElement('option');
        opt.value = tIdx;
        opt.textContent = t.title;
        taskPro.appendChild(opt);
      });
    }
  });

  taskPro.addEventListener('change', () => {
    const catIdx = catPro.value;
    const subIdx = subcatPro.value;
    const taskIdx = taskPro.value;

    dynamicInputsContainer.innerHTML = '';
    outputConsole.innerHTML = '';
    copyBtn.style.display = 'none';
    executionBtnContainer.style.display = 'none';
    currentPromptText = '';

    if (catIdx !== '' && subIdx !== '' && taskIdx !== '') {
      const theTask = promptsData[catIdx].subcategories[subIdx].prompts[taskIdx];
      const rawPrompt = theTask.prompt;

      const highlighted = rawPrompt.replace(/\[([^\]]+)\]/g, '<span class="bracket-content">[$1]</span>');
      templatePreview.innerHTML = highlighted;

      const bracketsRaw = rawPrompt.match(/\[([^\]]+)\]/g) || [];
      const uniqueBrackets = [...new Set(bracketsRaw)];

      if (uniqueBrackets.length > 0) {
        uniqueBrackets.forEach(b => {
          const cleanLabel = b.replace(/\[|\]/g, '');
          const group = document.createElement('div');
          group.className = 'dynamic-input-group';

          const label = document.createElement('label');
          label.textContent = cleanLabel;
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.dataset.bracket = b;
          inp.placeholder = `Ingresa ${cleanLabel}`;

          group.appendChild(label);
          group.appendChild(inp);
          dynamicInputsContainer.appendChild(group);
        });
      }
    } else {
      templatePreview.textContent = 'Selecciona una tarea para ver la plantilla...';
    }
  });

  generateBtn.addEventListener('click', () => {
    const catIdx = catPro.value;
    const subIdx = subcatPro.value;
    const taskIdx = taskPro.value;

    if (catIdx === '' || subIdx === '' || taskIdx === '') {
      outputConsole.innerHTML = '<div class="output-error">Por favor, completa la selección de categoría, subcategoría y tarea.</div>';
      copyBtn.style.display = 'none';
      executionBtnContainer.style.display = 'none';
      currentPromptText = '';
      return;
    }

    const theTask = promptsData[catIdx].subcategories[subIdx].prompts[taskIdx];
    let finalPrompt = theTask.prompt;

    const inputs = dynamicInputsContainer.querySelectorAll('input[data-bracket]');
    let allFilled = true;
    inputs.forEach(inp => {
      const val = inp.value.trim();
      if (!val) {
        allFilled = false;
      }
      const bracketPattern = inp.dataset.bracket.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
      const regex = new RegExp(bracketPattern, 'g');
      finalPrompt = finalPrompt.replace(regex, val);
    });

    if (!allFilled) {
      outputConsole.innerHTML = '<div class="output-error">Por favor, completa todos los campos personalizables antes de generar.</div>';
      copyBtn.style.display = 'none';
      executionBtnContainer.style.display = 'none';
      currentPromptText = '';
      return;
    }

    currentPromptText = finalPrompt;
    outputConsole.innerHTML = `
      <div class="output-section">
        <strong class="output-title">Prompt Generado:</strong>
        <div class="output-content">${finalPrompt}</div>
      </div>
    `;
    copyBtn.style.display = 'inline-block';
    executionBtnContainer.style.display = 'grid';
  });

  copyBtn.addEventListener('click', () => {
    if (currentPromptText) {
      navigator.clipboard.writeText(currentPromptText).then(() => {
        alert('✅ Prompt copiado al portapapeles');
      }).catch(err => {
        console.error('Error al copiar:', err);
        alert('❌ No se pudo copiar el prompt');
      });
    }
  });

  document.getElementById('exec-claude').addEventListener('click', () => {
    if (currentPromptText) {
      const encoded = encodeURIComponent(currentPromptText);
      window.open(`https://claude.ai/new?q=${encoded}`, '_blank');
    }
  });

  document.getElementById('exec-chatgpt').addEventListener('click', () => {
    if (currentPromptText) {
      const encoded = encodeURIComponent(currentPromptText);
      window.open(`https://chat.openai.com/?q=${encoded}`, '_blank');
    }
  });

  document.getElementById('exec-gemini').addEventListener('click', () => {
    if (currentPromptText) {
      const encoded = encodeURIComponent(currentPromptText);
      window.open(`https://gemini.google.com/app?q=${encoded}`, '_blank');
    }
  });

  // Inicializar biblioteca
  applyFiltersAndSearch();

});
```

---

## ✅ **RESULTADO FINAL:**

Deberías tener:
```
📁 tu-proyecto/
├── index.html        ✅ (271 líneas - solo HTML)
├── style.css         ✅ (ya lo tienes del mensaje anterior)
├── script.js         ✅ (acabas de crear - ~400 líneas)
└── promptsData.js    ✅ (ya lo tenías - 7 categorías completas)
