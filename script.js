// =========================================
// SÚPER-APP CONTADOR 4.0 - SCRIPT.JS
// CONTIENE:
// 1. Lógica de la Biblioteca Personal (v2.5)
// 2. Lógica del Generador Express (Asistente)
// 3. Lógica de Navegación de Pestañas
// =========================================

document.addEventListener("DOMContentLoaded", () => {

  // ========================================================
  // === 1. LÓGICA DE LA BIBLIOTECA PERSONAL (v2.5) =========
  // ========================================================

  // --- Referencias DOM (Biblioteca) ---
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

  // --- Formulario Modal (Biblioteca) ---
  const nameInput = document.getElementById("promptName");
  const textInput = document.getElementById("promptText");
  const contextInput = document.getElementById("promptContext");
  const personalizationInput = document.getElementById("promptPersonalization");
  const freqSelect = document.getElementById("promptFrequency");

  // --- Estado de la App (Biblioteca) ---
  let userPrompts = [];
  let currentFilter = 'todos';

  // --- Datos (Biblioteca) ---
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

  // --- Helpers (Biblioteca) ---
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

  // --- Lógica Central de Renderizado (Biblioteca) ---
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

  // --- Acciones de Tarjetas y Modal (Biblioteca) ---
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

  // --- Manejo del Modal (Biblioteca) ---
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

  // --- Formulario (Biblioteca) ---
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

  // --- Búsqueda y Filtros (Biblioteca) ---
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

  // --- Acciones Externas (Biblioteca) ---
  viewSheetBtn.addEventListener("click", () => {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/1LdUoniteMSwjeLTm0RfCtk5rPMVBY4jQte3Sh0SKKNc/edit?usp=sharing";
    window.open(sheetUrl, "_blank");
  });

  exportBtn.addEventListener("click", () => {
    const url = "https://github.com/jairoamayalaverde/contador4-biblioteca/raw/main/Biblioteca%20de%20Prompts%20Contador%204.0.xlsx";
    window.open(url, "_blank");
  });

  // --- Inicialización (Biblioteca) ---
  // Se llama al final, después de la lógica del Generador
  // applyFiltersAndSearch(); 



  // ========================================================
  // === 2. LÓGICA DEL GENERADOR EXPRESS (ASISTENTE) ========
  // (Este es el código que me enviaste, pegado aquí)
  // ========================================================

  const promptsData = [
    {
      "title": "📊 Análisis Financiero Estratégico",
      "icon": "📈",
      "subcategories": [
        {
          "title": "Evaluación Financiera",
          "prompts": [
            {
              "title": "Análisis Integral de Estados Financieros",
              "prompt": "Actúa como un analista financiero senior. Analiza los estados financieros adjuntos (balance general, estado de resultados y estado de cambios en el patrimonio) de [nombre de la empresa/cliente] de los últimos [número de años] años. Identifica las [número] tendencias más significativas, evalúa la salud financiera general de la empresa, y proporciona [número] recomendaciones estratégicas basadas en tu análisis. Incluye comparaciones año a año y explica el impacto de cada hallazgo en la posición competitiva de la empresa."
            },
            {
              "title": "Análisis Comparativo",
              "prompt": "Compara los estados financieros de esta empresa con los de sus [número] principales competidores en el sector [tipo de industria/sector]. Identifica fortalezas y debilidades relativas en términos de estructura de capital, eficiencia operativa y posición de liquidez. Proporciona un ranking de desempeño financiero y explica qué métricas clave determinan la posición de cada empresa en el mercado."
            },
            {
              "title": "Detección de Anomalías",
              "prompt": "Examina estos estados financieros buscando inconsistencias, irregularidades o señales de alerta relacionadas con [tipo específico de análisis: reconocimiento de ingresos/valuación de inventario/uso de reservas]. Analiza la coherencia entre las diferentes partidas, identifica variaciones inusuais period-over-period, y evalúa la calidad de los earnings. Proporciona un informe de due diligence destacando cualquier área que requiera investigación adicional o aclaración por parte de la gerencia."
            }
          ]
        },
        {
          "title": "Análisis de Flujo de Efectivo",
          "prompts": [
            {
              "title": "Análisis de Sostenibilidad",
              "prompt": "Analiza el estado de flujo de efectivo de los últimos [número de años] años, enfocándote en la sostenibilidad de la generación de efectivo. Evalúa la calidad del flujo operativo, identifica patrones estacionales, y determina si la empresa puede mantener sus operaciones, inversiones y pagos de dividendos sin financiamiento externo. Incluye proyecciones de flujo libre de efectivo para los próximos [número] años."
            },
            {
              "title": "Optimización de Capital de Trabajo",
              "prompt": "Examina los componentes del flujo de efectivo operativo, particularmente los cambios en capital de trabajo. Identifica oportunidades de optimización en [área: cuentas por cobrar/inventarios/cuentas por pagar]. Calcula el ciclo de conversión de efectivo y proporciona [número] estrategias específicas para mejorar la generación de efectivo operativo sin comprometer las operaciones."
            },
            {
              "title": "Evaluación de Capacidad de Inversión",
              "prompt": "Analiza la capacidad de la empresa para financiar proyectos de crecimiento basándote en su flujo de efectivo histórico y proyectado. Evalúa el equilibrio entre flujo operativo, necesidades de capex, servicio de deuda y distribuciones a accionistas. Determina el monto óptimo disponible para nuevas inversiones y recomienda una estructura de financiamiento para proyectos estratégicos de [monto/cantidad]."
            }
          ]
        },
        {
          "title": "Rentabilidad por Línea de Negocio",
          "prompts": [
            {
              "title": "Análisis de Contribución Marginal",
              "prompt": "Analiza la rentabilidad de cada línea de negocio calculando márgenes brutos, contribución marginal y EBITDA por segmento [nombre de la línea de negocio]. Identifica qué líneas están subsidiando a otras, evalúa la asignación de costos fijos, y determina el punto de equilibrio para cada unidad de negocio. Proporciona recomendaciones sobre qué líneas expandir, mantener o descontinuar."
            },
            {
              "title": "Análisis de Valor Económico Agregado (EVA)",
              "prompt": "Calcula el EVA para cada línea de negocio [nombre de la línea de negocio], considerando el costo de capital específico y los activos empleados. Identifica qué segmentos están creando o destruyendo valor, analiza los drivers de rentabilidad únicos de cada línea, y propone estrategias para maximizar el valor económico total de la empresa."
            },
            {
              "title": "Optimización de Portfolio de Negocios",
              "prompt": "Usando la matriz BCG y análisis de rentabilidad, evalúa el portfolio de líneas de negocio. Clasifica cada segmento según su posición competitiva y atractivo del mercado, analiza la sinergia entre líneas, y desarrolla una estrategia de asignación de recursos que maximice el retorno sobre el capital invertido a nivel corporativo en el sector [tipo de industria/sector]."
            }
          ]
        },
        {
          "title": "Ratios y Métricas Financieras",
          "prompts": [
            {
              "title": "Dashboard de Ratios Clave",
              "prompt": "Crea un dashboard ejecutivo con los [número] ratios financieros más críticos organizados en [número] categorías: liquidez, eficiencia, apalancamiento, rentabilidad y mercado. Para cada ratio, proporciona el valor actual, tendencia de [número] años, benchmark del sector [tipo de industria/sector], y semáforo de alerta (verde/amarillo/rojo). Incluye interpretación ejecutiva y acciones recomendadas para ratios en zona de riesgo."
            },
            {
              "title": "Análisis Predictivo con Ratios",
              "prompt": "Utiliza los ratios financieros históricos para desarrollar un modelo predictivo de la salud financiera futura de [nombre de la empresa]. Identifica los ratios más correlacionados con el desempeño operativo, calcula z-scores de Altman y Piotroski F-Score, y proporciona una probabilidad de stress financiero en los próximos [período de tiempo variable: 12-24 meses]. Incluye escenarios de sensibilidad bajo un evento de [evento específico: aumento de tasas/recesión]."
            },
            {
              "title": "Benchmarking Sectorial de Ratios",
              "prompt": "Compara los ratios financieros de la empresa contra el percentil 25, mediana y percentil 75 de su sector industrial [tipo de industria/sector]. Identifica en qué métricas la empresa sobresale o queda rezagada, analiza las causas estructurales de las diferencias, y establece targets realistas de mejora para alcanzar el cuartil superior en [número] años."
            }
          ]
        },
        {
          "title": "Gestión de Riesgos Financieros",
          "prompts": [
            {
              "title": "Mapa de Riesgos Integral",
              "prompt": "Desarrolla un mapa comprensivo de riesgos financieros evaluando: riesgo de liquidez, riesgo crediticio, riesgo de mercado, riesgo operacional y riesgo de concentración en [área específica]. Para cada categoría, identifica los [número] riesgos principales, evalúa probabilidad e impacto, y propone controles preventivos y planes de contingencia. Incluye métricas de early warning para cada tipo de riesgo."
            },
            {
              "title": "Stress Testing Financiero",
              "prompt": "Diseña y ejecuta stress tests bajo [número] escenarios: recesión moderada, crisis sectorial y shock de tasas de interés de [monto/cantidad] puntos base. Evalúa el impacto en liquidez, solvencia y rentabilidad, identifica puntos de quiebre críticos, y determina las acciones de contingencia necesarias. Calcula el capital de reserva requerido para mantener operaciones bajo cada escenario adverso."
            },
            {
              "title": "Sistema de Alertas Tempranas",
              "prompt": "Establece un sistema de alertas tempranas basado en indicadores financieros y operativos para [área/departamento]. Define umbrales críticos para ratios clave, identifica combinaciones de métricas que históricamente preceden problemas financieros, y crea un scoring de riesgo automatizado. Proporciona un protocolo de escalamiento y acciones correctivas para cada nivel de alerta del sistema."
            }
          ]
        }
      ]
    },
    {
      "title": "💼 Comunicación Empresarial de Alto Impacto",
      "icon": "✉️",
      "subcategories": [
        {
          "title": "Comunicaciones a Clientes",
          "prompts": [
            {
              "title": "Comunicación de Cambios o Ajustes",
              "prompt": "Redacta una carta profesional dirigida a nuestros clientes corporativos explicando [cambio específico: aumento de tarifas/modificación de servicios/nueva política]. La carta debe: mantener un tono empático y transparente, explicar las razones comerciales detrás de la decisión, destacar el valor agregado que continuamos proporcionando, incluir una línea de tiempo clara de implementación, y ofrecer un canal directo para consultas. Asegúrate de que el mensaje refuerce la relación a largo plazo y mitigue cualquier preocupación potencial."
            },
            {
              "title": "Explicación de Resultados o Performance",
              "prompt": "Elabora una comunicación personalizada para explicar a nuestro cliente [nombre del cliente] los resultados del proyecto/servicio realizado en el último período de [período de tiempo variable]. La carta debe incluir: un resumen ejecutivo de los logros clave, métricas de desempeño comparadas con objetivos iniciales, explicación de cualquier desviación o reto enfrentado, impacto tangible en su negocio, próximos pasos recomendados, y una invitación para una reunión de seguimiento. El tono debe ser profesional pero cercano, demostrando nuestro compromiso con su éxito."
            },
            {
              "title": "Comunicación de Crisis o Incidentes",
              "prompt": "Desarrolla una carta de comunicación de crisis para informar a los clientes afectados sobre [incidente específico: brecha de seguridad/interrupción de servicio/retiro de producto]. La comunicación debe seguir el protocolo: reconocimiento inmediato del problema, explicación clara de qué ocurrió y por qué, detalle de las acciones correctivas ya implementadas, medidas preventivas para evitar recurrencia, compensación o remediación ofrecida, y cronograma de seguimiento. El mensaje debe transmitir responsabilidad, transparencia y confianza en nuestra capacidad de resolución."
            }
          ]
        },
        {
          "title": "Reportes Ejecutivos",
          "prompts": [
            {
              "title": "Dashboard Ejecutivo Mensual",
              "prompt": "Crea un reporte ejecutivo mensual personalizado para [nombre del ejecutivo/área] que incluya: resumen de [número] puntos clave del mes, dashboard visual con [número] KPIs críticos para su rol en el departamento de [nombre de área/departamento], análisis de tendencias vs. período anterior, identificación de [número] oportunidades inmediatas, alertas sobre riesgos emergentes, y recomendaciones accionables para los próximos [número] días. El formato debe ser conciso (máximo 2 páginas), visualmente atractivo, y enfocado en decisiones estratégicas que el ejecutivo debe tomar."
            },
            {
              "title": "Reporte de Performance por Área",
              "prompt": "Diseña un reporte ejecutivo trimestral personalizado para el Director de [área específica] que analice: performance vs. objetivos establecidos, comparación con benchmarks del sector [tipo de industria/sector], análisis de causas raíz de desviaciones, impacto en otros departamentos y la organización general, iniciativas en curso y su progreso, recomendaciones estratégicas para el siguiente trimestre. Incluye gráficos de tendencias, semáforos de alerta, y un plan de acción priorizado."
            },
            {
              "title": "Reporte Estratégico de Junta Directiva",
              "prompt": "Elabora un reporte ejecutivo para la Junta Directiva de [nombre de la empresa] que cubra: estado general del negocio con métricas financieras clave, avance en objetivos estratégicos anuais, análisis de mercado y posición competitiva en [tipo de industria/sector], principales riesgos y oportunidades identificados, decisiones críticas que requieren aprobación de la junta, y outlook para los próximos [período de tiempo variable]. El documento debe ser de nivel estratégico, incluir resumen ejecutivo de una página, y estar preparado para generar discusión y toma de decisiones en el board."
            }
          ]
        },
        {
          "title": "Presentaciones de Resultados",
          "prompts": [
            {
              "title": "Presentación de Resultados Financieros",
              "prompt": "Desarrolla una presentación de resultados financieros [período de tiempo variable: trimestrales/anuales] de [nombre de la empresa] con la siguiente estructura: slide de apertura con highlights principales, análisis de P&L con comparativos vs. presupuesto y año anterior, evolución del balance y flujo de caja, análisis por línea de negocio o región [área geográfica/línea de negocio], factores que impactaron la performance, outlook y guidance para próximos períodos, Q&A anticipado con posibles preguntas. La presentación debe tener un storytelling claro, visualizaciones impactantes, y mensajes clave que refuercen la narrativa estratégica."
            },
            {
              "title": "Presentación de Resultados de Proyecto",
              "prompt": "Crea una presentación ejecutiva para comunicar los resultados del proyecto [nombre del proyecto] incluyendo: contexto y objetivos originales del proyecto, metodología utilizada y timeline ejecutado, resultados cuantitativos y cualitativos obtenidos, comparación con metas establecidas, lecciones aprendidas y mejores prácticas identificadas, impacto en la organización y próximos pasos, recomendaciones para proyectos futuros. El formato debe ser dinámico, con casos de éxito destacados y métricas visuales convincentes."
            },
            {
              "title": "Presentación de Resultados de Investigación de Mercado",
              "prompt": "Diseña una presentación de resultados de investigación de mercado sobre [tipo de análisis: hábitos de consumo/tendencias tecnológicas/panorama competitivo] que incluya: resumen ejecutivo con insights clave, metodología y muestra del estudio, hallazgos principales organizados por temas relevantes, análisis de implicaciones para la estrategia de negocio, recomendaciones accionables priorizadas por impacto, análisis competitivo y posicionamiento, plan de implementación sugerido."
            }
          ]
        },
        {
          "title": "Reportes de Auditoría",
          "prompts": [
            {
              "title": "Informe Ejecutivo de Auditoría Interna",
              "prompt": "Redacta un informe ejecutivo de auditoría interna dirigido al Comité de Auditoría de [nombre de la empresa] que incluya: resumen de alcance y objetivos de la auditoría realizada en [área/departamento], clasificación de hallazgos por nivel de riesgo (crítico/alto/medio/bajo), descripción detallada de cada observación con evidencia de respaldo, impacto potencial en controles internos y operaciones, recomendaciones específicas com responsables y fechas de implementación, respuesta de la gerencia a cada hallazgo, y plan de seguimiento. El tono debe ser objetivo, constructivo y enfocado en agregar valor a la organización."
            },
            {
              "title": "Comunicación de Hallazgos Críticos",
              "prompt": "Desarrolla una comunicación urgente para el CEO y CFO sobre hallazgos críticos de auditoría en [área/proceso] que incluya: identificación clara del riesgo o problema detectado, evidencia concreta y cuantificación del impacto potencial de [monto/cantidad], análisis de causas raíz y controles que fallaron, acciones correctivas inmediatas requeridas, plan de remediación a corto y mediano plazo, recursos necesarios para implementar soluciones, y cronograma de seguimiento. El mensaje debe ser directo, crear sentido de urgencia apropiado, y facilitar la toma de decisiones ejecutiva inmediata."
            },
            {
              "title": "Reporte de Auditoría para Reguladores",
              "prompt": "Elabora un reporte de auditoría formal para presentar a organismos reguladores que cumpla com [normativa específica: SOX/GDPR/Regulación Local] que incluya: carta de representación de la gerencia, descripción del marco de control interno evaluado, detalle de procedimientos de auditoría ejecutados, hallazgos organizados por área de control, evaluación de la efectividad de controles existentes, deficiencias materiales identificadas y su impacto, plan de acción correctiva com fechas compromiso, y certificación de independencia del equipo auditor. El documento debe cumplir estándares profesionales y regulatorios aplicables."
            }
          ]
        },
        {
          "title": "Comunicaciones Fiscales",
          "prompts": [
            {
              "title": "Comunicación de Cambios en Legislación Fiscal",
              "prompt": "Redacta un memorando ejecutivo explicando el impacto de [nueva legislación/reforma fiscal] en nuestra organización, dirigido al equipo directivo. Incluye: resumen de los cambios normativos más relevantes, análisis cuantitativo del impacto en nuestra carga fiscal anual (estimado de [monto/cantidad]), identificación de oportunidades de planificación fiscal emergentes, riesgos de cumplimiento y nuevas obligaciones, acciones requeridas com fechas límite, recomendaciones estratégicas para optimizar la posición fiscal, y cronograma de implementación. El mensaje debe traducir complejidad legal en implicaciones comerciales claras."
            },
            {
              "title": "Explicación de Estrategia de Optimización Fiscal",
              "prompt": "Desarrolla una presentación para el Comité de Finanzas de [nombre de la empresa] explicando nuestra estrategia de optimización fiscal que incluya: análisis de la carga fiscal actual por jurisdicción y tipo de impuesto [tipo de impuesto], identificación de oportunidades de eficiencia fiscal legal, evaluación de riesgo-beneficio de cada estrategia propuesta, impacto financiero proyectado de las iniciativas (ahorro estimado de [monto/cantidad]), requerimientos de implementación y recursos necesarios, considerações de riesgo reputacional y cumplimiento, y plan de monitoreo continuo. La presentación debe equilibrar oportunidades de ahorro com gestión prudente de riesgos."
            },
            {
              "title": "Comunicación de Contingencias Fiscales",
              "prompt": "Elabora una comunicación al CFO y equipo legal sobre contingencias fiscales identificadas en [área fiscal específica] que incluya: descripción detallada de cada contingencia y su origen, evaluación de probabilidad de materialización y exposición financiera (riesgo de [monto/cantidad]), análisis de precedentes legales y posiciones de autoridades fiscales, estrategias de defensa disponibles y recomendaciones del asesor externo, provisiones contables sugeridas según normativa aplicable, cronograma de procesos administrativos o judiciales, y plan de comunicación com auditores externos y stakeholders. El reporte debe facilitar la toma de decisiones informada sobre gestión de riesgo fiscal."
            }
          ]
        }
      ]
    },
    {
      "title": "📋 Propuestas y Cotizaciones que Cierran Negocios",
      "icon": "💰",
      "subcategories": [
        {
          "title": "Propuestas de Servicios",
          "prompts": [
            {
              "title": "Propuesta Integral de Servicios Contables",
              "prompt": "Desarrolla una propuesta comercial completa para ofrecer servicios contables integrales a [tipo de empresa/sector]. La propuesta debe incluir: análisis de las necesidades contables específicas del cliente, descripción detallada de servicios (contabilidad general, nómina, impuestos, reportes financieros), metodología de trabajo y cronograma de entregas, equipo asignado com perfiles profesionales, diferenciadores competitivos y valor agregado único, estructura de costos transparente com opciones de pago, garantías de calidad y SLAs, casos de éxito similares, y próximos pasos del proceso. El tono debe ser profesional, consultivo y enfocado en generar confianza."
            },
            {
              "title": "Propuesta de Migración y Modernización Contable",
              "prompt": "Elabora una propuesta especializada para la modernización del sistema contable de un cliente que actualmente maneja procesos manuales o sistemas obsoletos. Incluye: diagnóstico del estado actual y gaps identificados en [área específica: cuentas por pagar/activos fijos], propuesta de implementación de [software contable/ERP] moderno, plan de migración de datos históricos, capacitación del equipo interno del cliente, procesos optimizados y controles internos mejorados, cronograma de implementación por fases, análisis costo-beneficio de la modernización, soporte post-implementación, y métricas de éxito esperadas. Enfócate en el ROI y la eficiencia operativa."
            },
            {
              "title": "Propuesta de Outsourcing Contable Completo",
              "prompt": "Diseña una propuesta de outsourcing contable total para una empresa que busca externalizar completamente su función contable. La propuesta debe cubrir: análisis de la situación actual y costos internos, propuesta de servicios externalizados (desde transaccional hasta estratégico), modelo de transición suave desde equipo interno, estructura de governance y comunicación, tecnología y herramientas que utilizaremos, equipo dedicado y estructura de respaldo, comparativo de costos internos vs. outsourcing, beneficios de escalabilidad y expertise especializado, y plan de implementación gradual. Destaca la liberación de recursos para actividades core del negocio."
            }
          ]
        },
        {
          "title": "Cotizaciones y Precios",
          "prompts": [
            {
              "title": "Cotización de Paquetes Diferenciados",
              "prompt": "Crea una cotización estructurada en [número] paquetes de servicios (Básico, Profesional, Premium) para servicios contables, dirigida a [tipo de cliente: PYME/corporativo/startup]. Cada paquete debe incluir: descripción clara de servicios incluidos, frecuencia de entregas y reportes, nivel de soporte y atención, herramientas y tecnología incluida, precio [período de tiempo variable: mensual/anual] com descuentos por anualidad, tabla comparativa visual de características, opciones de add-ons disponibles, términos de contrato y condiciones de pago. Incluye recomendación del paquete más adecuado según el perfil del cliente y justificación del valor de cada tier."
            },
            {
              "title": "Cotización Modular por Servicios",
              "prompt": "Desarrolla una cotización modular que permita al cliente seleccionar servicios específicos según sus necesidades. Incluye módulos como: contabilidad básica, nómina, impuestos, auditoría, consultoría fiscal, reportes ejecutivos, análisis financiero, cada uno com descripción detallada, precio unitario de [monto/cantidad], prerequisitos o dependencias entre módulos, descuentos por combinación de servicios, opciones de escalabilidad según crecimiento del cliente, comparativo de costos vs. contratar servicios por separado, y configurador de propuesta personalizada. Facilita que el cliente pueda armar su paquete ideal."
            },
            {
              "title": "Cotización por Industria Específica",
              "prompt": "Elabora cotizaciones especializadas para [industria específica: retail, manufactura, servicios, etc.] que incluya: servicios estándar adaptados a regulaciones del sector, servicios especializados únicos de la industria, compliance com normativas específicas, reportes regulatorios requeridos, análisis de KPIs sectoriales, benchmarking contra empresas similares, paquetes de diferentes tamaños de empresa (startup, mediana, grande), estructura de precios competitiva para el sector, casos de éxito en empresas similares, y propuesta de valor específica para los retos de esa industria."
            }
          ]
        },
        {
          "title": "Servicios de Valor Agregado",
          "prompts": [
            {
              "title": "Presentación de Servicios Estratégicos",
              "prompt": "Desarrolla una presentación de servicios de valor agregado que vaya más allá de la contabilidad tradicional, incluyendo: consultoría en planeación fiscal estratégica, análisis predictivo y business intelligence, automatización de procesos contables, consultoría en estructura corporativa, due diligence para adquisiciones de [monto/cantidad], modelado financiero para proyectos, implementación de controles internos, capacitación ejecutiva en finanzas. Para cada servicio incluye: beneficios tangibles, casos de uso típicos, metodología diferenciada, ROI esperado para el cliente, y ejemplos de resultados obtenidos. Posiciona estos servicios como catalizadores de crecimiento empresarial."
            },
            {
              "title": "Presentación de Servicios de Transformación Digital",
              "prompt": "Crea una presentación enfocada en servicios de transformación digital contable que incluya: diagnóstico de madurez digital actual en [área/departamento], implementación de ERP y software especializado, automatización de procesos repetitivos (AP, AR, conciliaciones), dashboards en tiempo real y business intelligence, integração com sistemas existentes, capacitación en herramientas digitales, soporte en change management, medición de ROI de la transformación. Destaca cómo estos servicios posicionan al cliente como líder digital en su industria y mejoran la toma de decisiones."
            },
            {
              "title": "Presentación de Servicios de Risk Management",
              "prompt": "Elabora una presentación de servicios especializados en gestión de riesgos financieros que cubra: evaluación integral de riesgos corporativos, diseño de marcos de control interno, implementación de sistemas de alertas tempranas, stress testing y análisis de escenarios, compliance com regulaciones cambiantes, auditoría interna y externa especializada, planes de contingencia financiera, capacitación en gestión de riesgos. Cada servicio debe mostrar cómo protege y crea valor para la organización, com métricas específicas de reducción de riesgo y casos donde hayamos evitado pérdidas significativas para clientes."
            }
          ]
        },
        {
          "title": "Justificación de Honorarios",
          "prompts": [
            {
              "title": "Justificación Basada en Valor Entregado",
              "prompt": "Desarrolla una justificación detallada de honorarios de [monto/cantidad] basada en el valor que entregamos al cliente [nombre del cliente], incluyendo: análisis cuantitativo del ROI generado por nuestros servicios, ahorros de costos identificados y capturados, eficiencias operativas implementadas, riesgos mitigados y su valor económico, benchmarking de honorarios vs. mercado y calidad de servicio, comparativo de costos de tener equipo interno vs. outsourcing, valor de expertise especializado y actualización continua, disponibilidad 24/7 y respaldo de equipo completo. Incluye casos específicos donde nuestro trabajo generó valor medible y cuantificable para otros clientes similares."
            },
            {
              "title": "Justificación por Complejidad y Especialización",
              "prompt": "Elabora una justificación de honorarios enfocada en la complejidad del caso y nivel de especialización requerido para [tipo de análisis/servicio], detallando: análisis de la complejidad técnica específica del cliente, regulaciones especiales o normativas complejas aplicables, nivel de expertise requerido y certificaciones del equipo, tiempo de investigación y actualización normativa continua, riesgo profesional asumido y seguros de responsabilidad, inversión en tecnología y herramientas especializadas, comparativo com tarifas de firmas de similar especialización, escasez de profesionales com el expertise requerido en el mercado."
            },
            {
              "title": "Justificación de Incremento de Honorarios",
              "prompt": "Desarrolla una comunicación para justificar un incremento en honorarios de [porcentaje/cantidad] a cliente existente [nombre del cliente] que incluya: evolución del alcance y complejidad de servicios vs. contrato original, incrementos en regulaciones y requerimientos de compliance, inversiones realizadas en tecnología y capacitación para mejor servicio, inflación y aumentos en costos operativos del mercado, benchmarking actualizado vs. competencia, valor agregado adicional entregado sin costo extra, propuesta de estructura de honorarios escalonada o com incentivos, opciones para optimizar costos manteniendo calidad, y cronograma de implementación gradual del ajuste."
            }
          ]
        },
        {
          "title": "Contratos y Acuerdos",
          "prompts": [
            {
              "title": "Contrato Integral de Servicios Contables",
              "prompt": "Redacta un contrato comprehensivo de servicios contables profesionales que incluya: definición precisa del alcance de servicios y deliverables, responsabilidades de cada parte claramente establecidas, cronograma de entregas y fechas de reporte [período de tiempo variable], estructura de honorarios y términos de pago, cláusulas de confidencialidad y protección de datos, estándares de calidad y SLAs comprometidos, procedimiento de resolución de disputas, términos de terminación y transición, seguros de responsabilidad profesional, cumplimiento normativo y regulatorio, cláusulas de modificación del contrato, y governance del proyecto. El contrato debe proteger ambas partes y facilitar una relación profesional exitosa."
            },
            {
              "title": "Contrato de Consultoría Especializada",
              "prompt": "Desarrolla un contrato específico para servicios de consultoría contable especializada [tipo de análisis/servicio] que contemple: definición detallada del proyecto y objetivos esperados, metodología de trabajo y fases de implementación, equipo consultor asignado y calificaciones, propiedad intelectual de metodologías y resultados, criterios de éxito y métricas de evaluación, estructura de honorarios (fija, variable, success fee de [porcentaje]), confidencialidad de información estratégica del cliente, limitación de responsabilidad apropiada, garantías de calidad y remedios por incumplimiento, exclusividad o no-compete según aplicable, y términos de extensión o proyectos adicionales."
            },
            {
              "title": "Contrato de Retainer Mensual",
              "prompt": "Elabora un contrato de retainer mensual para servicios contables continuos que establezca: paquete base de servicios incluidos en el retainer, servicios adicionales y su facturación, disponibilidad garantizada del equipo (horas mensuales de [número] horas), prioridad de atención y tiempos de respuesta, rollover de horas no utilizadas o política de uso, ajustes anuais de retainer por inflación o cambios de alcance, términos de aviso para modificaciones o cancelación, facturación y términos de pago del retainer, reportes mensuales de servicios prestados, revisión trimestral de adecuación del retainer, y beneficios adicionales por relación de largo plazo. El contrato debe incentivar la retención del cliente y asegurar flujo de caja predecible."
            }
          ]
        }
      ]
    },
    {
      "title": "📈 Reportes y Dashboards Inteligentes",
      "icon": "📊",
      "subcategories": [
        {
          "title": "Sistemas de KPIs",
          "prompts": [
            {
              "title": "Framework Integral de KPIs por Nivel Organizacional",
              "prompt": "Diseña un sistema completo de KPIs financieros estructurado en [número] niveles: estratégico (C-level), táctico (gerencias medias) y operativo (supervisión). Para cada nivel define: [número] KPIs principais com sus fórmulas específicas, frecuencia de medición y reporte, umbrales de alerta (verde/amarillo/rojo), benchmarks del sector [tipo de industria/sector] cuando aplique, interrelación entre KPIs de diferentes niveles, dashboard visual correspondiente, y responsable de cada métrica en [nombre de área/departamento]. Incluye KPIs de rentabilidad, liquidez, eficiencia, crecimiento y riesgo. El framework debe permitir cascadeo desde objetivos estratégicos hasta métricas operativas diarias."
            },
            {
              "title": "KPIs Predictivos y de Early Warning",
              "prompt": "Desarrolla un conjunto de KPIs financieros predictivos que funcionen como sistema de alerta temprana, incluyendo: indicadores adelantados de problemas de liquidez, métricas que predigan deterioro en márgenes, ratios que anticipen dificultades de cobranza, KPIs que alerten sobre desviaciones presupuestarias significativas de [monto/cantidad], indicadores de calidad de earnings, métricas de sostenibilidad del modelo de negocio en [tipo de industria/sector]. Para cada KPI define: algoritmo de cálculo, fuentes de datos requeridas, periodicidad óptima de monitoreo, umbrales críticos de alerta, acciones automáticas a disparar, y correlación com otros indicadores para validación cruzada."
            },
            {
              "title": "KPIs de Value Creation por Línea de Negocio",
              "prompt": "Crea un sistema de KPIs enfocado en medición de creación de valor por unidad de negocio [nombre de la línea de negocio] que incluya: ROI ajustado por riesgo para cada línea, EVA (Economic Value Added) por segmento, ratios de eficiencia de capital empleado, métricas de contribución marginal y punto de equilibrio, KPIs de cross-selling y up-selling, indicadores de satisfacción y retención por segmento, métricas de market share y posicionamiento competitivo. Establece metodología de benchmarking interno y externo, sistema de weightings para KPI composto de performance, y recomendações de asignación de recursos basada en KPIs de value creation."
            }
          ]
        },
        {
          "title": "Reportes Automatizados",
          "prompts": [
            {
              "title": "Sistema de Reportes Automáticos Multi-periodicidad",
              "prompt": "Diseña una arquitectura de reportes automatizados que genere: reportes diarios de cash flow y posición financiera, reportes semanales de performance vs. budget, reportes mensuales de P&L completo y análisis de variaciones, reportes trimestrales de tendencias y análisis predictivo, reportes anuais de cierre com comparativos históricos. Para cada reporte especifica: fuentes de datos automáticas (ERP, CRM, etc.), algoritmos de consolidación, validações de calidad de datos, formato de presentación, lista de distribución automática en [nombre de área/departamento], triggers para reportes especiales por excepción, y proceso de escalamiento para anomalías detectadas."
            },
            {
              "title": "Reportes Inteligentes con Análisis Automático",
              "prompt": "Desarrolla reportes automatizados que incluyan análisis inteligente de datos financieros: identificación automática de tendencias significativas, detección de outliers y anomalías, análisis automático de causas raíz de variaciones en [área específica], generación de insights y recomendações, comparación automática com períodos similares y benchmarks, scoring automático de performance, alertas proactivas sobre métricas críticas. Incluye motor de narrativa automática que explique los números en lenguaje ejecutivo, sistema de priorización de issues por impacto, y recomendações accionables generadas por algoritmos."
            },
            {
              "title": "Reportes Automatizados de Consolidación Multi-entidad",
              "prompt": "Crea sistema de reportes automáticos para organizaciones com múltiples entidades que incluya: consolidación automática de estados financieros, eliminación de transacciones intercompañía, conversión de monedas automática, reportes por entidad y consolidado, análisis de contribución por subsidiaria, reportes de compliance por jurisdicción [país/región], reconciliación automática entre entidades, reportes de transfer pricing, análisis de synergies y duplicidades. Define proceso de validación cruzada entre entidades, manejo de diferentes calendarios fiscales, y reportes especiales para matriz/holding y reguladores."
            }
          ]
        },
        {
          "title": "Dashboards Ejecutivos",
          "prompts": [
            {
              "title": "Dashboard Ejecutivo Integral en Tiempo Real",
              "prompt": "Diseña un dashboard ejecutivo integral que muestre en una sola pantalla: performance financiera actual vs. objetivos com gráficos de tendencia, top [número] KPIs críticos com semáforos de alerta, cash flow proyectado a [número] semanas, análisis de rentabilidad por línea de negocio, principales riesgos identificados y su evolución, opportunities pipeline y su valor potencial de [monto/cantidad], métricas de eficiencia operativa clave, comparativos vs. competencia donde disponible. El dashboard debe ser interactivo, permitir drill-down a detalle, actualizarse automáticamente, ser responsive para móviles, y incluir funcionalidad de exportación y compartición."
            },
            {
              "title": "Dashboard de Performance vs. Budget Dinámico",
              "prompt": "Desarrolla un dashboard interactivo enfocado en análisis presupuestario de [área/departamento] que incluya: vista de performance actual vs. budget com % de cumplimiento, análisis de variaciones por categoría (volumen, precio, mix, eficiencia), forecast actualizado vs. budget original, análisis de sensibilidad com [número] escenarios, waterfall charts mostrando evolución mes a mes, heatmap de performance por departamento/región [área geográfica/departamento], identificación automática de principales drivers de desviación, proyección de cierre de año basada en tendencias atuais. Incluye capacidad de simulación de escenarios y herramientas de forecasting colaborativo."
            },
            {
              "title": "Dashboard de Risk Management Ejecutivo",
              "prompt": "Crea un dashboard especializado en visualización de riscos financeiros para nivel ejecutivo que muestre: mapa de calor de riscos por probabilidad e impacto, métricas de exposición por tipo de risco (crédito, mercado, operacional, liquidez), tendencias en scoring de risco y early warnings, stress test results bajo diferentes escenarios, concentración de riscos por cliente/proveedor/región, efectividad de controles implementados, costo de capital ajustado por risco, análisis de correlação entre diferentes riscos. Dashboard debe incluir simulador de impacto y ferramentas de what-if analysis para estrategias de mitigación."
            }
          ]
        },
        {
          "title": "Análisis de Variaciones",
          "prompts": [
            {
              "title": "Sistema de Análisis de Variaciones Multi-dimensional",
              "prompt": "Desarrolla un sistema comprensivo de análisis de desviaciones presupuestarias que descomponga variaciones en: variación por volumen (cantidad vendida vs. presupuestada), variación por precio (precio real vs. presupuestado), variación por mix (cambio en composición de productos/servicios), variación por eficiencia (costos unitarios real vs. presupuesto), variación por timing (diferencias temporales), variación por FX (impacto cambiario), variaciones extraordinarias/one-time. Para cada tipo de variación incluye: metodología de cálculo, asignación de responsabilidad por área [nombre de área/departamento], impacto en forecast, ações correctivas recomendadas, y análisis de tendencias históricas en el período [período de tiempo variable]."
            },
            {
              "title": "Análisis Predictivo de Desviaciones",
              "prompt": "Crea un sistema de análisis predictivo que identifique desviaciones presupuestarias antes de que ocurran en [área específica], incluyendo: modelos predictivos basados en indicadores adelantados, análisis de correlación entre variables operativas y financieras, identificación de patrones estacionais y cíclicos, early warning system para desviaciones significativas de [porcentaje/cantidad], análisis de sensibilidad ante cambios en variables clave, simulación de escenarios probable/optimista/pesimista, recomendações automáticas de ações preventivas. Sistema debe generar alertas proactivas com suficiente tiempo para ações correctivas y facilitar reforecasting dinámico."
            },
            {
              "title": "Framework de Accountability en Desviaciones",
              "prompt": "Diseña un framework integral de responsabilidad por desviaciones presupuestarias que establezca: matriz de responsabilidad por tipo de desviación y área organizacional, umbrales de tolerancia por nivel jerárquico y tipo de métrica, proceso de escalamiento para desviaciones críticas, metodología de análisis de causas raíz com accountability, sistema de scoring de performance presupuestaria por responsable, incentivos y consecuencias ligados a cumplimiento presupuestario, proceso formal de explicación y plan de acción para desviaciones, seguimiento de efectividad de ações correctivas implementadas."
            }
          ]
        },
        {
          "title": "Reportes de Compliance",
          "prompts": [
            {
              "title": "Sistema Integral de Reportes Regulatorios",
              "prompt": "Desarrolla un sistema completo de reportes de cumplimiento regulatorio que cubra: reportes fiscales (declarações mensuais, anuais, informativas), reportes laborales (nóminas, seguridad social, parafiscales), reportes financeiros regulatorios (superintendencias, bancos centrales), reportes de comercio exterior (importações, exportações), reportes ambientales cuando aplique, reportes de precios de transferencia, reportes de prevención de lavado de dinero. Para cada reporte incluye: cronograma de presentación, validações de calidad, proceso de aprobación, backup de respaldo, y tracking de status de presentación a la autoridad [nombre de regulador]."
            },
            {
              "title": "Dashboard de Compliance en Tiempo Real",
              "prompt": "Crea un dashboard de compliance que monitoree en tiempo real: status de todas las obrigações regulatorias pendientes en [jurisdicción específica], semáforos de alerta por proximidad a fechas límite, tracking de multas o sanciones históricas y su follow-up, métricas de calidad en presentación de reportes (% error, re-trabajo), análisis de risco de compliance por área regulatoria, costo total de compliance (tiempo, recursos, multas), benchmarking de performance vs. mejores prácticas del sector, análisis de impacto de cambios regulatorios en pipeline. Dashboard debe facilitar priorización de esforços y asignación eficiente de recursos de compliance."
            },
            {
              "title": "Reportes de Auditoría de Compliance",
              "prompt": "Diseña reportes especializados para auditorías de cumplimiento (internas y externas) que incluya: inventario completo de obrigações regulatorias aplicables de [normativa específica], matriz de cumplimiento com evidencia de soporte, identificación de gaps o áreas de mejora, evaluación de efectividad de controles internos de compliance, análisis de risco residual post-controles, recomendações priorizadas por impacto y esforço de implementación, plan de acción com responsables y fechas, métricas de seguimiento para mejora continua. Los reportes deben facilitar la certificación ejecutiva de compliance y preparar para auditorías regulatorias."
            }
          ]
        }
      ]
    },
    {
      "title": "⚖️ Cumplimiento Fiscal Proactivo",
      "icon": "📋",
      "subcategories": [
        {
          "title": "Calendarios Fiscales",
          "prompts": [
            {
              "title": "Calendario Fiscal Integral Automatizado",
              "prompt": "Desarrolla un calendario fiscal completo que incluya todas las obrigações tributarias nacionais, regionales y municipales aplicables a [tipo de empresa/sector], organizando: fechas de vencimiento mensuais, bimestrales, trimestrales y anuais, obrigações diferenciadas por régimen tributario (común, simplificado, especial), alertas automáticas com [número] días de anticipación, categorización por tipo de impuesto (renta, IVA, industria y comercio, retenções, parafiscales), indicación de formularios y anexos requeridos, valor estimado de cada obligación, responsable interno asignado en [nombre de área/departamento], y status de cumplimiento. Incluye funcionalidad para actualización automática por cambios normativos y sincronización com sistema contable."
            },
            {
              "title": "Calendario Fiscal com Análisis de Impacto de Cash Flow",
              "prompt": "Diseña un calendario de obrigações tributarias integrado com proyección de flujo de caja que incluya: cronograma de pagos de impuestos com montos proyectados, análisis de impacto en liquidez por períodos críticos, identificación de oportunidades de diferimiento legal de pagos de [tipo de impuesto], estrategias de planificación de pagos para optimizar flujo de caja, análisis de beneficios de pagos anticipados vs. costo de oportunidad, proyección de saldos a favor y compensações disponibles, calendar de devoluções esperadas, planificación de financiamiento para pagos importantes, y alertas de períodos de alta exigencia de liquidez para impuestos."
            },
            {
              "title": "Calendario de Obligaciones por Entidad Múltiple",
              "prompt": "Crea un sistema de calendario fiscal para grupo empresarial com múltiples entidades que contemple: matriz consolidada de obrigações por cada empresa del grupo [nombre de la empresa/cliente], diferenciación por jurisdicções [país/región] y regímenes aplicables, identificación de obrigações comunes vs. específicas por entidad, cronograma de preparación vs. presentación de cada declaración, dependencias entre obrigações (información base requerida), análisis de carga de trabajo por períodos para planificación de recursos, alertas de conflictos de fechas o sobrecargas operativas, dashboard ejecutivo de cumplimiento grupal, y reportes de eficiencia en gestión tributaria. Sistema debe optimizar recursos compartidos y evitar duplicación de esforços."
            }
          ]
        },
        {
          "title": "Análisis de Cambios Normativos",
          "prompts": [
            {
              "title": "Análisis Integral de Reforma Tributaria",
              "prompt": "Desarrolla un análisis comprehensivo de [nova reforma tributaria/cambio normativo] que incluya: resumen ejecutivo de los cambios más relevantes para nuestro tipo de empresa [tipo de empresa/sector], comparativo detallado entre normativa anterior vs. nova, análisis cuantitativo del impacto en carga tributaria anual, identificación de novas obrigações y fechas de implementación, oportunidades de planificación fiscal emergentes, riscos de cumplimiento y áreas de incertidumbre jurídica, recomendações de ações inmediatas vs. mediano plazo, análisis de precedentes administrativos y doctrinarios disponibles, cronograma de implementación por fases, y estrategia de comunicación a stakeholders internos."
            },
            {
              "title": "Impacto Sectorial de Cambios Normativos",
              "prompt": "Elabora un análisis específico del impacto de [cambio normativo] en el sector [industria específica], incluyendo: particularidades del cambio para empresas del sector, análisis comparativo de impacto vs. otros sectores, identificación de ventajas o desventajas competitivas creadas, casos especiais o exceções aplicables al sector, análisis de precedentes en sectores similares, impacto en estructura de costos sectorial, efectos en pricing y competitividad, recomendações específicas para empresas del sector, análisis de posicionamiento estratégico frente al cambio, y evaluación de necesidad de reestructuración de operações o estructura corporativa."
            },
            {
              "title": "Comunicación Ejecutiva de Cambios Normativos Urgentes",
              "prompt": "Redacta una comunicación ejecutiva urgente sobre [cambio normativo específico] dirigida al CEO y CFO, estructurada como un memo ejecutivo de alta prioridad que incluya: Sección de Alerta Crítica com nivel de urgencia (crítico/alto/medio) com justificación, timeline de implementación obligatorio y fechas clave no negociables, consecuencias específicas del incumplimiento (multas, sanções, restrições operativas), Contexto y Análisis com resumen ejecutivo del cambio en máximo 3 párrafos, comparación antes/después de la regulación, áreas de negocio impactadas directamente, benchmarking de cómo están respondiendo competidores e industria, Impacto Financiero Cuantificado com inversión requerida desglosada (tecnología, personal, consultoría, procesos), costos de cumplimiento anuais estimados, riscos financeiros de incumplimiento (multas potenciais, pérdida de licencias), impacto en flujo de caja por trimestres, ROI o análisis costo-beneficio cuando aplique, Plan de Acción Ejecutivo com matriz de decisões críticas com opções, pros/contras y recomendación, roadmap de implementación com hitos verificables, recursos humanos y presupuesto específico requerido, dependencias críticas y riscos de ejecución, métricas de éxito e indicadores de cumplimiento, Recomendações Estratégicas com priorización vs. otros proyectos corporativos (matriz de impacto/esforço), próximos pasos inmediatos (primeras 48-72 horas), y Solicitudes Específicas com aprobações requeridas com deadline."
            }
          ]
        },
        {
          "title": "Optimización Fiscal",
          "prompts": [
            {
              "title": "Plan Integral de Optimización Fiscal Anual",
              "prompt": "Desarrolla un plan estratégico de optimización fiscal que incluya: análisis de la carga tributaria actual por tipo de impuesto [tipo de impuesto], identificación de oportunidades de ahorro fiscal legais, evaluación costo-beneficio de cada estrategia propuesta, análisis de risco tributario vs. beneficio esperado (ahorro de [monto/cantidad]), cronograma de implementación por prioridad e impacto, estimación de ahorros fiscales anuais por estrategia, requerimientos de cambios operativos o estructurales en [área específica], necesidades de documentación de respaldo, análisis de sostenibilidad a largo plazo de cada estrategia, considerações de risco reputacional, y plan de monitoreo continuo de efectividad."
            },
            {
              "title": "Optimización de Estructura Corporativa",
              "prompt": "Diseña una estrategia de optimización de estructura corporativa para minimizar carga fiscal que contemple: análisis de la estructura actual y su eficiencia fiscal, evaluación de estructuras alternativas (holding, subsidiarias, sucursales en [país/región]), análisis de beneficios fiscales por jurisdicción, estrategias de precios de transferencia entre entidades, optimización de flujos de dividendos y regalías, consideración de tratados de doble tributación, análisis de thin capitalization rules, evaluación de regímenes especiais disponibles, análisis de substance requirements, costos de restructuración vs. beneficios esperados, y timeline de implementación com aspectos regulatorios."
            },
            {
              "title": "Estrategias de Diferimiento y Timing Fiscal",
              "prompt": "Elabora estrategias de optimización fiscal basadas en timing y diferimiento para [tipo de impuesto] que incluyan: análisis de oportunidades de diferimiento de ingresos, estrategias de aceleración de deduções, optimización del reconocimiento de ingresos y gastos, planificación de realizações de inversiones, estrategias de compensación de pérdidas fiscales, análisis de beneficios de depreciación acelerada, planificación de distribución de utilidades, timing óptimo para reestructuraciones, consideración de cambios normativos futuros, análisis de valor presente neto de estrategias de timing, riscos de timing agresivo, y implementación práctica de estrategias seleccionadas."
            }
          ]
        },
        {
          "title": "Gestión de Riesgos Tributarios",
          "prompts": [
            {
              "title": "Matriz Integral de Riesgos Tributarios",
              "prompt": "Desarrolla una matriz comprehensiva de riscos tributarios que identifique y evalúe: riscos por tipo de impuesto (renta, IVA, retenções, territoriales), riscos por proceso (determinación, declaración, pago, fiscalización en [jurisdicción específica]), evaluación de probabilidad e impacto financeiro de cada risco, análisis de riscos por posiciones fiscales adoptadas, identificación de áreas grises o interpretativas, evaluación de calidad de documentación de respaldo, análisis de precedentes desfavorables aplicables, riscos de auditoría por sectores de alta fiscalización, evaluación de controles internos tributarios existentes, cuantificación de exposición máxima por risco (ej. [monto/cantidad]), y plan de mitigación priorizado."
            },
            {
              "title": "Análisis de Riesgo en Posiciones Fiscales Agresivas",
              "prompt": "Evalúa el risco tributario de posiciones fiscales específicas adoptadas o en consideración relacionadas com [área fiscal: I+D/Activos intangibles/Precios de Transferencia], incluyendo: análisis legal de la solidez de cada posición, evaluación de precedentes administrativos y jurisprudenciais, análisis de doctrina tributaria aplicable, evaluación del apetito de risco vs. beneficio fiscal, análisis de probabilidad de cuestionamiento en auditoría, estimación de costos de defensa y posibles sanções, evaluación de impacto reputacional de cuestionamientos, análisis de estrategias de documentación defensiva, consideración de consultas previas a autoridades, evaluación de settlements o acuerdos preventivos, estrategias de exit si el risco se materializa, y recomendación final sobre adopción de la posición."
            },
            {
              "title": "Sistema de Early Warning Tributario",
              "prompt": "Diseña un sistema de alertas tempranas para riscos tributarios en [jurisdicción específica] que incluya: identificación de indicadores de risco (red flags) por tipo de impuesto, métricas que sugieren mayor probabilidad de auditoría, monitoreo de changes en interpretación administrativa, alertas por vencimiento de estatutos de limitación, seguimiento de litigios tributarios del sector, monitoreo de cambios en criterios de fiscalización, indicadores de inconsistencias en declarações, alertas de desviaciones significativas vs. sector, sistema de scoring de risco tributario general, dashboard de alertas por criticidad, protocolos de escalamiento por nivel de risco, y plan de ações preventivas automáticas."
            }
          ]
        },
        {
          "title": "Documentación y Defensa",
          "prompts": [
            {
              "title": "Sistema Integral de Documentación Tributaria",
              "prompt": "Desarrolla un sistema completo de documentación y cumplimiento tributario que incluya: inventario maestro de obrigações por jurisdicción/entidad/impuesto/período, biblioteca de templates estandarizados com control de versiones y matriz RACI de responsabilidades para generación y custodia documental, cronograma dinámico de preparación documental com alertas automáticas, sistema de control de versiones com historial completo (cambios/fechas/autores) y checklist de validación de completitud por obligación, procedimientos automatizados de respaldo y recuperación probados, data rooms virtuais de solo lectura para acceso rápido en auditorías y documentación detallada de procesos de cálculo y determinación de impuestos, repositorio de evidencia de controles internos tributarios vinculada a soporte, protocolos de confidencialidad com acceso basado en roles, encriptación de datos y pistas de auditoría inmutables. Cada componente debe incluir: especificaciones técnicas, flujos de trabajo, responsables y métricas de cumplimiento."
            },
            {
              "title": "Expediente Defensivo Ante Auditorías",
              "prompt": "Crea un expediente defensivo completo preparado para potenciais auditorías tributarias de [autoridad fiscal] que contenga: memorando legal de posiciones adoptadas com sustento normativo, documentación completa de transações significativas (valor de [monto/cantidad]), evidencia de business rationale para decisões fiscales, contratos y documentos soporte de operações, documentación de precios de transferencia cuando aplique, evidencia de cumplimiento de obrigações formales, memorando de controles internos tributarios implementados, análisis de consistencia entre posiciones contables y fiscales, documentation de consultas realizadas a asesores, precedentes favorables aplicables a nuestras posiciones, y estrategia de presentación organizada por temas/impuestos."
            },
            {
              "title": "Documentación de Transfer Pricing y Operaciones Internacionales",
              "prompt": "Elabora documentación especializada para cumplimiento en precios de transferencia y operações internacionais que incluya: master file y local file según estándares OCDE para [país/región], análisis económico de precios de transferencia aplicados, documentación de comparables y benchmarks utilizados, evidencia de substance en operações internacionais, documentación de business rationale para estructuras internacionais, contratos intercompany com términos arm's length, documentación de funciones, activos y riscos por entidad, evidencia de decision-making process en operações internacionais, documentación de intangibles y su valoración, análisis de cadena de valor global, y preparación para auditorías coordinadas internacionais."
            }
          ]
        }
      ]
    },
    {
      "title": "🔍 Auditoría y Control Robusto",
      "icon": "🔎",
      "subcategories": [
        {
          "title": "Programas de Auditoría",
          "prompts": [
            {
              "title": "Diseño de Programa Integral de Auditoría",
              "prompt": "Actúa como auditor senior certificado (CIA/CPA) com experiencia en [sector específico]. Diseña un programa de auditoría integral para evaluar [proceso/área específica] que incluya: (a) Análisis detallado del entorno regulatorio aplicable (normas locais, internacionais, sectoriais), (b) Matriz de riscos estratificada por probabilidad e impacto com metodología cualitativa y cuantitativa, (c) Objetivos específicos SMART alineados com el apetito de risco organizacional, (d) Procedimientos sustantivos y de cumplimiento com técnicas de muestreo estadístico (MUS, estratificado, sistemático), (e) Cronograma detallado com hitos críticos y dependencias, (f) Asignación de recursos humanos por nivel de experiencia y especialización, (g) Presupuesto detallado com análisis de sensibilidad (estimado de [monto/cantidad]), (h) Metodología de documentación según estándares internacionais (IIA, AICPA), (i) Indicadores de calidad y efectividad del programa, (j) Plan de contingencia para riscos identificados durante la ejecución."
            },
            {
              "title": "Programa Basado en Riesgo Empresarial",
              "prompt": "Desarrolla un programa de auditoría basado en Enterprise Risk Management (ERM) para una organización com: ingresos anuais de [monto], [número] empleados, operações en [países/regiones], estructura de gobierno corporativo [descripción]. El programa debe incluir: (a) Assessment integral del modelo de tres líneas de defensa, (b) Mapeo detallado de riscos operacionais, financeiros, regulatorios, reputacionais y estratégicos, (c) Evaluación del risk appetite statement y tolerancia al risco por proceso, (d) Metodología de priorización usando matriz de materialidad vs. risco residual, (e) Diseño de universo auditable com frecuencias basadas en risco inherente y calidad de controles, (f) Técnicas de auditoría continua y monitoreo en tiempo real, (g) Integración com comité de auditoría y reportes al board, (h) Métricas de cobertura de risco y ROI de atividades de auditoría, (i) Benchmarking com mejores prácticas de la industria, (j) Plan plurianual com revisiones dinámicas del assessment de risco."
            },
            {
              "title": "Actualización y Optimización Avanzada de Programa",
              "prompt": "Conduce una revisión comprehensiva y actualización del programa de auditoría para [área específica] preparando: (a) Gap analysis contra novas regulaciones (SOX, GDPR, COSO 2013, ISO 31000), (b) Impacto de transformación digital y controles en ambiente de nube [tipo de nube: híbrida/pública/privada], (c) Integración de analytics avanzados (machine learning, process mining, predictive analytics), (d) Leções aprendidas de auditorías anteriores com análisis de causa raíz de deficiencias, (e) Benchmarking contra peer organizations y leading practices, (f) Optimización de eficiencia operativa mediante automatización de procedimientos rutinarios en [área/departamento], (g) Desarrollo de competencias del equipo auditor en novas tecnologías y metodologías, (h) Integración com sistemas de GRC (Governance, Risk & Compliance), (i) Metodología de quality assurance y peer review interno, (j) Medición del valor agregado de auditoría mediante balanced scorecard específico."
            }
          ]
        },
        {
          "title": "Evaluación de Controles",
          "prompts": [
            {
              "title": "Evaluación COSO Avanzada",
              "prompt": "Conduce una evaluación exhaustiva del sistema de control interno aplicando COSO 2013 com enfoque en los 17 principios fundamentales para [área/departamento]. Para cada componente: Ambiente de Control: (a) Evaluación de tone at the top mediante análisis de comunicações ejecutivas, decisões éticas documentadas y cultura organizacional, (b) Assessment de estructura organizacional, líneas de reporte y accountability framework, (c) Revisión de políticas de RRHH, competencias profissionais y evaluación de desempeño, Evaluación de Riesgos: (d) Análisis de proceso de identificación de riscos (talleres, entrevistas, análisis de escenarios), (e) Evaluación de metodología de assessment de riscos com matrices probabilidad/impacto calibradas, (f) Revisión de proceso de respuesta al risco y definición de tolerancia, Atividades de Control: (g) Evaluación de controles preventivos, detectivos y compensatorios com testing de efectividad operativa, (h) Análisis de segregación de funciones en [proceso específico] y controles de autorización, (i) Revisión de controles sobre procesamiento de información y reportes financeiros, Información y Comunicación: (j) Assessment de calidad y relevancia de información para toma de decisões, (k) Evaluación de efectividad de canales de comunicación internos y externos, Monitoreo: (l) Revisión de atividades de monitoreo continuo y avaliações separadas, (m) Assessment de proceso de reporte de deficiencias y seguimiento de ações correctivas."
            },
            {
              "title": "Controles IT y Ciberseguridad",
              "prompt": "Diseña una evaluación comprehensiva de controles IT y ciberseguridad que abarque: Governance IT: (a) Evaluación de alineación entre estrategia IT y objetivos de negocio, (b) Assessment de estructura de governance IT (steering committees, roles y responsabilidades), (c) Revisión de políticas IT y marco de cumplimiento regulatorio, Controles Generais IT: (d) Evaluación de controles de acceso lógico (identity management, privileged access, segregación de funciones), (e) Assessment de gestión de cambios com metodología ITIL/DevOps, (f) Revisión de controles de operación IT (job scheduling, monitoring, incident management), (g) Evaluación de controles de respaldo y disaster recovery com testing de efectividad, Ciberseguridad: (h) Assessment de security framework (NIST, ISO 27001) y maturity model, (i) Evaluación de controles de seguridad perimetral y endpoint, (j) Testing de respuesta a incidentes y threat intelligence, (k) Revisión de programa de awareness y training en seguridad, Controles de Aplicación: (l) Evaluación de controles automatizados en aplicações críticas (validações, cálculos, interfaces), (m) Testing de integridad y completitud de datos, (n) Revisión de controles de reportes financeiros automatizados, Emerging Technologies: (o) Assessment de controles en cloud computing y arquitecturas híbridas, (p) Evaluación de riscos en IoT, AI/ML y blockchain implementations."
            },
            {
              "title": "Matriz Avanzada de Controles",
              "prompt": "Desarrolla una matriz multidimensional de evaluación de controles internos para [proceso/área específica] que incorpore: Dimensión de Risco: (a) Mapping detallado risk-to-control com análisis de cobertura de risco, (b) Clasificación de riscos por categoría (operacional, financeiro, cumplimiento, estratégico, reputacional), (c) Assessment de risco inherente vs. residual post-control, Dimensión de Control: (d) Taxonomía de controles (preventivo/detectivo/correctivo, manual/automatizado/semi-automatizado), (e) Evaluación de design effectiveness vs. operating effectiveness, (f) Assessment de frecuencia operativa y precisión de controles, Dimensión de Testing: (g) Metodología de testing basada en risco com técnicas de muestreo apropiadas, (h) Definición de criterios de efectividad y umbrales de tolerancia de desviações, (i) Protocolos de re-testing y validación continua, Dimensión de Performance: (j) Métricas de efectividad operativa (tasa de fallos, tempo de detección, costo por transacción de [monto/cantidad]), (k) KPIs de eficiencia de controles y análisis costo-beneficio, (l) Benchmarking de controles vs. industry best practices, Dimensión de Governance: (m) Assignment de ownership y accountability por control en [nombre de área/departamento], (n) Proceso de actualización y mantenimiento de controles, (o) Integración com enterprise risk management y strategic planning, Output Analytics: (p) Dashboard ejecutivo com heatmaps de efectividad de controles, (q) Trending analysis y predictive indicators de deterioro de controles, (r) Reporting diferenciado por audiencia (operacional, management, board)."
            }
          ]
        },
        {
          "title": "Detección de Fraude",
          "prompts": [
            {
              "title": "Análisis Forense Avanzado",
              "prompt": "Desarrolla un marco integral de auditoría forense que detecte irregularidades financeiras y operacionais en [área/departamento] mediante análisis estadístico avanzado. Implementa la Ley de Benford para analizar primer y segundo dígito com pruebas chi-cuadrado y estadísticos z, detecta duplicados exactos y difusos usando scoring de similitud, e identifica transações fuera de horario laboral, fines de semana y períodos críticos de cierre. Aplica reconocimiento de patrones para detectar números redondos com significancia estadística, vacíos de secuencia en documentos o transações, y valores atípicos mediante desviações estándar, rangos intercuartílicos y control estadístico de procesos. Incorpora análisis conductual para identificar patrones anómalos de acceso por usuario, velocidades o volúmenes de transacción inusuais, y mapea relaciones sospechosas entre proveedores, empleados y clientes mediante análisis de redes. Utiliza técnicas avanzadas como algoritmos de machine learning supervisado y no supervisado para scoring de anomalías, procesamiento de lenguaje natural para analizar justificaciones contables, y social network analysis para detectar colusión. Incluye pruebas específicas por industria [tipo de industria/sector] enfocadas en reconocimiento de ingresos com pruebas de corte, análisis de gastos discrecionaios y viajes, y detección de empleados fantasma o irregularidades en nómina. Genera reportes mediante dashboards interactivos com capacidad drill-down, modelos probabilísticos de puntuación de risco, y workflows de gestión de casos que preserven evidencia para investigações."
            },
            {
              "title": "Detección de Fraude Ocupacional Especializado",
              "prompt": "Diseña un programa de detección de fraude ocupacional basado en el Árbol de Fraude de la ACFE. Para apropiación indebida de activos, detecta desnatado de efectivo mediante análisis de depósitos y conciliações, fraude en inventario comparando conteos físicos contra registros, y facturación fraudulenta identificando empresas fantasma y compras pessoais vía análisis del maestro de proveedores. En corrupción, evalúa sobornos mediante relaciones inusuais com proveedores y anomalías de precios, comisiones ilícitas a través de manipulación de licitações y concentración de proveedores, y extorsión económica por términos contratuais anormais. Para fraude en estados financeiros, examina reconocimiento indebido de ingresos com pruebas de corte y transações com partes relacionadas, manipulación de gastos revisando capitalización y reservas, y declarações erróneas mediante pruebas de valuación y deterioro. Analiza señales de alerta incluyendo indicadores conductuais de presión financeira, evidencia documental alterada, y debilidades de control como segregación de funciones deficiente. Implementa protocolos de investigación com técnicas de entrevista estructuradas, análisis forense digital de correos y archivos, y preservación de evidencia bajo estándares de cadena de custodia y admisibilidad legal."
            },
            {
              "title": "Sistema de Alertas Inteligentes de Auditoría",
              "prompt": "Construye sistema de alerta temprana com indicadores cuantitativos (razones financeiras, DSO, rotación, márgenes, variaciones presupuesto vs real, KPIs com benchmarking) y cualitativos (comportamiento gerencial, estrés organizacional, factores externos) en [área/departamento]. Habilita monitoreo tecnológico com auditoría continua automatizada, minería de procesos y machine learning para patrones. Desarrolla scoring de risco multifactorial com modelado predictivo y evaluación dinámica en tiempo real. Gestiona umbrales com límites estadísticos, intervalos de confianza optimizando falsos positivos y protocolos de escalamiento multinivel. Implementa respuesta automatizada com alertas priorizadas, workflows estandarizados, dashboards gerenciais y mejora continua mediante análisis y refinamiento constante."
            }
          ]
        },
        {
          "title": "Hallazgos y Recomendaciones",
          "prompts": [
            {
              "title": "Análisis Costo-Beneficio Avanzado de Recomendaciones",
              "prompt": "Desarrolla un framework sofisticado de priorización de recomendações de [tipo de análisis] mediante evaluación cuantitativa de risco com distribuciones de probabilidad y simulación Monte Carlo para estimar exposición a pérdidas, análisis de velocidad de risco para determinar rapidez de materialización, y mapeo de interdependencias identificando efectos en cascada. Incorpora análisis financeiro integral contemplando costos de implementación (ej. [monto/cantidad]), operativos y de oportunidad, cálculo de ROI mediante NPV y payback period, y análisis de TCO incluyendo tecnología, capacitación y mantenimiento. Evalúa alineación estratégica com objetivos organizacionais, requisitos regulatorios y expectativas de stakeholders, impacto en ventaja competitiva y posicionamiento de mercado en [tipo de industria/sector], y preparación organizacional para el cambio. Analiza factibilidad de implementación mediante requerimientos de recursos humanos, tecnológicos y financeiros, cronogramas usando Critical Path Method com gestión de dependencias, y complejidad de gestión del cambio. Desarrolla métricas de creación de valor com KPIs para medir éxito, establecimiento de baseline y objetivos medibles, y seguimiento periódico com protocolos de ajuste. Evalúa impacto en stakeholders com requerimientos de comunicación, análisis de resistencia y estrategias de mitigación, e identifica champions com estrategias de involucramiento. Análisis para validar robustez bajo múltiples escenarios."
            },
            {
              "title": "Plan de Acción Detallado de Hallazgos",
              "prompt": "Transforma hallazgos de auditoría de [área/proceso] en planes ejecutables mediante análisis de causa raíz com diagramas de espina de pescado y 5 porqués, cuantificación de impacto com análisis de escenarios, y evaluación de stakeholders afectados. Desarrolla soluciones alternativas com análisis pros/contras, investigación de mejores prácticas y evaluación de tecnologías emergentes. Planifica implementación com estructura de desglose de trabajo, hitos, dependencias y análisis de ruta crítica, asignación de recursos humanos, presupuesto y tecnología, y plan de gestión de riscos com estrategias de mitigación. Establece gobierno com asignación clara de roles y responsabilidades, comité directivo com autoridad apropiada, y plan de comunicación com actualizaciones y escalamiento. Desarrolla marco de monitoreo com KPIs líderes y rezagados, revisiones de hitos com criterios de éxito, y procedimientos de aseguramiento de calidad. Implementa verificación mediante pruebas de efectividad, auditoría independiente y documentación de evidencia. Asegura mejora continua capturando leções aprendidas, bucles de retroalimentación para optimización, y planificación de sostenibilidad a largo plazo."
            },
            {
              "title": "Framework de Mejora Continua",
              "prompt": "Establece marco de mejora continua integrando recomendações de auditoría com excelencia organizacional mediante comité directivo com patrocinio C-level y representación interfuncional, centro de excelencia para estandarización metodológica, e integración com comités de auditoría, risco y calidad existentes. Integra metodologías Lean Six Sigma para resolución sistemática de problemas, gestión de procesos de negocio para visibilidad end-to-end, y metodología ágil para mejoramiento iterativo. Implementa plataforma GRC integrada para seguimiento centralizado de recomendações, riscos y controles, automatización de workflows com aprobações y notificaciones, y dashboards analíticos para visibilidad en tiempo real. Desarrolla modelo de madurez de capacidades para evaluar preparación organizacional, benchmarking contra líderes de industria [tipo de industria/sector], y análisis de brechas para identificar oportunidades. Gestiona conocimiento mediante repositorio de mejores prácticas, base de datos de leções aprendidas com causa raíz, y comunidades de práctica interfuncionais. Integra balanced scorecard para alinear mejoras com objetivos estratégicos, seguimiento de realización de valor com métricas financeiras y no financeiras, y medición de ROI del programa. Impulsa cultura mediante framework de gestión del cambio, programas de reconocimiento e innovación, y capacitación para desarrollo de capacidades. Asegura sostenibilidad com procesos de quality assurance, monitoreo de regresión para prevenir retrocesos, y evaluación periódica com recalibración de prioridades."
            }
          ]
        },
        {
          "title": "Seguimiento y Cierre",
          "prompts": [
            {
              "title": "Sistema de Seguimiento Avanzado de Hallazgos",
              "prompt": "Desarrolla un protocolo exhaustivo de verificación de cierre de hallazgos de auditoría que contemple: checklist específico de validación por tipo de hallazgo, metodología de verificación de evidencias presentadas (documental, observación, re-ejecución, confirmación), evaluación de diseño y efectividad operativa de controles implementados, pruebas de sostenibilidad de las ações correctivas (mínimo [número] meses de operación), verificación de que la acción aborda la causa raíz y no solo el síntoma, evaluación de cambios en procesos, políticas o procedimientos, confirmación de capacitación del personal involucrado, validación de documentación actualizada (manuales, workflows), pruebas independientes de la efectividad del control, evaluación de controles compensatorios implementados, análisis de si se generaron riscos residuais novos, sign-off formal de auditoría interna com criterios objetivos, comunicación formal de cierre a stakeholders relevantes, y archivo completo del expediente de cierre."
            },
            {
              "title": "Verificación de Cierre Comprehensiva",
              "prompt": "Desarrolla un protocolo exhaustivo de verificación de cierre de hallazgos de auditoría en [área/proceso] que contemple: checklist específico de validación por tipo de hallazgo, metodología de verificación de evidencias presentadas (documental, observación, re-ejecución, confirmación), evaluación de diseño y efectividad operativa de controles implementados, pruebas de sostenibilidad de las ações correctivas (mínimo [número] meses de operación), verificación de que la acción aborda la causa raíz y no solo el síntoma, evaluación de cambios en procesos, políticas o procedimientos, confirmación de capacitación del personal involucrado, validación de documentación actualizada (manuales, workflows), pruebas independientes de la efectividad del control, evaluación de controles compensatorios implementados, análisis de si se generaron riscos residuais novos, sign-off formal de auditoría interna com criterios objetivos, comunicación formal de cierre a stakeholders relevantes, y archivo completo del expediente de cierre. El protocolo debe asegurar que los cierres sean reais, sostenibles y que el risco haya sido efectivamente mitigado antes de dar por cerrado cualquier hallazgo."
            },
            {
              "title": "Reporte Ejecutivo Estratégico de Auditoría",
              "prompt": "Elabora un reporte ejecutivo estratégico de seguimiento de hallazgos para el Comité de Auditoría y Alta Dirección que incluya: resumen ejecutivo de una página com highlights clave, métricas agregadas de cumplimiento (% implementación, hallazgos cerrados vs. abiertos, aging promedio), análisis de hallazgos críticos abiertos com su impacto en el perfil de risco organizacional, hallazgos vencidos com explicación de causas de retraso y plan de acción acelerado, tendencias de implementación por área/responsable com benchmarking interno, análisis de reincidencias y hallazgos repetitivos que sugieren problemas sistémicos, evaluación de efectividad de ações correctivas implementadas, identificación de áreas com mayor resistencia al cambio o menor cultura de control, impacto agregado de hallazgos no cerrados en exposición al risco (estimado de [monto/cantidad]), reconocimiento de áreas com mejor desempeño en remediación, recomendações estratégicas para mejorar tasas de implementación, necesidades de recursos o apoyo ejecutivo identificadas, análisis de implicações para el plan de auditoría del próximo período, y solicitud de decisões o aprobações requeridas del comité."
            }
          ]
        }
      ]
    },
    {
      "title": "🌍 Clientes Internacionales Sin Fronteras",
      "icon": "🌎",
      "subcategories": [
        {
          "title": "Marcos Contables Internacionales",
          "prompts": [
            {
              "title": "Análisis Comparativo de Marcos Contables Internacionales",
              "prompt": "Desarrolla un análisis comparativo exhaustivo entre [IFRS/US GAAP/normativa local específica] aplicable a [tipo de empresa/sector] que incluya: tabla comparativa de principais diferencias en reconocimiento, medición y presentación, análisis de impacto financeiro de cada diferencia en los estados financeiros, identificación de áreas de convergencia y divergencia material, requerimientos de revelación distintos entre normativas, tratamiento diferenciado de transações críticas (arrendamientos, instrumentos financeiros, consolidación, revenue recognition), análisis de conceptos fundamentales que difieren (matching principle, substance over form, fair value), impacto en ratios financeiros clave por diferencias normativas, requerimientos de conciliación entre marcos contables, análisis de costos de conversión/dual reporting, casos prácticos de aplicación com ejemplos de la industria, timeline de adopción de novas normas en cada jurisdicción, y recomendações sobre qué marco contable utilizar según objetivos estratégicos del cliente."
            },
            {
              "title": "Evaluación de Impacto de Cambio de Marco Contable",
              "prompt": "Elabora un análisis de impacto integral para la transición de [marco contable actual] a [novo marco contable] que contemple: gap analysis detallado entre políticas contables atuais vs. requeridas, cuantificación del impacto en balance de apertura y estados financeiros comparativos, identificación de transações que requerirán re-medición o reclasificación, análisis de impacto en covenants bancarios y acuerdos contratuais, evaluación de cambios necesarios en sistemas contables y procesos, necesidades de capacitación del equipo contable y financeiro, cronograma de implementación com hitos críticos, presupuesto estimado de conversión (consultores, sistemas, capacitación), análisis de impacto fiscal de ajustes de conversión, estrategia de comunicación a inversores y stakeholders sobre cambios, desarrollo de políticas contables novas bajo el marco adoptado, plan de auditoría para primera aplicación, y análisis costo-beneficio de la conversión. Incluye roadmap detallado de implementación por fases."
            },
            {
              "title": "Navegación de Regulaciones Multi-jurisdiccionales",
              "prompt": "Diseña una guía integral de cumplimiento para empresa que opera en [lista de países/jurisdicciones] que incluya: matriz de requerimientos regulatorios por jurisdicción (contables, fiscales, legais), análisis de conflictos entre regulaciones de diferentes países, identificación de normativas extraterritoriais aplicables (FCPA, UK Bribery Act, GDPR), requerimientos de reporte país por país (country-by-country reporting), obrigações de registro y licencias profissionais por jurisdicción, regulaciones de precios de transferencia aplicables, restrições de movimiento de capital y repatriación de utilidades, requerimientos de auditoría local vs. grupo, obrigações de gobierno corporativo diferenciadas, plazos y calendarios regulatorios consolidados, análisis de riscos de cumplimiento por mercado, estrategia de estructura legal óptima preparando regulaciones, y plan de monitoreo continuo de cambios regulatorios. Incluye directorio de autoridades regulatorias y asesores locais recomendados por jurisdicción."
            }
          ]
        },
        {
          "title": "Gestión Multi-moneda",
          "prompts": [
            {
              "title": "Sistema de Reporteo Multi-moneda Automatizado",
              "prompt": "Desarrolla una arquitectura de reporteo financeiro en múltiples monedas que incluya: definición de moneda funcional, de presentación y local para cada entidad, metodología de conversión para cada tipo de partida (monetaria, no-monetaria, patrimonio), tratamiento de diferencias de cambio (P&L vs. OCI), fuentes de datos para tipos de cambio (spot, promedio, histórico) com validações, frecuencia de actualización de tipos de cambio y proceso de cierre, consolidación multi-moneda com eliminaciones de transações intercompañía, reportes simultáneos en moneda local, funcional y de presentación del grupo, análisis de sensibilidad a variaciones cambiarias, dashboard de exposición cambiaria por moneda [tipo de moneda] y por entidad, revelações requeridas sobre risco cambiario y exposición, reconciliación automática de diferencias de conversión, simulador de impacto de escenarios cambiarios en resultados consolidados, reportes de performance eliminando efectos FX para análisis operativo, y auditoría trail completo de conversiones aplicadas."
            },
            {
              "title": "Análisis de Impacto Cambiario en Performance",
              "prompt": "Crea un análisis comprehensivo del impacto de fluctuaciones cambiarias en performance financeira que incluya: descomposición de variaciones en resultados entre efectos operativos vs. efectos FX, análisis de impacto de conversión (translación) vs. impacto transaccional, cuantificación de exposición económica, transaccional y de trasláción por moneda, análisis de sensibilidad mostrando impacto en EBITDA, utilidad neta y flujo de caja de movimientos +/- [porcentaje], [porcentaje]% en principais monedas, identificación de coberturas naturais en el negocio (ingresos y costos en misma moneda), evaluación de estrategias de hedging implementadas y su efectividad, análisis de competitividad relativa por movimientos cambiarios en mercados clave, impacto en pricing power y estructura de costos por variaciones FX, proyección de exposición cambiaria futura basada en pipeline comercial, recomendações de estrategia de cobertura óptima preparando costo vs. beneficio, y presentación de resultados 'constant currency' para mejor análisis de performance operativo. Incluye waterfall charts mostrando impacto de cada moneda en resultados consolidados."
            },
            {
              "title": "Revelaciones y Compliance Multi-moneda",
              "prompt": "Elabora el paquete completo de revelações sobre aspectos multi-moneda para estados financeiros y reportes regulatorios que incluya: nota sobre políticas contables de conversión de moneda extranjera, revelación de monedas funcionais por entidad significativa, análisis de sensibilidad cuantitativo de exposición a risco cambiario, revelación de instrumentos de cobertura y contabilidad de coberturas aplicada, detalle de diferencias de cambio reconocidas en P&L vs. OCI, conciliación de movimientos en reserva de conversión acumulada, revelación de restrições a repatriación de capital por controles cambiarios, análisis de concentración de exposición por moneda, revelación de políticas de gestión de risco cambiario, explicación de cambios en moneda funcional si los hubo, impacto de hiperinflación en economías aplicables (IAS 29), cumplimiento com requerimientos específicos de reguladores locais sobre FX, y presentación ejecutiva que explique impacto FX de manera comprensible para stakeholders no financeiros. Incluye templates de revelación cumpliendo IFRS 7, ASC 830 y regulaciones locais aplicables."
            }
          ]
        },
        {
          "title": "Entorno Regulatorio Local",
          "prompts": [
            {
              "title": "Guía Ejecutiva de Ambiente Regulatorio Local",
              "prompt": "Desarrolla una guía comprensiva del ambiente regulatorio de [país específico] para ejecutivos internacionais que incluya: overview del sistema legal (common law vs. civil law) y sus implicações, estructura del sistema regulatorio contable y de auditoría, autoridades regulatorias clave y sus competencias (superintendencias, comisiones, ministerios), marco de normatividad contable aplicable y roadmap de convergencia a IFRS, regulaciones fiscales fundamentales (tasas, incentivos, restrições), regulaciones laborais críticas y costos asociados, regulaciones de comercio exterior y aduaneras, regulaciones ambientais y de sostenibilidad, protección de datos y privacidad aplicable, gobierno corporativo y responsabilidades de directores, regulaciones sectoriais específicas si aplica, proceso de establecimiento de presencia legal (sucursal vs. subsidiaria), requerimientos de capital mínimo y restrições a inversión extranjera, análisis de riscos regulatorios por orden de impacto, y directorio de autoridades com contactos clave. La guía debe ser estratégica, práctica y orientada a facilitar decisões de entrada o expansión en el mercado."
            },
            {
              "title": "Análisis de Compliance Regulatorio Local Detallado",
              "prompt": "Crea un análisis exhaustivo de requerimientos de cumplimiento regulatorio en [jurisdicción específica] que incluya: inventario completo de obrigações regulatorias por tipo (contables, fiscales, laborais, corporativas, sectoriais), cronograma consolidado de filing y reporting requirements, análisis de sanções y consecuencias por incumplimiento (multas de [monto/cantidad]), requerimientos de licencias y permisos específicos del negocio, obrigações de reporte a autoridades estatísticas, regulaciones de precios de transferencia y documentación requerida, obrigações de auditoría legal y rotación de auditores, requerimientos de gobierno corporativo (composición de junta, comités), regulaciones de protección al consumidor aplicables, obrigações ambientais y de responsabilidad social empresarial, regulaciones de competencia y prácticas comerciais, requerimientos de información pública para empresas listadas o reguladas, procedimientos de inspección y auditoría por autoridades, análisis de precedentes de enforcement relevantes para el sector, estimación de costos de cumplimiento (profissionais, sistemas, filing fees), y plan de implementación de compliance program. Incluye matriz de riscos regulatorios priorizados."
            },
            {
              "title": "Comunicación de Cambios Regulatorios Locales a Matriz",
              "prompt": "Elabora un reporte ejecutivo sobre [cambio regulatorio específico en país] dirigido a casa matriz internacional [nombre de la empresa] que incluya: resumen ejecutivo del cambio y su materialidad para el negocio, contexto del cambio (razones, proceso legislativo, presiones políticas/sociais), descripción técnica del cambio en regulación y comparación com situación anterior, análisis de impacto operativo en el negocio local (procesos, sistemas, personas), cuantificación del impacto financeiro (costos de cumplimiento, impacto en P&L, balance), timeline de implementación y fechas críticas, ações requeridas y recursos necesarios, análisis de cómo cambio posiciona la operación local vs. competencia, evaluación de si cambio es tendencia regional que podría replicarse, riscos de implementación y plan de mitigación, recomendações estratégicas (mantener operación, expandir, reducir, reestructurar), análisis de precedentes en otros mercados donde operamos, y solicitud de aprobações o recursos de casa matriz. El reporte debe balancear rigurosidad técnica com claridad para audiencia internacional que puede no conocer el contexto local."
            }
          ]
        },
        {
          "title": "Comunicación Intercultural",
          "prompts": [
            {
              "title": "Protocolo de Comunicación Intercultural Corporativa",
              "prompt": "Desarrolla un protocolo integral de comunicación intercultural para empresa global que incluya: análisis de dimensiones
