// PDFAnalyzerDIAN.js
// --- TRADUCIDO AL SISTEMA DE DISEÑO "CONTADOR 4.0" ---

import React, { useState } from 'react';
import { Upload, FileText, Download, Calendar, AlertTriangle, CheckCircle, Copy, X } from 'lucide-react';

// NOTA: Asegúrate de que tu CSS global (el que me pasaste) esté importado 
// en el punto de entrada de tu app (ej: index.js o App.js)

const PDFAnalyzerDIAN = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Estado no usado en el original, pero lo mantenemos
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [userConfirmed, setUserConfirmed] = useState(false);

  // --- LA LÓGICA DE NEGOCIO (GENERADOR DE PROMPTS) SE MANTIENE INTATCA ---
  const generateDIANPrompts = () => {
    return [
        { id: 1, category: 'vencimientos', title: 'Calendario Tributario Personas Naturales 2024', prompt: 'Genera un calendario tributario completo para personas naturales en Colombia 2024, incluyendo fechas de vencimiento por último dígito del NIT, formularios aplicables y sanciones por extemporaneidad.', priority: 'alta', complexity: 'intermedio' },
        { id: 2, category: 'vencimientos', title: 'Vencimientos Renta y Complementarios', prompt: 'Explica detalladamente los vencimientos para la declaración de renta y complementarios de personas naturales, diferenciando entre empleados, independientes y obligados a llevar contabilidad.', priority: 'alta', complexity: 'básico' },
        { id: 3, category: 'vencimientos', title: 'IVA Bimestral - Fechas y Procedimiento', prompt: 'Detalla el calendario de vencimientos del IVA bimestral para personas naturales responsables, incluyendo procedimiento de presentación y pago en línea.', priority: 'alta', complexity: 'intermedio' },
        { id: 4, category: 'vencimientos', title: 'Retenciones en la Fuente - Vencimientos', prompt: 'Explica los vencimientos mensuales para agentes retenedores personas naturales, diferenciando entre grandes contribuyentes y demás responsables.', priority: 'media', complexity: 'intermedio' },
        { id: 5, category: 'vencimientos', title: 'Información Exógena - Cronograma', prompt: 'Genera el cronograma completo de presentación de información exógena para personas naturales obligadas, incluyendo formatos y medios de presentación.', priority: 'media', complexity: 'avanzado' },
        { id: 6, category: 'obligaciones', title: 'Obligaciones Formales Personas Naturales', prompt: 'Lista y explica todas las obligaciones formales de las personas naturales ante la DIAN, diferenciando por régimen tributario y nivel de ingresos.', priority: 'alta', complexity: 'básico' },
        { id: 7, category: 'obligaciones', title: 'RUT - Registro Único Tributario', prompt: 'Explica el proceso completo de inscripción, actualización y cancelación del RUT para personas naturales, incluyendo documentos requeridos y procedimientos.', priority: 'alta', complexity: 'básico' },
        { id: 8, category: 'obligaciones', title: 'Facturación Electrónica ObligatorIA', prompt: 'Detalla las obligaciones de facturación electrónica para personas naturales, umbrales de facturación, habilitación y contingencias.', priority: 'alta', complexity: 'avanzado' },
        { id: 9, category: 'obligaciones', title: 'Libros de Contabilidad', prompt: 'Explica qué personas naturales están obligadas a llevar contabilidad, qué libros deben llevar y los procedimientos de registro ante la DIAN.', priority: 'media', complexity: 'intermedio' },
        { id: 10, category: 'obligaciones', title: 'Régimen Simple de Tributación - SIMPLE', prompt: 'Detalla las obligaciones específicas de las personas naturales acogidas al Régimen SIMPLE, incluyendo límites, beneficios y procedimientos.', priority: 'alta', complexity: 'intermedio' },
        { id: 11, category: 'procedimientos', title: 'Proceso Sancionatorio DIAN', prompt: 'Explica el proceso sancionatorio de la DIAN para personas naturales, desde la investigación hasta la imposición de sanciones y recursos disponibles.', priority: 'media', complexity: 'avanzado' },
        { id: 12, category: 'procedimientos', title: 'Devoluciones y Compensaciones', prompt: 'Detalla el procedimiento para solicitar devoluciones y compensaciones tributarias, plazos, documentos requeridos y seguimiento del proceso.', priority: 'media', complexity: 'intermedio' },
        { id: 13, category: 'procedimientos', title: 'Fiscalización Tributaria', prompt: 'Explica los procesos de fiscalización de la DIAN, derechos y deberes del contribuyente, y cómo responder a requerimientos oficiales.', priority: 'media', complexity: 'avanzado' },
        { id: 14, category: 'procedimientos', title: 'Acuerdos de Pago', prompt: 'Detalla el procedimiento para solicitar facilidades de pago ante la DIAN, requisitos, garantías y consecuencias del incumplimiento.', priority: 'media', complexity: 'intermedio' },
        { id: 15, category: 'procedimientos', title: 'Recursos y Reclamaciones', prompt: 'Explica los recursos disponibles contra actos administrativos de la DIAN, plazos para interponerlos y procedimientos ante el Tribunal Administrativo.', priority: 'baja', complexity: 'avanzado' },
        { id: 16, category: 'regimenes', title: 'Grandes Contribuyentes', prompt: 'Explica las obligaciones especiales de las personas naturales clasificadas como grandes contribuyentes, diferencias con el régimen ordinario.', priority: 'media', complexity: 'avanzado' },
        { id: 17, category: 'regimenes', title: 'Autorretenedores', prompt: 'Detalla el régimen de autorretención para personas naturales, procedimientos, tarifas y obligaciones de información.', priority: 'media', complexity: 'intermedio' },
        { id: 18, category: 'regimenes', title: 'Régimen de Insolvencia', prompt: 'Explica las implicaciones tributarias de los procesos de insolvencia de personas naturales y las obligaciones ante la DIAN.', priority: 'baja', complexity: 'avanzado' },
        { id: 19, category: 'regimenes', title: 'Personas Naturales del Exterior', prompt: 'Detalla las obligaciones tributarias de personas naturales extranjeras con ingresos en Colombia y residentes fiscales.', priority: 'media', complexity: 'avanzado' },
        { id: 20, category: 'regimenes', title: 'Régimen Tributario Especial', prompt: 'Explica cuándo una persona natural puede acceder al Régimen Tributario Especial y sus implicaciones fiscales.', priority: 'baja', complexity: 'avanzado' },
        { id: 21, category: 'casos', title: 'Declaración Renta Empleados', prompt: 'Desarrolla un caso práctico completo de declaración de renta para una persona natural empleada, incluyendo cálculos y deducciones.', priority: 'alta', complexity: 'básico' },
        { id: 22, category: 'casos', title: 'Declaración Renta Independientes', prompt: 'Presenta un caso práctico de declaración de renta para persona natural independiente con múltiples fuentes de ingreso.', priority: 'alta', complexity: 'intermedio' },
        { id: 23, category: 'casos', title: 'Corrección de Declaraciones', prompt: 'Explica el procedimiento para corregir declaraciones tributarias, diferenciando entre correcciones que aumentan o disminuyen el impuesto.', priority: 'media', complexity: 'intermedio' },
        { id: 24, category: 'casos', title: 'Cambios Normativos 2024', prompt: 'Resume los principales cambios normativos tributarios para personas naturales vigentes en 2024 y su impacto práctico.', priority: 'alta', complexity: 'intermedio' },
        { id: 25, category: 'casos', title: 'Conciliación Fiscal vs Contable', prompt: 'Explica las principales diferencias entre utilidad contable y renta fiscal para personas naturales obligadas a llevar contabilidad.', priority: 'media', complexity: 'avanzado' },
        { id: 26, category: 'herramientas', title: 'Portal Tributario DIAN', prompt: 'Guía completa para el uso del portal tributario de la DIAN, servicios disponibles, autenticación y resolución de problemas técnicos.', priority: 'alta', complexity: 'básico' },
        { id: 27, category: 'herramientas', title: 'Aplicativo de Ayuda Renta', prompt: 'Explica el uso del aplicativo de ayuda para la declaración de renta de la DIAN, importación de información y validaciones automáticas.', priority: 'alta', complexity: 'básico' },
        { id: 28, category: 'herramientas', title: 'Facturador Gratuito DIAN', prompt: 'Detalla el uso del facturador electrónico gratuito de la DIAN, configuración, emisión de facturas y reportes.', priority: 'media', complexity: 'intermedio' },
        { id: 29, category: 'herramientas', title: 'Servicios Informáticos Tributarios', prompt: 'Explica los servicios informáticos disponibles para personas naturales: pre-validadores, servicios web, aplicaciones móviles.', priority: 'media', complexity: 'intermedio' },
        { id: 30, category: 'herramientas', title: 'Mesa de Ayuda Virtual', prompt: 'Guía para el uso efectivo de la mesa de ayuda virtual de la DIAN, chat bot, consultas frecuentes y escalamiento a funcionarios.', priority: 'media', complexity: 'básico' },
    ];
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setUserConfirmed(false);
      setPrompts([]); // Resetea los prompts si se sube un nuevo archivo
    } else {
      alert('Por favor, seleccione un archivo PDF válido.');
    }
  };

  const proceedWithAnalysis = () => {
    if (userConfirmed && pdfFile) {
      const generatedPrompts = generateDIANPrompts();
      setPrompts(generatedPrompts);
      showToastNotification('✅ ¡Prompts generados exitosamente!');
    }
  };

  const filteredPrompts = selectedCategory === 'all'
    ? prompts
    : prompts.filter(prompt => prompt.category === selectedCategory);

  const categoryNames = {
    'all': 'Todos',
    'vencimientos': 'Vencimientos',
    'obligaciones': 'Obligaciones',
    'procedimientos': 'Procedimientos',
    'regimenes': 'Regímenes',
    'casos': 'Casos Prácticos',
    'herramientas': 'Herramientas Digitales'
  };

  // --- FUNCIONES DE ESTILO ADAPTADAS ---

  // Devuelve un estilo en línea basado en la prioridad
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'alta': return { color: 'var(--danger)', fontWeight: '700' };
      case 'media': return { color: 'var(--warning)', fontWeight: '700' };
      case 'baja': return { color: 'var(--success)', fontWeight: '700' };
      default: return { color: 'var(--text-light)', fontWeight: '700' };
    }
  };

  // Devuelve un icono basado en la complejidad
  const getComplexityIcon = (complexity) => {
    switch (complexity) {
      case 'básico': return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
      case 'intermedio': return <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />;
      case 'avanzado': return <FileText size={16} style={{ color: 'var(--danger)' }} />;
      default: return null;
    }
  };

  // --- LÓGICA DE EXPORTAR Y COPIAR (SIN CAMBIOS) ---
  const exportPrompts = () => {
    const promptsText = filteredPrompts.map(prompt =>
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
  };

  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToastNotification('✅ Prompt copiado al portapapeles');
  };

  // --- RENDERIZADO TRADUCIDO ---

  return (
    // Usamos .app-container como el contenedor principal de la página
    // Tu CSS .app-container ya maneja el max-width y padding.
    <div className="app-container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
      
      {/* Contenedor de Toast
        Tu CSS ya define #toast-container y .toast
        Aparecerá en la esquina inferior derecha.
      */}
      <div id="toast-container">
        {showToast && (
          <div className="toast">
            {toastMessage}
          </div>
        )}
      </div>

      {/* 1. Encabezado de la página */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--secondary)', fontWeight: 700, lineHeight: 1.2 }}>
          Generador de Prompts DIAN
        </h1>
        <p style={{ color: 'var(--text-medium)', fontSize: '1.1rem' }}>
          Un recurso exclusivo del E.book Contador 4.0
        </p>
      </div>

      {/* 2. Caja de Carga de Archivo */}
      {/* Usamos el estilo de tu #contador4-pro-console como wrapper */}
      <div id="contador4-pro-console" style={{ maxWidth: '800px', margin: '0 auto var(--space-xl)' }}>
        
        {/* Sección de Confirmación (aparece después de cargar el PDF) */}
        {pdfFile && (
          <div style={{ padding: 'var(--space-md)', background: 'var(--bg-light)', borderLeft: '5px solid var(--info)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
              <input
                type="checkbox"
                id="confirmPDF"
                checked={userConfirmed}
                onChange={(e) => setUserConfirmed(e.target.checked)}
                style={{ marginTop: '6px', width: '18px', height: '18px' }}
              />
              <label htmlFor="confirmPDF" style={{ flex: 1, margin: 0, fontSize: '0.95rem', color: 'var(--secondary)' }}>
                <strong style={{ display: 'block' }}>✅ Confirmo que estoy usando el PDF "Contador 4.0".</strong>
                <span style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>
                  Al marcar esta casilla, acepto generar los 30 prompts especializados DIAN.
                </span>
              </label>
            </div>
            {userConfirmed && (
              <button
                onClick={proceedWithAnalysis}
                className="btn-primary" // Clase de tu CSS
                style={{ width: '100%', marginTop: 'var(--space-md)', background: 'var(--primary)', color: 'white' }}
              >
                🚀 Generar Prompts Ahora
              </button>
            )}
          </div>
        )}

        {/* Área de Carga de Archivo */}
        <div style={{ border: '3px dashed var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', textAlign: 'center', background: 'var(--bg-white)', transition: 'all var(--transition-base)' }}>
          {!pdfFile ? (
            <>
              <Upload size={48} style={{ color: 'var(--text-lighter)', margin: '0 auto var(--space-md)' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--secondary)', fontSize: '1.3rem' }}>
                Subir PDF para Análisis
              </h3>
              <p style={{ color: 'var(--text-light)', marginBottom: 'var(--space-lg)' }}>
                Sube el PDF Contador 4.0 para desbloquear los prompts.
              </p>
              <label className="btn-primary" style={{ cursor: 'pointer' }}>
                <Upload size={18} />
                Seleccionar PDF
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)', color: 'var(--success)', fontWeight: '700', fontSize: '1.1rem' }}>
              <FileText size={24} />
              <span>{pdfFile.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Panel de Prompts (si ya se generaron) */}
      {prompts.length > 0 && userConfirmed && (
        <>
          {/* Controles de Filtro y Exportar */}
          {/* Usamos tu clase .controls */}
          <div className="controls" style={{ background: 'var(--bg-white)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            
            {/* Usamos un div wrapper para el select, similar a .search-wrap */}
            <div className="search-wrap" style={{ flex: '1 1 300px' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                // Reutilizamos el estilo de los inputs de tu CSS
                style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-medium)', background: 'var(--bg-white)', fontSize: '1rem' }}
              >
                {Object.entries(categoryNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
            
            {/* Usamos tu clase .actions-wrap */}
            <div className="actions-wrap">
              <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginRight: 'var(--space-sm)' }}>
                {filteredPrompts.length} prompts disponibles
              </span>
              <button
                onClick={exportPrompts}
                className="btn-export" // Clase de tu CSS
              >
                <Download size={16} />
                Exportar
              </button>
            </div>
          </div>
          
          {/* Lista de Prompts */}
          {/* Usamos tu clase .prompt-list */}
          <div className="prompt-list" style={{ marginTop: 'var(--space-lg)' }}>
            {filteredPrompts.map((prompt) => (
              // Usamos tu clase .prompt-card
              <div
                key={prompt.id}
                className="prompt-card"
                onClick={() => setSelectedPrompt(prompt)}
                style={{ cursor: 'pointer' }} // Hacemos que toda la tarjeta sea clickeable
              >
                <div className="prompt-header">
                  {/* Usamos tu clase .prompt-categoria */}
                  <span className="prompt-categoria">
                    {categoryNames[prompt.category]}
                  </span>
                </div>
                
                {/* Usamos tu clase .prompt-titulo */}
                <h3 className="prompt-titulo">{prompt.title}</h3>
                
                {/* Usamos .prompt-subcategoria para la info meta */}
                <div className="prompt-subcategoria" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                  <span style={getPriorityStyle(prompt.priority)}>
                    Prioridad: {prompt.priority}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text-medium)', textTransform: 'capitalize' }}>
                    {getComplexityIcon(prompt.complexity)} {prompt.complexity}
                  </span>
                </div>

                {/* Usamos .prompt-contenido con truncamiento */}
                <p 
                  className="prompt-contenido"
                  style={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3, // Limita a 3 líneas
                  }}
                >
                  {prompt.prompt}
                </p>

                {/* Usamos .prompt-actions */}
                <div className="prompt-actions">
                  <button
                    className="btn-action primary" // Clase de tu CSS
                    style={{ width: '100%' }}
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que se abra el modal al copiar
                      copyToClipboard(prompt.prompt);
                    }}
                  >
                    <Copy size={14} />
                    Copiar Prompt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 4. Estado Inicial (cuando no hay PDF) */}
      {prompts.length === 0 && !pdfFile && (
        // Usamos .tips-section y .tip-card para el contenido informativo
        <div className="tips-section" style={{ marginTop: 'var(--space-md)', borderTop: 'none' }}>
          <h2 style={{ fontSize: '1.8rem' }}>30 Prompts Especializados DIAN</h2>
          <div className="tips-grid" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="tip-card">
              <h3>Vencimientos Tributarios</h3>
              <p>Calendarios, fechas de renta, IVA bimestral y más.</p>
            </div>
            <div className="tip-card">
              <h3>Obligaciones Formales</h3>
              <p>RUT, facturación electrónica, Régimen SIMPLE y libros.</p>
            </div>
            <div className="tip-card">
              <h3>Procedimientos DIAN</h3>
              <p>Fiscalización, sanciones, devoluciones y recursos.</p>
            </div>
            <div className="tip-card">
              <h3>Casos y Herramientas</h3>
              <p>Declaraciones de empleados, independientes y herramientas digitales.</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Detalle */}
      {/* Usamos tus clases .modal-overlay y .modal */}
      {selectedPrompt && (
        <>
          <div 
            className={`modal-overlay ${selectedPrompt ? 'active' : ''}`} 
            onClick={() => setSelectedPrompt(null)}
          ></div>
          <div className={`modal ${selectedPrompt ? 'active' : ''}`}>
            <div className="modal-content">
              {/* Usamos tu clase .close-btn */}
              <button onClick={() => setSelectedPrompt(null)} className="close-btn">
                <X size={24} />
              </button>
              
              {/* Usamos tu H2 de modal */}
              <h2>{selectedPrompt.title}</h2>
              
              {/* Usamos tu estilo de label y textarea de modal */}
              <label>PROMPT COMPLETO:</label>
              <textarea
                readOnly
                value={selectedPrompt.prompt}
                style={{ minHeight: '150px' }}
                onClick={(e) => e.target.select()}
              />

              <label>DETALLES:</label>
              <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', background: 'var(--bg-light)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)' }}>CATEGORÍA</p>
                  <p style={{ margin: 0, fontWeight: '700', color: 'var(--secondary)' }}>{categoryNames[selectedPrompt.category]}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)' }}>PRIORIDAD</p>
                  <p style={{ margin: 0, ...getPriorityStyle(selectedPrompt.priority), textTransform: 'capitalize' }}>{selectedPrompt.priority}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)' }}>COMPLEJIDAD</p>
                  <p style={{ margin: 0, fontWeight: '700', color: 'var(--secondary)', textTransform: 'capitalize' }}>{selectedPrompt.complexity}</p>
                </div>
              </div>

              {/* Usamos tu .modal-actions y clases .btn- */}
              <div className="modal-actions">
                <button 
                  onClick={() => setSelectedPrompt(null)} 
                  className="btn-secondary" // Clase de tu CSS
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.open(`https://chat.openai.com/?q=${encodeURIComponent(selectedPrompt.prompt)}`, '_blank')}
                  className="btn-primary" // Clase de tu CSS
                  style={{ background: 'var(--success)', borderColor: 'var(--success)' }} // Hacemos este botón verde
                >
                  🤖 Usar en ChatGPT
                </button>
                <button 
                  onClick={() => copyToClipboard(selectedPrompt.prompt)}
                  className="btn-primary" // Clase de tu CSS
                >
                  <Copy size={16} /> Copiar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 6. Footer de la Página */}
      {/* Usamos tu clase .app-footer */}
      <footer className="app-footer" style={{ marginTop: 'var(--space-2xl)' }}>
        <p>
          Generador de Prompts DIAN es un producto desarrollado por{' '}
          <a href="https://jairoamaya.co" target="_blank" rel="noopener noreferrer">
            Jairo Amaya - Full Stack Marketer
          </a>
        </p>
        <p>
          Anexo del E.book Contador 4.0 - Todos los derechos reservados - 2025
        </p>
      </footer>
    </div>
  );
};

export default PDFAnalyzerDIAN;
