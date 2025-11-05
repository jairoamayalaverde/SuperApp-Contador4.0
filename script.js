// script.js — SÚPER APP CONTADOR 4.0 (Fusionada)
// Lógica V3.0: Pestañas + Asistente + Biblioteca

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. LÓGICA DE PESTAÑAS (TABS) ---
  const tabGenerator = document.getElementById("tab-generator");
  const tabLibrary = document.getElementById("tab-library");
  const viewGenerator = document.getElementById("assistant-view");
  const viewLibrary = document.getElementById("library-view");

  const tabs = [tabGenerator, tabLibrary];
  const views = [viewGenerator, viewLibrary];

  function switchTab(activeIndex) {
    tabs.forEach((tab, index) => {
      if (index === activeIndex) {
        tab.classList.add("active");
        views[index].classList.add("active");
      } else {
        tab.classList.remove("active");
        views[index].classList.remove("active");
      }
    });
  }

  tabGenerator.addEventListener("click", () => switchTab(0));
  tabLibrary.addEventListener("click", () => switchTab(1));

  // --- 2. INICIALIZACIÓN DEL ASISTENTE (Generador Express) ---
  function initAssistant() {
    // --- INICIO DE DATOS DEL ASISTENTE ---
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
                "prompt": "Examina los componentes del flujo de efectivo operativo, particularly los cambios en capital de trabajo. Identifica oportunidades de optimización en [área: cuentas por cobrar/inventarios/cuentas por pagar]. Calcula el ciclo de conversión de efectivo y proporciona [número] estrategias específicas para mejorar la generación de efectivo operativo sin comprometer las operaciones."
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
                "prompt": "Redacta un informe ejecutivo de auditoría interna dirigido al Comité de Auditoría de [nombre de la empresa] que incluya: resumen de alcance y objetivos de la auditoría realizada en [área/departamento], clasificación de hallazgos por nivel de riesgo (crítico/alto/medio/bajo), descripción detallada de cada observación con evidencia de respaldo, impacto potencial en controles internos y operaciones, recomendaciones específicas con responsables y fechas de implementación, respuesta de la gerencia a cada hallazgo, y plan de seguimiento. El tono debe ser objetivo, constructivo y enfocado en agregar valor a la organización."
              },
              {
                "title": "Comunicación de Hallazgos Críticos",
                "prompt": "Desarrolla una comunicación urgente para el CEO y CFO sobre hallazgos críticos de auditoría en [área/proceso] que incluya: identificación clara del riesgo o problema detectado, evidencia concreta y cuantificación del impacto potencial de [monto/cantidad], análisis de causas raíz y controles que fallaron, acciones correctivas inmediatas requeridas, plan de remediación a corto y mediano plazo, recursos necesarios para implementar soluciones, y cronograma de seguimiento. El mensaje debe ser directo, crear sentido de urgencia apropiado, y facilitar la toma de decisiones ejecutiva inmediata."
              },
              {
                "title": "Reporte de Auditoría para Reguladores",
                "prompt": "Elabora un reporte de auditoría formal para presentar a organismos reguladores que cumpla con [normativa específica: SOX/GDPR/Regulación Local] que incluya: carta de representación de la gerencia, descripción del marco de control interno evaluado, detalle de procedimientos de auditoría ejecutados, hallazgos organizados por área de control, evaluación de la efectividad de controles existentes, deficiencias materiales identificadas y su impacto, plan de acción correctiva con fechas compromiso, y certificación de independencia del equipo auditor. El documento debe cumplir estándares profesionales y regulatorios aplicables."
              }
            ]
          },
          {
            "title": "Comunicaciones Fiscales",
            "prompts": [
              {
                "title": "Comunicación de Cambios en Legislación Fiscal",
                "prompt": "Redacta un memorando ejecutivo explicando el impacto de [nueva legislación/reforma fiscal] en nuestra organización, dirigido al equipo directivo. Incluye: resumen de los cambios normativos más relevantes, análisis cuantitativo del impacto en nuestra carga fiscal anual (estimado de [monto/cantidad]), identificación de oportunidades de planificación fiscal emergentes, riesgos de cumplimiento y nuevas obligaciones, acciones requeridas con fechas límite, recomendaciones estratégicas para optimizar la posición fiscal, y cronograma de implementación. El mensaje debe traducir complejidad legal en implicaciones comerciales claras."
              },
              {
                "title": "Explicación de Estrategia de Optimización Fiscal",
                "prompt": "Desarrolla una presentación para el Comité de Finanzas de [nombre de la empresa] explicando nuestra estrategia de optimización fiscal que incluya: análisis de la carga fiscal actual por jurisdicción y tipo de impuesto [tipo de impuesto], identificación de oportunidades de eficiencia fiscal legal, evaluación de riesgo-beneficio de cada estrategia propuesta, impacto financiero proyectado de las iniciativas (ahorro estimado de [monto/cantidad]), requerimientos de implementación y recursos necesarios, considerações de riesgo reputacional y cumplimiento, y plan de monitoreo continuo. La presentación debe equilibrar oportunidades de ahorro con gestión prudente de riesgos."
              },
              {
                "title": "Comunicación de Contingencias Fiscales",
                "prompt": "Elabora una comunicación al CFO y equipo legal sobre contingencias fiscales identificadas en [área fiscal específica] que incluya: descripción detallada de cada contingencia y su origen, evaluación de probabilidad de materialización y exposición financiera (riesgo de [monto/cantidad]), análisis de precedentes legales y posiciones de autoridades fiscales, estrategias de defensa disponibles y recomendaciones del asesor externo, provisiones contables sugeridas según normativa aplicable, cronograma de procesos administrativos o judiciales, y plan de comunicación con auditores externos y stakeholders. El reporte debe facilitar la toma de decisiones informada sobre gestión de riesgo fiscal."
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
                "prompt": "Desarrolla una propuesta comercial completa para ofrecer servicios contables integrales a [tipo de empresa/sector]. La propuesta debe incluir: análisis de las necesidades contables específicas del cliente, descripción detallada de servicios (contabilidad general, nómina, impuestos, reportes financieros), metodología de trabajo y cronograma de entregas, equipo asignado con perfiles profesionales, diferenciadores competitivos y valor agregado único, estructura de costos transparente con opciones de pago, garantías de calidad y SLAs, casos de éxito similares, y próximos pasos del proceso. El tono debe ser profesional, consultivo y enfocado en generar confianza."
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
                "prompt": "Crea una cotización estructurada en [número] paquetes de servicios (Básico, Profesional, Premium) para servicios contables, dirigida a [tipo de cliente: PYME/corporativo/startup]. Cada paquete debe incluir: descripción clara de servicios incluidos, frecuencia de entregas y reportes, nivel de soporte y atención, herramientas y tecnología incluida, precio [período de tiempo variable: mensual/anual] con descuentos por anualidad, tabla comparativa visual de características, opciones de add-ons disponibles, términos de contrato y condiciones de pago. Incluye recomendación del paquete más adecuado según el perfil del cliente y justificación del valor de cada tier."
              },
              {
                "title": "Cotización Modular por Servicios",
                "prompt": "Desarrolla una cotización modular que permita al cliente seleccionar servicios específicos según sus necesidades. Incluye módulos como: contabilidad básica, nómina, impuestos, auditoría, consultoría fiscal, reportes ejecutivos, análisis financiero, cada uno con descripción detallada, precio unitario de [monto/cantidad], prerequisitos o dependencias entre módulos, descuentos por combinación de servicios, opciones de escalabilidad según crecimiento del cliente, comparativo de costos vs. contratar servicios por separado, y configurador de propuesta personalizada. Facilita que el cliente pueda armar su paquete ideal."
              },
              {
                "title": "Cotización por Industria Específica",
                "prompt": "Elabora cotizaciones especializadas para [industria específica: retail, manufactura, servicios, etc.] que incluya: servicios estándar adaptados a regulaciones del sector, servicios especializados únicos de la industria, compliance con normativas específicas, reportes regulatorios requeridos, análisis de KPIs sectoriales, benchmarking contra empresas similares, paquetes de diferentes tamaños de empresa (startup, mediana, grande), estructura de precios competitiva para el sector, casos de éxito en empresas similares, y propuesta de valor específica para los retos de esa industria."
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
                "prompt": "Crea una presentación enfocada en servicios de transformación digital contable que incluya: diagnóstico de madurez digital actual en [área/departamento], implementación de ERP y software especializado, automatización de procesos repetitivos (AP, AR, conciliaciones), dashboards en tiempo real y business intelligence, integração con sistemas existentes, capacitación en herramientas digitales, soporte en change management, medición de ROI de la transformación. Destaca cómo estos servicios posicionan al cliente como líder digital en su industria y mejoran la toma de decisiones."
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
