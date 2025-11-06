// Contenido para tu NUEVO archivo: dian-prompts-logic.js

document.addEventListener('DOMContentLoaded', () => {

    let currentSelectedPrompt = null;
    const categoryNames = {
        'all': 'Todos', 'vencimientos': 'Vencimientos', 'obligaciones': 'Obligaciones',
        'procedimientos': 'Procedimientos', 'regimenes': 'Regímenes',
        'casos': 'Casos Prácticos', 'herramientas': 'Herramientas Digitales'
    };

    // --- 1. REFERENCIAS A ELEMENTOS DEL DOM ---
    // Este script SÓLO se activará si encuentra el ID 'dian-prompts-content-tab'
   const appContainer = document.getElementById('dian-view');
    if (!appContainer) {
        return; // No es la pestaña de DIAN, no hacer nada.
    }

    // Usamos appContainer.querySelector para buscar SÓLO DENTRO de nuestra pestaña
    const uploadInput = appContainer.querySelector('#pdf-upload-input');
    const uploadBox = appContainer.querySelector('#upload-box');
    const fileLoadedBox = appContainer.querySelector('#file-loaded-box');
    const fileNameDisplay = appContainer.querySelector('#file-name-display');
    const confirmBox = appContainer.querySelector('#confirm-box');
    const confirmCheckbox = appContainer.querySelector('#confirmPDF');
    const generateBtn = appContainer.querySelector('#generate-prompts-btn');
    const promptsControls = appContainer.querySelector('#prompts-controls');
    const categoryFilter = appContainer.querySelector('#category-filter-select');
    const exportBtn = appContainer.querySelector('#export-prompts-btn');
    const promptCountDisplay = appContainer.querySelector('#prompt-count-display');
    const promptListContainer = appContainer.querySelector('#prompt-list-container');
    const modalOverlay = appContainer.querySelector('#prompt-modal-overlay');
    const modal = appContainer.querySelector('#prompt-modal');
    const modalCloseBtn = appContainer.querySelector('#modal-close-btn');
    const modalTitle = appContainer.querySelector('#modal-title');
    const modalPromptText = appContainer.querySelector('#modal-prompt-text');
    const modalDetails = appContainer.querySelector('#modal-details');
    const modalCopyBtn = appContainer.querySelector('#modal-copy-btn');
    const modalChatGptBtn = appContainer.querySelector('#modal-chatgpt-btn');
    const toastContainer = appContainer.querySelector('#toast-container');

    // --- 2. LÓGICA DE FUNCIONAMIENTO ---

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
            card.className = 'prompt-card';
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
        modal.classList.add('active');
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
        toast.className = 'toast';
        toast.textContent = message;
        // Asumiendo que tu CSS ya tiene #toast-container
        if (toastContainer) {
            toastContainer.appendChild(toast);
        } else {
            // Fallback por si el toast-container no está en esta pestaña
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
