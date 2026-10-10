import React from 'react';
import { motion } from 'framer-motion';

const LatticeLoader = ({
  status = 'working',
  label = 'Cargando...',
  color = '#7B1E34',
  grid = 3,
  cellSize = 10,
  gap = 4,
}) => {
  // Creamos la matriz (grid) de puntos basada en el número que le pasaste
  const totalDots = grid * grid;
  const dots = Array.from({ length: totalDots });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      
      {/* Contenedor de la animación */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${grid}, 1fr)`,
          gap: `${gap}px`
        }}
      >
        {dots.map((_, i) => (
          <motion.div
            key={i}
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              backgroundColor: color,
              borderRadius: '50%'
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.1, /* Crea el efecto de onda u órbita */
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Texto dinámico que recibe el "label" desde App.jsx */}
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
          color: color, 
          fontWeight: '600', 
          fontSize: '1.2rem',
          letterSpacing: '1px'
        }}
      >
        {status === 'working' ? label : 'Completado'}
      </motion.span>

    </div>
  );
};

export default LatticeLoader;