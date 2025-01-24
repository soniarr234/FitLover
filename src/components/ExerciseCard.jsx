import React, { useState, useEffect, useRef } from 'react';
import '../assets/styles/ExerciseCard.css';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

function ExerciseCard({ exercise, routine, addToRoutine, removeFromRoutine }) {
  const [showPopup, setShowPopup] = useState(false); // Estado para mostrar el popup
  const [description, setDescription] = useState(
    () => localStorage.getItem(`exercise-desc-${exercise.id}`) || exercise.description
  ); // Cargar descripción desde localStorage
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const popupRef = useRef(null); // Referencia para el popup
  const addButtonRef = useRef(null); // Referencia para el botón de Añadir a la rutina
  const textareaRef = useRef(null); // Referencia para el textarea
  const [confirmDelete, setConfirmDelete] = useState(null); // Cambié a `null` para indicar ningún día seleccionado

  // Verificar en qué días está añadido este ejercicio
  const daysInRoutine = daysOfWeek.filter(day =>
    routine[day].some(ex => ex.id === exercise.id)
  );

  // Guardar la descripción en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem(`exercise-desc-${exercise.id}`, description);
  }, [description]);

  // Ajustar altura del textarea dinámicamente
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Restablecer la altura
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Ajustar según el contenido
    }
  }, [description]);

  // Cerrar el popup cuando se hace clic fuera de él o sobre el botón de Añadir a rutina
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        popupRef.current && !popupRef.current.contains(event.target) &&
        addButtonRef.current && !addButtonRef.current.contains(event.target)
      ) {
        setShowPopup(false); // Cerrar el popup si se hace clic fuera de él
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Limpiar el evento al desmontar
    };
  }, []);

  // Función para abrir el popup de confirmación de eliminación
  const handleOpenConfirmDelete = (day) => {
    setConfirmDelete(day); // Establecer el día a eliminar
  };

  // Función para manejar la eliminación del ejercicio
  const handleDelete = () => {
    if (confirmDelete) {
      removeFromRoutine(confirmDelete, exercise.id); // Eliminar del día seleccionado
    }
    setConfirmDelete(null); // Cerrar el popup
  };

  return (
    <div className="exercise-card-container">
      <div className="exercise-card">
        <h2 className="exercise-title">{exercise.name}</h2>
        <p className="exercise-muscle">{exercise.muscle}</p>

        {/* Mostrar imagen o video según la disponibilidad */}
        {exercise.video ? (
          <video className="exercise-video" controls>
            <source src={exercise.video} type="video/mp4" />
            Tu navegador no soporta el formato de video.
          </video>
        ) : (
          <img className="exercise-image" src={exercise.image} alt={exercise.name} />
        )}

        {/* Input para editar la descripción */}
        <textarea
          className="exercise-description-input"
          ref={textareaRef} // Asociar la referencia al textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Añade una descripción..."
          style={{ overflow: 'hidden', resize: 'none' }} // Estilo para ocultar el scroll
        />

        <div className="exercise-actions">
          {/* Botón para abrir el popup de añadir */}
          <button
            className="add-button"
            ref={addButtonRef}
            onClick={() => {
              setShowPopup(!showPopup); // Alternar el estado del popup
            }}
          >
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="#313538" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5 11h-4v4h-2v-4H7v-2h4V7h2v4h4z" /></svg>
            </span>
            <span className="text">Añadir</span>
          </button>

          {/* Mostrar botones de eliminar por cada día */}
          {daysInRoutine.map(day => (
            <button
              key={day}
              className="remove-button"
              onClick={() => handleOpenConfirmDelete(day)} // Solo abrir el popup de confirmación
            >
              Eliminar del {day}
            </button>
          ))}
        </div>
      </div>

      {/* Popup de confirmación de eliminación */}
      <Dialog
        open={Boolean(confirmDelete)} // Si hay un día en el que el ejercicio está añadido, abre el popup
        onClose={() => setConfirmDelete(null)} // Cerrar el popup
      >
        <DialogTitle>Eliminar</DialogTitle>
        <DialogContent>
          <p>¿Seguro que deseas eliminar {exercise.name} de la rutina de {confirmDelete}?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleDelete} // Eliminar del día seleccionado si se confirma
            sx={{ color: 'orange' }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Popup para elegir el día */}
      {showPopup && (
        <div
          className={`popup ${showPopup ? 'popup-visible' : ''}`}
          ref={popupRef}
        >
          <div className="popup-content">
            <h4>Añadir {exercise.name} al:</h4>
            {daysOfWeek.map(day => (
              <button
                key={day}
                className={`day-button ${daysInRoutine.includes(day) ? 'active' : ''}`}
                onClick={() => {
                  addToRoutine(day, exercise);
                  setShowPopup(false); // Cerrar el popup después de añadir
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseCard;
