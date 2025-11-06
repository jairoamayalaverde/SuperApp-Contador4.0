// Contenido para tu NUEVO archivo: dian-prompts-logic.js (VERSIÓN DE CARGA DINÁMICA)

document.addEventListener('DOMContentLoaded', () => {
    
    const dianTabButton = document.getElementById('tab-dian');
    const dianViewContainer = document.getElementById('dian-view');
    let isDianViewInitialized = false; // Bandera para evitar cargar el HTML más de una vez

    if (!dianTabButton || !dianViewContainer) {
        console.error("No se encontraron los elementos base de la pestaña DIAN (botón o contenedor).");
        return;
    }

    // Escuchamos el clic en el botón de la pestaña DIAN
    dianTabButton.addEventListener('click', () => {
        // Tu script 'script.js' se encarga de mostrar/ocultar 'dian-view'
        // Nosotros solo necesitamos cargar el contenido LA PRIMERA VEZ que se hace clic.
        if (!isDianViewInitialized) {
            loadDianViewContent();
            isDianViewInitialized = true;
        }
    });

    // Esta función CONSTRUYE E INYECTA el HTML de la pestaña DIAN
    function loadDianViewContent() {
        const htmlToInject = `
            <div style="text-align: center; margin-bottom: var(--space-xl); padding-top: var(--space-md);">
                <h1 style="font-family: var(--font-heading); font-size: 2.5rem; color: var(--secondary); font-weight: 700;">
                    Recursos DIAN
                </h1>
                <p style="color: var(--text-medium); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
                    ¿Te preocupa el cumplimiento fiscal? Aquí tienes 30 prompts estáticos para consultar y copiar.
                </p>
            </div>

            <div id="dian-console" style="max-width: 800px; margin: 0 auto var(--space-xl); padding: var(--space-xl); border: 2px solid var(--border-light); border-radius: var(--radius-xl); background: var(--bg-white); box-shadow: var(--shadow-md);">
                
                <div id="dian-confirm-box" style="display: none; padding: var(--space-md); background: var(--bg-light); border-left: 5px solid var(--info); border-radius: var(--radius-md); margin-bottom: var(--space-lg);">
                    <div style="display: flex; align-items: flex-start; gap: var(--space-md);">
                        <input type="checkbox" id="dian-confirmPDF" style="margin-top: 6px; width: 18px; height: 18px;" />
                        <label for="dian-confirmPDF" style="flex: 1; margin: 0; font-size: 0.95rem; color: var(--secondary);">
                            <strong style="display: block;">✅ Confirmo que soy usuario del E.book Contador 4.0.</strong>
                            <span style="color: var(--text-medium); font-size: 0.9rem;">
                                Al marcar esta casilla, acepto desbloquear los 30 prompts especializados DIAN.
                            </span>
                        </label>
                    </div>
                    <button id="dian-generate-prompts-btn" class="btn-primary" style="width: 100%; margin-top: var(--space-md);" disabled>
                        🚀 Desbloquear Prompts Ahora
                    </button>
                </div>

                <div id="dian-upload-box" style="border: 3px dashed var(--border-medium); border-radius: var(--radius-lg); padding: var(--space-xl); text-align: center; background: var(--bg-white);">
                    <h3 style="font-family: var(--font-heading); font-weight: 700; color: var(--secondary); font-size: 1.3rem;">
                        Desbloquear Recurso
                    </h3>
                    <p style="color: var(--text-light); margin-bottom: var(--space-lg);">
                        Sube el PDF "Contador 4.0" para validar tu acceso y ver los prompts.
                    </p>
                    <label class="btn-primary" style="cursor: pointer;">
                        Seleccionar PDF
                        <input type="file" id="dian-pdf-upload-input" accept=".pdf" style="display: none;" />
                    </label>
                </div>
                
                <div id="dian-file-loaded-box" style="display: none; border: 3px solid var(--success); border-radius: var(--radius-lg); padding: var(--space-xl); text-align: center; background: #f0fdf4;">
                     <p style="color: var(--success); font-weight: 700; font-size: 1.1rem; margin: 0;" id="dian-file-name-display"></p>
                </div>
            </div>

            <div class="controls" id="dian-prompts-controls" style="display: none; background: var(--bg-white); padding: var(--space-md); border-radius: var(--radius-lg);">
                <div class="search-wrap" style="flex: 1 1 300px;">
                    <select id="dian-category-filter-select" style="width: 100%; padding: 12px 14px; border-radius: var(--radius-md); border: 2px solid var(--border-medium);">
                        <option value="all">Todas las Categorías</option>
                        <option value="vencimientos">Vencimientos</option>
                        <option value="obligaciones">Obligaciones</option>
                        <option value="procedimientos">Procedimientos</option>
                        <option value="regimenes">Regímenes</option>
                        <option value="casos">Casos Prácticos</option>
                        <option value="herramientas">Herramientas Digitales</option>
                    </select>
                </div>
                <div class="actions-wrap">
                    <span id="dian-prompt-count-display" style="color: var(--text-light); font-size: 0.9rem;"></span>
                    <button id="dian-export-prompts-btn" class="btn-export">Exportar</button>
                </div>
            </div>

            <div class="prompt-list" id="dian-prompt-list-container" style="margin-top: var(--space-lg)">
                </div>

            <div class="dian-modal-overlay" id="dian-prompt-modal-overlay"></div>
            <div class="modal dian-modal" id="dian-prompt-modal">
                <div class="modal-content">
                    <button class="close-btn" id="dian-modal-close-btn">&times;</button>
                    <h2 id="dian-modal-title"></h2>
                    <label>PROMPT COMPLETO:</label>
                    <textarea id="dian-modal-prompt-text" readOnly style="min-height: 150px;"></textarea>
                    <label>DETALLES:</label>
                    <div id="dian-modal-details" style="background: var(--bg-light); padding: var(--space-md); border-radius: var(--radius-md);">
                    </div>
                    <div class="modal-actions">
                        <button id="dian-modal-copy-btn" class="btn-primary">Copiar</button>
                        <button id="dian-modal-chatgpt-btn" class="btn-primary" style="background: var(--success); border-color: var(--success);">Usar en ChatGPT</button>
                    </div>
                </div>
            </div>
        `;
        
        // Inyectamos el HTML en el contenedor vacío
        dianViewContainer.innerHTML = htmlToInject;

        // ¡IMPORTANTE! Ahora que el HTML existe, 
        // llamamos a la función que les da vida
        initializeDianViewLogic();
    }

    // Esta función se ejecuta DESPUÉS de que el HTML es inyectado
    function initializeDianViewLogic() {
        let currentSelectedPrompt = null;
        const categoryNames = {
            'all': 'Todos', 'vencimientos': 'Vencimientos', 'obligaciones': 'Obligaciones',
            'procedimientos': 'Procedimientos', 'regimenes': 'Regímenes',
            'casos': 'Casos Prácticos', 'herramientas': 'Herramientas Digitales'
        };

        // --- 1. REFERENCIAS A ELEMENTOS DEL DOM (ahora son seguros) ---
        const uploadInput = dianViewContainer.querySelector('#dian-pdf-upload-input');
        const uploadBox = dianViewContainer.querySelector('#dian-upload-box');
        const fileLoadedBox = dianViewContainer.querySelector('#dian-file-loaded-box');
        const fileNameDisplay = dianViewContainer.querySelector('#dian-file-name-display');
        const confirmBox = dianViewContainer.querySelector('#dian-confirm-box');
        const confirmCheckbox = dianViewContainer.querySelector('#dian-confirmPDF');
        const generateBtn = dianViewContainer.querySelector('#dian-generate-prompts-btn');
        const promptsControls = dianViewContainer.querySelector('#dian-prompts-controls');
        const categoryFilter = dianViewContainer.querySelector('#dian-category-filter-select');
        const exportBtn = dianViewContainer.querySelector('#dian-export-prompts-btn');
        const promptCountDisplay = dianViewContainer.querySelector('#dian-prompt-count-display');
        const promptListContainer = dianViewContainer.querySelector('#dian-prompt-list-container');
        const modalOverlay = dianViewContainer.querySelector('#dian-prompt-modal-overlay');
        const modal = dianViewContainer.querySelector('#dian-prompt-modal');
        const modalCloseBtn = dianViewContainer.querySelector('#dian-modal-close-btn');
        const modalTitle = dianViewContainer.querySelector('#dian-modal-title');
        const modalPromptText = dianViewContainer.querySelector('#dian-modal-prompt-text');
        const modalDetails = dianViewContainer.querySelector('#dian-modal-details');
        const modalCopyBtn = dianViewContainer.querySelector('#dian-modal-copy-btn');
        const modalChatGptBtn = dianViewContainer.querySelector('#dian-modal-chatgpt-btn');
        const toastContainer = document.getElementById('toast-container'); // Global

        if (!uploadInput || !generateBtn || !categoryFilter || !exportBtn || !promptListContainer || !modal || !toastContainer) {
            console.error("Error: Faltan elementos de la UI de DIAN al inicializar.");
            return;
        }

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
                renderPrompts(dianPromptsData); // 'dianPromptsData' es global de 'dian-prompts-data.js'
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
            if (toastContainer) {
                toastContainer.appendChild(toast);
            } else {
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
    }
});
