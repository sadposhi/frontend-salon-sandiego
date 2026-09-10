import { useState, useEffect } from 'react';

function App() {
  const [vistaActual, setVistaActual] = useState('home');
  const [modoOscuro, setModoOscuro] = useState(false);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);

  // Estados para los datos que vienen del backend
  const [cargando, setCargando] = useState(true);
  const [categoriasMaterias, setCategoriasMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);

  // URL DE TU BACKEND EN RENDER (Confirmado por tu captura de pantalla)
  const URL_BACKEND = "https://backend-salon-sandiego.onrender.com";

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

  // WhatsApp Específico (Con las materias del carrito)
  const procesarSolicitudEspecifica = function() {
    let mensaje = "¡Hola! Vengo de su página web y estoy interesado(a) en conocer los precios y disponibilidad de horarios para las siguientes materias:\n\n";
    for (let i = 0; i < materiasSeleccionadas.length; i++) {
      mensaje = mensaje + "✅ " + materiasSeleccionadas[i] + "\n";
    }
    mensaje = mensaje + "\n¡Quedo atento(a) a la información!";
    
    window.open("https://wa.me/584120298130?text=" + encodeURIComponent(mensaje), '_blank');
  };

  // WhatsApp General (Para el botón flotante)
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
    marcaPrimario: '#7B1E34', 
    marcaHover: '#5A1525',
    naranjaMarca: '#F7931E'
  };

  const estiloBotonNav = {
    background: 'none', border: 'none', color: colores.textoPrincipal, fontSize: '15px',
    cursor: 'pointer', fontWeight: '600', padding: '8px 12px', fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif'
  };

  // Pantalla de carga mientras responde Render
  if (cargando) {
    return (
      <div style={{ backgroundColor: colores.fondo, color: colores.textoPrincipal, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
        <h2>Conectando con la base de datos de El Salón...</h2>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colores.fondo, color: colores.textoPrincipal, minHeight: '100vh', transition: 'all 0.3s ease', fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif', paddingBottom: materiasSeleccionadas.length > 0 ? '80px' : '0', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* ENCABEZADO */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 40px', backgroundColor: colores.tarjeta, borderBottom: `2px solid ${colores.marcaPrimario}`, position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo.png" alt="Logo El Salón D' San Diego" style={{ height: '100px', borderRadius: '8px' }} />
        </div>
        <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button style={estiloBotonNav} onClick={function() { setVistaActual('home') }}>Inicio / Ubicación</button>
          <button style={estiloBotonNav} onClick={function() { setVistaActual('clases') }}>Materias</button>
          <button style={estiloBotonNav} onClick={function() { setVistaActual('conocenos') }}>Conócenos</button>
          <button onClick={cambiarTema} style={{ padding: '8px 16px', borderRadius: '20px', border: `1px solid ${colores.marcaPrimario}`, backgroundColor: modoOscuro ? colores.marcaPrimario : 'transparent', color: modoOscuro ? 'white' : colores.marcaPrimario, cursor: 'pointer', fontWeight: 'bold', marginLeft: '15px' }}>
            {modoOscuro ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
          </button>
        </nav>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', flexGrow: 1, width: '100%' }}>
        
        {vistaActual === 'home' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={{ textAlign: 'center', padding: '20px 0 40px 0' }}>
              <h1 style={{ fontSize: '3rem', color: colores.marcaPrimario, marginBottom: '15px', fontWeight: '900' }}>¡Muy cerca de la UJAP!</h1>
              <p style={{ fontSize: '1.2rem', color: colores.textoSecundario, maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                Asegura tu éxito universitario con nosotros. Clases especializadas con profesores de alto nivel para superar las materias más exigentes de tu carrera.
              </p>
            </div>
            <div style={{ backgroundColor: colores.tarjeta, border: `1px solid ${colores.borde}`, borderRadius: '15px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px', backgroundColor: colores.marcaPrimario, color: 'white', textAlign: 'center' }}>
                <h2 style={{ margin: 0 }}>📍 C.C. Plaza Esmeralda - Local 20</h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Parada Caminito, San Diego</p>
              </div>
              <div style={{ width: '100%', height: '400px' }}>
                {/* ENLACE DE MAPA CORREGIDO Y SEGURO (HTTPS) */}
                <iframe 
                  src="https://maps.google.com/maps?q=Centro%20Comercial%20Plaza%20Esmeralda%20San%20Diego&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
            </div>
          </div>
        )}

        {/* VISTA DE MATERIAS */}
        {vistaActual === 'clases' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h2 style={{ fontSize: '2.5rem', color: colores.marcaPrimario, textAlign: 'center', marginBottom: '10px' }}>Selecciona tus Materias</h2>
            <p style={{ textAlign: 'center', color: colores.textoSecundario, marginBottom: '40px' }}>Haz clic en las materias que necesitas cursar para armar tu solicitud.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
              {categoriasMaterias.map(function(categoria) {
                return (
                  <div key={categoria.id} style={{ backgroundColor: colores.tarjeta, border: `1px solid ${colores.borde}`, borderRadius: '12px', padding: '25px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ borderBottom: `2px solid ${colores.marcaPrimario}`, paddingBottom: '10px', marginTop: 0 }}>{categoria.titulo}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                      {categoria.materias.map(function(materia, index) {
                        const estaSeleccionada = materiasSeleccionadas.includes(materia);
                        return (
                          <div 
                            key={index} onClick={function() { manejarSeleccion(materia) }}
                            style={{ 
                              padding: '12px 15px', border: `2px solid ${estaSeleccionada ? colores.naranjaMarca : colores.borde}`, 
                              borderRadius: '8px', backgroundColor: estaSeleccionada ? (modoOscuro ? '#3a2510' : '#fff3e0') : 'transparent',
                              color: estaSeleccionada ? colores.naranjaMarca : colores.textoSecundario, 
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'all 0.2s', fontWeight: estaSeleccionada ? 'bold' : 'normal'
                            }}>
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

        {/* VISTA DE PROFESORES */}
        {vistaActual === 'conocenos' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h2 style={{ fontSize: '2.5rem', color: colores.marcaPrimario, textAlign: 'center', marginBottom: '40px' }}>Nuestro Equipo Docente</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {profesores.map(function(profesor) {
                return (
                  <div key={profesor.id} style={{ backgroundColor: colores.tarjeta, border: `1px left solid ${colores.marcaPrimario}`, borderLeftWidth: '5px', borderRadius: '8px', padding: '30px', boxShadow: '0 6px 12px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', color: colores.textoPrincipal }}>{profesor.nombre}</h3>
                    <p style={{ display: 'inline-block', backgroundColor: colores.marcaPrimario, color: 'white', padding: '5px 12px', borderRadius: '15px', fontSize: '0.9rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>{profesor.especialidad}</p>
                    <p style={{ margin: 0, color: colores.textoSecundario, fontSize: '1.1rem', lineHeight: '1.6' }}>{profesor.exp}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* PIE DE PÁGINA */}
      <footer style={{ backgroundColor: colores.tarjeta, borderTop: `1px solid ${colores.borde}`, padding: '40px 20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: colores.marcaPrimario, marginBottom: '30px' }}>¡Inscríbete hoy mismo!</h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <a href="https://wa.me/584120298130" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#25D366', color: 'white', padding: '15px 30px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>💬 0412-029.8130</a>
            <a href="tel:+584120298130" style={{ textDecoration: 'none', backgroundColor: colores.marcaPrimario, color: 'white', padding: '15px 30px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>📞 Llamar</a>
            <a href="https://instagram.com/el.salon.de.sandiego" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white', padding: '15px 30px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>📸 @el.salon.de.sandiego</a>
          </div>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE GENERAL DE WHATSAPP */}
      <div 
        onClick={procesarSolicitudGeneral}
        style={{ 
          position: 'fixed', right: '20px', bottom: materiasSeleccionadas.length > 0 ? '90px' : '20px', 
          backgroundColor: '#25D366', color: 'white', width: '60px', height: '60px', borderRadius: '50%', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', 
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 1500, transition: 'bottom 0.3s ease'
        }}
        title="Contáctanos por WhatsApp"
      >
        💬
      </div>

      {/* BARRA FLOTANTE DE CHECKOUT */}
      {materiasSeleccionadas.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: colores.marcaPrimario, padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -4px 15px rgba(0,0,0,0.2)', zIndex: 2000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h3 style={{ margin: 0, color: 'white' }}>Tienes {materiasSeleccionadas.length} materia(s)</h3>
            <button 
              onClick={limpiarSeleccion} 
              style={{ backgroundColor: 'transparent', color: '#ffcccc', border: '1px solid #ffcccc', padding: '6px 12px', borderRadius: '15px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Borrar selección
            </button>
          </div>
          <button onClick={procesarSolicitudEspecifica} style={{ backgroundColor: '#25D366', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '25px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
            Consultar Precios en WhatsApp 💬
          </button>
        </div>
      )}
    </div>
  );
}

export default App;