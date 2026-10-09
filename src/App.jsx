import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

// ==========================================
// COMPONENTE DE ANIMACIÓN: BlurText
// ==========================================
const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);
  const keyframes = {};
  keys.forEach(k => {
    keyframes[k] = [from[k], ...steps.map(s => s[k])];
  });
  return keyframes;
};

const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = t => t,
  onAnimationComplete,
  stepDuration = 0.35
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top' ? { filter: 'blur(10px)', opacity: 0, y: -50 } : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 }
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)));

  return (
    <p ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
        const spanTransition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000
        };
        spanTransition.ease = easing;

        return (
          <motion.span
            className="inline-block will-change-[transform,filter,opacity]"
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
          >
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </p>
  );
};

// ==========================================
// APLICACIÓN PRINCIPAL
// ==========================================
function App() {
  const [vistaActual, setVistaActual] = useState('home');
  const [modoOscuro, setModoOscuro] = useState(false);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [categoriasMaterias, setCategoriasMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);

  // Estado para verificar la conexión a internet
  const [estaOnline, setEstaOnline] = useState(navigator.onLine);

  // URL DE TU BACKEND EN RENDER
  const URL_BACKEND = "https://backend-salon-sandiego.onrender.com";

  // Efecto para escuchar si el internet se cae o regresa
  useEffect(() => {
    const manejarOnline = () => setEstaOnline(true);
    const manejarOffline = () => setEstaOnline(false);

    window.addEventListener('online', manejarOnline);
    window.addEventListener('offline', manejarOffline);

    return () => {
      window.removeEventListener('online', manejarOnline);
      window.removeEventListener('offline', manejarOffline);
    };
  }, []);

  useEffect(function() {
    fetch(URL_BACKEND + '/api/materias')
      .then(function(respuesta) { return respuesta.json(); })
      .then(function(datosMaterias) {
        setCategoriasMaterias(datosMaterias);
        return fetch(URL_BACKEND + '/api/profesores');
      })
      .then(function(respuestaProf) { return respuestaProf.json(); })
      .then(function(datosProfesores) {
        setProfesores(datosProfesores);
        setCargando(false);
      })
      .catch(function(error) {
        console.error("Error conectando al backend:", error);
        setCargando(false);
      });
  }, []);

  const cambiarTema = function() {
    setModoOscuro(!modoOscuro);
  };

  const manejarSeleccion = function(materia) {
    if (materiasSeleccionadas.includes(materia)) {
      const nuevoArreglo = materiasSeleccionadas.filter(function(item) {
        return item !== materia;
      });
      setMateriasSeleccionadas(nuevoArreglo);
    } else {
      setMateriasSeleccionadas([...materiasSeleccionadas, materia]);
    }
  };

  const limpiarSeleccion = function() {
    setMateriasSeleccionadas([]); 
  };

  const procesarSolicitudEspecifica = function() {
    let mensaje = "¡Hola! Vengo de su página web y estoy interesado(a) en conocer los precios y disponibilidad de horarios para las siguientes materias:\n\n";
    for (let i = 0; i < materiasSeleccionadas.length; i++) {
      mensaje = mensaje + "✅ " + materiasSeleccionadas[i] + "\n";
    }
    mensaje = mensaje + "\n¡Quedo atento(a) a la información!";
    window.open("https://wa.me/584120298130?text=" + encodeURIComponent(mensaje), '_blank');
  };

  const procesarSolicitudGeneral = function() {
    let mensaje = "¡Hola! Vengo de su página web. Me gustaría recibir información general sobre las clases, materias disponibles y sus horarios. ¡Quedo atento(a)!";
    window.open("https://wa.me/584120298130?text=" + encodeURIComponent(mensaje), '_blank');
  };

  const colores = {
    fondo: modoOscuro ? '#121212' : '#F4F4F9',
    textoPrincipal: modoOscuro ? '#F0F0F0' : '#1A1A1A',
    textoSecundario: modoOscuro ? '#BBBBBB' : '#4A4A4A',
    tarjeta: modoOscuro ? '#1E1E1E' : '#FFFFFF',
    borde: modoOscuro ? '#333333' : '#E0E0E0',
    marcaPrimario: '#7B1E34', // Vinotinto característico
    marcaHover: '#5A1525',
    naranjaMarca: '#F7931E'
  };

  const estiloBotonNav = {
    background: 'none',
    border: 'none',
    color: colores.textoPrincipal,
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    padding: '8px 14px',
    fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif'
  };

  // Íconos SVG
  const IconoWhatsapp = () => (
    <svg xmlns="http://www.svg.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
    </svg>
  );

  const IconoInstagram = () => (
    <svg xmlns="http://www.svg.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
    </svg>
  );

  const IconoSinConexion = () => (
    <svg xmlns="http://www.svg.org/2000/svg" width="60" height="60" fill={colores.marcaPrimario} viewBox="0 0 16 16">
      <path d="M10.706 3.294A12.545 12.545 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c.63 0 1.249.05 1.852.148l.854-.854zM8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065 8.448 8.448 0 0 1 3.51-1.27L8 6zm2.596 1.404.785-.785c.63.24 1.227.545 1.785.907a.482.482 0 0 1 .063.745.525.525 0 0 1-.652.065 8.462 8.462 0 0 0-1.98-.932zM8 10l.933-.933a4.488 4.488 0 0 1 1.527.705.525.525 0 0 1-.063.745.48.48 0 0 1-.652.065 3.484 3.484 0 0 0-1.745-.582zM1.5 14.5l13-13 .707.707-13 13-.707-.707z"/>
    </svg>
  );

  const estilosCSS = `
    html, body { margin: 0; padding: 0; width: 100%; min-height: 100vh; overflow-x: hidden; background-color: ${colores.fondo}; }
    #root { max-width: 100% !important; width: 100%; margin: 0; padding: 0; text-align: left; }
    * { box-sizing: border-box; }
    .btn-nav { position: relative; display: inline-block; transition: color 0.3s ease; }
    .btn-nav::after { content: ''; position: absolute; bottom: 0px; left: 0; width: 100%; height: 3px; background-color: ${colores.marcaPrimario}; border-radius: 2px; transform: scaleX(0); transform-origin: center; transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1); }
    .btn-nav.activo::after { transform: scaleX(1); }
    .grid-materias { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
    .mapa-contenedor { width: 100%; height: 350px; background-color: #ffffff !important; }
    .mapa-contenedor iframe { width: 100%; height: 100%; border: 0; background-color: transparent; }
    @media (max-width: 768px) {
      .header-nav { flex-direction: column !important; padding: 15px !important; gap: 15px !important; text-align: center; }
      .botones-nav { flex-wrap: wrap !important; justify-content: center !important; }
      .titulo-hero { font-size: 2rem !important; }
      .grid-materias { grid-template-columns: 1fr !important; }
      .barra-checkout { flex-direction: column !important; padding: 15px !important; gap: 10px; text-align: center; }
      .botones-footer { flex-direction: column !important; width: 100%; }
      .botones-footer a { width: 100%; justify-content: center; }
    }
  `;

  // ==========================================
  // PANTALLA 1: SIN CONEXIÓN A INTERNET
  // ==========================================
  if (!estaOnline) {
    return (
      <div style={{ backgroundColor: colores.fondo, color: colores.textoPrincipal, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif', padding: '20px', textAlign: 'center' }}>
        <style>{estilosCSS}</style>
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <IconoSinConexion />
          <h1 style={{ color: colores.marcaPrimario, marginTop: '20px', fontSize: '2rem' }}>Sin conexión a Internet</h1>
          <p style={{ color: colores.textoSecundario, fontSize: '1.2rem', maxWidth: '450px', lineHeight: '1.6' }}>
            Por favor, revisa tu conexión Wi-Fi o datos móviles. Te estamos esperando para ayudarte a cursar tus materias con éxito.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PANTALLA 2: DE CARGA CON ANIMACIÓN BLURTEXT
  // ==========================================
  if (cargando) {
    return (
      <div style={{ backgroundColor: colores.fondo, color: colores.textoPrincipal, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
        <style>{estilosCSS}</style> 
        <img src="/logo.png" alt="Logo El Salón D' San Diego" style={{ height: '120px', marginBottom: '30px', borderRadius: '15px', opacity: 0.9 }} />
        <BlurText
          text="Conectando con la base de datos de El Salón..."
          delay={150}
          animateBy="words"
          direction="top"
          className="texto-carga-animado"
        />
        <style>
          {`
            .texto-carga-animado { font-size: 1.5rem; font-weight: 600; color: ${colores.marcaPrimario}; text-align: center; max-width: 80%; }
          `}
        </style>
      </div>
    );
  }

  // ==========================================
  // PANTALLA 3: RENDERIZADO PRINCIPAL
  // ==========================================
  return (
    <div style={{ backgroundColor: colores.fondo, color: colores.textoPrincipal, minHeight: '100vh', transition: 'all 0.3s ease', fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif', paddingBottom: materiasSeleccionadas.length > 0 ? '130px' : '0', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <style>{estilosCSS}</style>

      {/* ENCABEZADO */}
      <header className="header-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 40px', backgroundColor: colores.tarjeta, borderBottom: `2px solid ${colores.marcaPrimario}`, position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo.png" alt="Logo El Salón D' San Diego" style={{ height: '80px', borderRadius: '8px' }} />
        </div>
        
        <nav className="botones-nav" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button className={`btn-nav ${vistaActual === 'home' ? 'activo' : ''}`} style={estiloBotonNav} onClick={function() { setVistaActual('home') }}>Inicio</button>
          <button className={`btn-nav ${vistaActual === 'clases' ? 'activo' : ''}`} style={estiloBotonNav} onClick={function() { setVistaActual('clases') }}>Materias</button>
          <button className={`btn-nav ${vistaActual === 'conocenos' ? 'activo' : ''}`} style={estiloBotonNav} onClick={function() { setVistaActual('conocenos') }}>Conócenos</button>
          <button onClick={cambiarTema} style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${colores.marcaPrimario}`, backgroundColor: modoOscuro ? colores.marcaPrimario : 'transparent', color: modoOscuro ? 'white' : colores.marcaPrimario, cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>{modoOscuro ? '☀️ Claro' : '🌙 Oscuro'}</button>
        </nav>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main style={{ padding: '30px 15px', maxWidth: '1100px', margin: '0 auto', flexGrow: 1, width: '100%' }}>
        {vistaActual === 'home' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={{ textAlign: 'center', padding: '10px 0 30px 0' }}>
              <h1 className="titulo-hero" style={{ fontSize: '3rem', color: colores.marcaPrimario, marginBottom: '20px', fontWeight: '900' }}>¡Muy cerca de la UJAP!</h1>
              <p style={{ fontSize: '1.1rem', color: colores.textoSecundario, maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                Asegura tu éxito universitario con nosotros. Clases especializadas con profesores de alto nivel para superar las materias más exigentes de tu carrera.
              </p>
            </div>
            <div style={{ backgroundColor: colores.tarjeta, border: `1px solid ${colores.borde}`, borderRadius: '15px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '15px', backgroundColor: colores.marcaPrimario, color: 'white', textAlign: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>📍 C.C. Plaza Esmeralda - Local 20</h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>Parada Caminito, San Diego</p>
              </div>
              <div className="mapa-contenedor">
                <iframe src="https://maps.google.com/maps?q=Centro%20Comercial%20Plaza%20Esmeralda%20San%20Diego&t=&z=16&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
            </div>
          </div>
        )}

        {vistaActual === 'clases' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h2 className="titulo-hero" style={{ fontSize: '2.5rem', color: colores.marcaPrimario, textAlign: 'center', marginBottom: '10px' }}>Selecciona tus Materias</h2>
            <p style={{ textAlign: 'center', color: colores.textoSecundario, marginBottom: '30px', fontSize: '1rem' }}>Haz clic en las materias que necesitas cursar para armar tu solicitud.</p>
            <div className="grid-materias">
              {categoriasMaterias.map(function(categoria) {
                return (
                  <div key={categoria.id} style={{ backgroundColor: colores.tarjeta, border: `1px solid ${colores.borde}`, borderRadius: '12px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ borderBottom: `2px solid ${colores.marcaPrimario}`, paddingBottom: '10px', marginTop: 0 }}>{categoria.titulo}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                      {categoria.materias.map(function(materia, index) {
                        const estaSeleccionada = materiasSeleccionadas.includes(materia);
                        return (
                          <div key={index} onClick={function() { manejarSeleccion(materia) }}
                            style={{ padding: '12px 15px', border: `2px solid ${estaSeleccionada ? colores.naranjaMarca : colores.borde}`, borderRadius: '8px', backgroundColor: estaSeleccionada ? (modoOscuro ? '#3a2510' : '#fff3e0') : 'transparent', color: estaSeleccionada ? colores.naranjaMarca : colores.textoSecundario, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', fontWeight: estaSeleccionada ? 'bold' : 'normal' }}>
                            <span>{materia}</span>
                            <span>{estaSeleccionada ? '✓' : '+'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CORRECCIÓN DE CENTRADO EN VISTA "CONÓCENOS" */}
        {vistaActual === 'conocenos' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h2 className="titulo-hero" style={{ fontSize: '2.5rem', color: colores.marcaPrimario, textAlign: 'center', marginBottom: '30px' }}>Nuestro Equipo Docente</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              {profesores.map(function(profesor) {
                return (
                  <div key={profesor.id} style={{ width: '100%', maxWidth: '800px', backgroundColor: colores.tarjeta, borderLeft: `5px solid ${colores.marcaPrimario}`, borderRadius: '8px', padding: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ fontSize: '1.5rem', margin: '0 0 10px 0', color: colores.textoPrincipal }}>{profesor.nombre}</h3>
                    <p style={{ display: 'inline-block', backgroundColor: colores.marcaPrimario, color: 'white', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>{profesor.especialidad}</p>
                    <p style={{ margin: 0, color: colores.textoSecundario, fontSize: '1rem', lineHeight: '1.5' }}>{profesor.exp}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* PIE DE PÁGINA */}
      <footer style={{ backgroundColor: colores.tarjeta, borderTop: `1px solid ${colores.borde}`, padding: '30px 15px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: colores.marcaPrimario, marginBottom: '20px', fontSize: '1.8rem' }}>¡Inscríbete hoy mismo!</h2>
          <div className="botones-footer" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <a href="https://wa.me/584120298130" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#25D366', color: 'white', padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <IconoWhatsapp /> 0412-029.8130
            </a>
            <a href="tel:+584120298130" style={{ textDecoration: 'none', backgroundColor: colores.marcaPrimario, color: 'white', padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>📞 Llamar</a>
            <a href="https://instagram.com/el.salon.de.sandiego" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white', padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <IconoInstagram /> @el.salon.de.sandiego
            </a>
          </div>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE GENERAL DE WHATSAPP */}
      <div onClick={procesarSolicitudGeneral} style={{ position: 'fixed', right: '20px', bottom: materiasSeleccionadas.length > 0 ? '140px' : '20px', backgroundColor: '#25D366', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 1500, transition: 'bottom 0.3s ease' }}>
        <IconoWhatsapp />
      </div>

      {/* BARRA FLOTANTE DE CHECKOUT */}
      {materiasSeleccionadas.length > 0 && (
        <div className="barra-checkout" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: colores.marcaPrimario, padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -4px 15px rgba(0,0,0,0.2)', zIndex: 2000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>Tienes {materiasSeleccionadas.length} materia(s)</h3>
            <button onClick={limpiarSeleccion} style={{ backgroundColor: 'transparent', color: '#ffcccc', border: '1px solid #ffcccc', padding: '6px 12px', borderRadius: '15px', fontSize: '0.85rem', cursor: 'pointer' }}>Borrar</button>
          </div>
          <button onClick={procesarSolicitudEspecifica} style={{ backgroundColor: '#25D366', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '25px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%' }}>
            <IconoWhatsapp /> Consultar Precios
          </button>
        </div>
      )}
    </div>
  );
}

export default App;