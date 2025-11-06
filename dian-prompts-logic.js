// Contenido para tu NUEVO archivo: dian-prompts-logic.js (VERSIÓN CORREGIDA)

document.addEventListener('DOMContentLoaded', () => {

    let currentSelectedPrompt = null;
    const categoryNames = {
        'all': 'Todos', 'vencimientos': 'Vencimientos', 'obligaciones': 'Obligaciones',
        'procedimientos': 'Procedimientos', 'regimenes': 'Regímenes',
        'casos': 'Casos Prácticos', 'herramientas': 'Herramientas Digitales'
    };

    // --- 1. REFERENCIAS A ELEMENTOS DEL DOM ---
    // Este script SÓLO se activará si encuentra el ID 'dian-view'
    const appContainer = document.getElementById('dian-view');
    if (!appContainer) {
        return; // No es la pestaña de DIAN, no hacer nada.
    }

    // --- Selectores ahora apuntan a IDs ÚNICOS ---
    const uploadInput = appContainer.querySelector('#dian-pdf-upload-input');
    const uploadBox = appContainer.querySelector('#dian-upload-box');
    const fileLoadedBox = appContainer.querySelector('#dian-file-loaded-box');
    const fileNameDisplay = appContainer.querySelector('#dian-file-name-display');
    const confirmBox = appContainer.querySelector('#dian-confirm-box');
    const confirmCheckbox = appContainer.querySelector('#dian-confirmPDF');
    const generateBtn = appContainer.querySelector('#dian-generate-prompts-btn');
    const promptsControls = appContainer.querySelector('#dian-prompts-controls');
    const categoryFilter = appContainer.querySelector('#dian-category-filter-select');
    const exportBtn = appContainer.querySelector('#dian-export-prompts-btn');
    const promptCountDisplay = appContainer.querySelector('#dian-prompt-count-display');
    const promptListContainer = appContainer.querySelector('#dian-prompt-list-container');
    const modalOverlay = appContainer.querySelector('#dian-prompt-modal-overlay');
    const modal = appContainer.querySelector('#dian-prompt-modal');
    const modalCloseBtn = appContainer.querySelector('#dian-modal-close-btn');
    const modalTitle = appContainer.querySelector('#dian-modal-title');
    const modalPromptText = appContainer.querySelector('#dian-modal-prompt-text');
    const modalDetails = appContainer.querySelector('#dian-modal-details');
    const modalCopyBtn = appContainer.querySelector('#dian-modal-copy-btn');
    const modalChatGptBtn = appContainer.querySelector('#dian-modal-chatgpt-btn');
    
    // --- CORRECCIÓN CLAVE ---
    // El Toast Container es GLOBAL, lo buscamos en todo el documento.
    const toastContainer = document.getElementById('toast-container');

    // --- 2. LÓGICA DE FUNCIONAMIENTO ---

    // Chequeo de seguridad por si algún elemento no se encuentra
    if (!uploadInput || !generateBtn || !categoryFilter || !exportBtn || !promptListContainer || !modal || !toastContainer) {
        console.error("Error: Faltan elementos de la UI de DIAN.");
        return;
    }

    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            fileNameDisplay.textContent = `✅ Archivo cargado: ${file.name}`;
            uploadBox.style.display = 'none';
            fileLoadedBox.style.display = 'block';
            confirmBox.style.display = 'block';
            confirmCheckbox.checked = false;
            generateBtn.disabled = true;
            promptsControls.style.display = 'none';
            promptListContainer.innerHTML = '';
        } else {
            alert('Por favor, seleccione un archivo PDF válido.');
        }
    });

    confirmCheckbox.addEventListener('change', () => {
        generateBtn.disabled = !confirmCheckbox.checked;
    });

    generateBtn.addEventListener('click', () => {
        if (confirmCheckbox.checked) {
            // "dianPromptsData" viene de tu archivo dian-prompts-data.js
            renderPrompts(dianPromptsData); 
            promptsControls.style.display = 'flex';
            showToast('✅ ¡Prompts generados exitosamente!');
        }
    });
    
    categoryFilter.addEventListener('change', () => {
        const selectedCategory = categoryFilter.value;
        // "dianPromptsData" es la variable global de dian-prompts-data.js
        const allPrompts = dianPromptsData; 
        
        let filteredPrompts;
        if (selectedCategory === 'all') {
            filteredPrompts = allPrompts;
        } else {
            filteredPrompts = allPrompts.filter(p => p.category === selectedCategory);
        }
        renderPrompts(filteredPrompts);
    });
    
    exportBtn.addEventListener('click', () => {
        const selectedCategory = categoryFilter.value;
        let promptsToExport;
        if (selectedCategory === 'all') {
            promptsToExport = dianPromptsData;
        } else {
            promptsToExport = dianPromptsData.filter(p => p.category === selectedCategory);
        }

        const promptsText = promptsToExport.map(prompt =>
          `${prompt.id}. ${prompt.title}\n${prompt.prompt}\n\nCategoría: ${categoryNames[prompt.category]}\nPrioridad: ${prompt.priority}\nComplejidad: ${prompt.complexity}\n${'='.repeat(80)}\n`
        ).join('\n');

        const blob = new Blob([promptsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prompts_DIAN_contador_4.0.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // --- 3. FUNCIONES AUXILIARES ---

    function renderPrompts(prompts) {
        promptListContainer.innerHTML = ''; 
        if (prompts.length === 0) {
            promptListContainer.innerHTML = '<p class="prompt-empty-message">No se encontraron prompts.</p>';
            promptCountDisplay.textContent = '0 prompts disponibles';
            return;
        }
        promptCountDisplay.textContent = `${prompts.length} prompts disponibles`;

        prompts.forEach(prompt => {
            const card = document.createElement('div');
            card.className = 'prompt-card'; // Reutilizamos tu clase de estilos (seguro)
            card.style.cursor = 'pointer';
            card.dataset.promptId = prompt.id; 

            card.innerHTML = `
                <div class="prompt-header">
                    <span class="prompt-categoria">${categoryNames[prompt.category]}</span>
                </div>
                <h3 class="prompt-titulo">${prompt.title}</h3>
                <div class="prompt-subcategoria">
                    <span style="color: ${getPriorityColor(prompt.priority)}; font-weight: 700;">Prioridad: ${prompt.priority}</span>
                </div>
                <p class="prompt-contenido" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                    ${prompt.prompt}
                </p>
                <div class="prompt-actions">
                    <button class="btn-action primary copy-btn" style="width: 100%;">
                        Copiar Prompt
                    </button>
                </div>
            `;
            promptListContainer.appendChild(card);
        });
    }

    promptListContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.prompt-card');
        if (!card) return; 

        const promptId = card.dataset.promptId;
        currentSelectedPrompt = dianPromptsData.find(p => p.id == promptId);

        if (event.target.closest('.copy-btn')) {
            copyToClipboard(currentSelectedPrompt.prompt);
        } else {
            openModal();
        }
    });
    
    function openModal() {
        if (!currentSelectedPrompt) return;
        modalTitle.textContent = currentSelectedPrompt.title;
        modalPromptText.value = currentSelectedPrompt.prompt;
        modalDetails.innerHTML = `
            <div style="margin-bottom: 8px;">
                <p style="margin: 0; font-size: 0.8rem; color: var(--text-light);">CATEGORÍA</p>
                <p style="margin: 0; font-weight: 700; color: var(--secondary);">${categoryNames[currentSelectedPrompt.category]}</p>
            </div>
            <div>
                <p style="margin: 0; font-size: 0.8rem; color: var(--text-light);">PRIORIDAD</p>
                <p style="margin: 0; font-weight: 700; color: ${getPriorityColor(currentSelectedPrompt.priority)}; text-transform: capitalize;">${currentSelectedPrompt.priority}</p>
            </div>
        `;
        modal.classList.add('active'); // Usa la clase 'active' de tu CSS
        modalOverlay.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        modalOverlay.classList.remove('active');
        currentSelectedPrompt = null;
    }
    
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    modalCopyBtn.addEventListener('click', () => copyToClipboard(modalPromptText.value));
    modalChatGptBtn.addEventListener('click', () => {
        const promptText = encodeURIComponent(modalPromptText.value);
        window.open(`https://chat.openai.com/?q=${promptText}`, '_blank');
    });

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast'; // Reutiliza tu clase 'toast' global
        toast.textContent = message;
        
        if (toastContainer) {
            toastContainer.appendChild(toast);
        } else {
            // Fallback por si acaso
            document.body.appendChild(toast);
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.zIndex = '9999';
        }
        
        setTimeout(() => {
            toast.style.transition = 'opacity 500ms ease';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✅ Prompt copiado al portapapeles');
        }).catch(err => {
            showToast('❌ Error al copiar');
        });
    }
    
    function getPriorityColor(priority) {
        switch (priority) {
            case 'alta': return 'var(--danger)';
            case 'media': return 'var(--warning)';
            case 'baja': return 'var(--success)';
            default: return 'var(--text-light)';
        }
    }
});
