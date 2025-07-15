class Notes {
  notesContainer;
  btnAdd;
  noteId;
  colourSet;
  categories;

  constructor() {
    this.noteId = 0;
    this.colourSet = [
      { label: "pale", value: "#FEFEFF" },
      { label: "blue", value: "#eef6fb" },
      { label: "beige", value: "#FED99B" },
      { label: "red", value: "#fbd5d0" },
      { label: "green", value: "#b4eeb4" },
      { label: "blue", value: "#add8e6" },
      { label: "yellow", value: "#ffeb99" }



    ];
    this.categories = ["Trabajo", "Personal", "Importante", "Urgente"];

    this.notesContainer = document.querySelector("#notes");
    this.btnAdd = document.querySelector("#btnAdd");
    this.btnAdd.addEventListener("click", this.addNote.bind(this), false);
    
    // 🔹 Inicializar el botón para agregar imágenes
    this.btnAddImage = document.getElementById("btnAddImage");
    if (this.btnAddImage) {
      this.btnAddImage.addEventListener("click", this.addImage.bind(this));
    }
    // Inicializar el modo oscuro
    this.initDarkMode();

    // Cargar notas guardadas
    this.loadNotes();

    // Agregar filtro de categorías
    document.getElementById("filterCategory").addEventListener("change", this.filterNotes.bind(this));
  }

  getTimeStamp() {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let min = date.getMinutes().toString().padStart(2, "0");
    let sec = date.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
  }

  updateNoteColor(event) {
    let selectedElement = event.target;
    let newColor = selectedElement.getAttribute("data-color");
    let note = selectedElement.closest(".note__container");
    note.style.backgroundColor = newColor;
  }

  deleteNote(event) {
    let note = event.target.closest(".note__container");
    let noteId = note.dataset.id;
    
    // Eliminar del localStorage
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes = notes.filter(n => n.id !== noteId);
    localStorage.setItem("notes", JSON.stringify(notes));

    // Eliminar del DOM
    note.remove();
  }




  toggleSecretNote(event) {
    let note = event.target.closest(".note__container");
    let noteId = note.dataset.id;
    let contentDiv = note.querySelector(".note__content");

    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let noteData = notes.find(n => n.id === noteId);

    if (!noteData) return;

    if (noteData.secret) {
      let enteredPassword = prompt("🔓 Introduce la contraseña para desbloquear:");
      if (enteredPassword === noteData.password) {
        noteData.secret = false;
        contentDiv.innerHTML = noteData.content;
        contentDiv.setAttribute("contenteditable", "true");
      } else {
        alert("❌ Contraseña incorrecta.");
      }
    } else {
      let password = prompt("🔒 Introduce una contraseña para bloquear esta nota:");
      if (password) {
        noteData.secret = true;
        noteData.password = password;
        noteData.content = contentDiv.innerHTML;
        contentDiv.innerHTML = "🔒 Nota bloqueada";
        contentDiv.setAttribute("contenteditable", "false");
      }
    }

    localStorage.setItem("notes", JSON.stringify(notes));
  }

togglePin(id) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let note = notes.find(n => n.id === id);

    if (note) {
        note.pinned = !note.pinned; // Alternar el estado de fijado
        localStorage.setItem("notes", JSON.stringify(notes));

        // Buscar la nota en el DOM
        let noteElement = document.querySelector(`.note__container[data-id="${id}"]`);
        if (noteElement) {
            let pinButton = noteElement.querySelector(".note__pin");
            pinButton.innerHTML = note.pinned ? "📌" : "📍"; // Cambiar icono según el estado

            // Mover la nota al principio si está fijada
            if (note.pinned) {
                this.notesContainer.prepend(noteElement);
            } else {
                this.notesContainer.appendChild(noteElement);
            }
        }
    }
}
makeNoteDraggable(note) {
    let isDragging = false;
    let offsetX, offsetY;

    note.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "SELECT" || e.target.classList.contains("note__delete") || e.target.classList.contains("note__lock") || e.target.classList.contains("note__pin")) return; 
      
      isDragging = true;
      offsetX = e.clientX - note.getBoundingClientRect().left;
      offsetY = e.clientY - note.getBoundingClientRect().top;

      document.addEventListener("mousemove", moveNote);
      document.addEventListener("mouseup", () => {
        isDragging = false;
        document.removeEventListener("mousemove", moveNote);

        // Guardar la posición en localStorage
        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        let noteData = notes.find(n => n.id === note.dataset.id);
        if (noteData) {
          noteData.position = { x: note.style.left, y: note.style.top };
          localStorage.setItem("notes", JSON.stringify(notes));
        }
      });
    });

    function moveNote(e) {
      if (isDragging) {
        note.style.position = "absolute";
        note.style.left = `${e.clientX - offsetX}px`;
        note.style.top = `${e.clientY - offsetY}px`;
      }
    }
}

createNote(id, content = "", category = "Trabajo", color = "#FEFEFF", secret = false, password = "", pinned = false) {
    let container = document.createElement("div");
    container.dataset.id = id;
    container.classList.add("note__container");
    container.style.backgroundColor = color;

    let header = document.createElement("header");
    header.classList.add("note__header");

    // 🔹 Contenedor de la fecha y la lista de categorías
    let titleContainer = document.createElement("div");
    titleContainer.classList.add("note__title-container");

    let title = document.createElement("div");
    title.classList.add("note__title");
    title.innerHTML = `<i>${this.getTimeStamp()}</i>`;

    // 🔹 Botón de fijar/desfijar nota 📌
    let pinButton = document.createElement("a");
    pinButton.classList.add("note__pin");
    pinButton.innerHTML = pinned ? "📌" : "📍";
    pinButton.addEventListener("click", () => this.togglePin(id));

    let lockButton = document.createElement("a");
    lockButton.classList.add("note__lock");
    lockButton.innerHTML = "🔐";
    lockButton.addEventListener("click", this.toggleSecretNote.bind(this));

    let deleteButton = document.createElement("a");
    deleteButton.classList.add("note__delete");
    deleteButton.innerHTML = "🗑️";
    deleteButton.addEventListener("click", this.deleteNote.bind(this));

    let body = document.createElement("div");
    body.classList.add("note__body");

    let contentDiv = document.createElement("div");
    contentDiv.classList.add("note__content");
    contentDiv.setAttribute("contenteditable", "true");

    if (secret) {
        contentDiv.innerHTML = "🔒 Nota bloqueada";
        contentDiv.setAttribute("contenteditable", "false");
    } else {
        contentDiv.innerHTML = content;
    }

    let footer = document.createElement("footer");
    footer.classList.add("note__footer");

    let categorySelect = document.createElement("select");
    categorySelect.classList.add("note__category-select");

    this.categories.forEach(cat => {
        let option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        if (cat === category) option.selected = true;
        categorySelect.appendChild(option);
    });

    categorySelect.addEventListener("change", () => {
        this.updateNoteCategory(id, categorySelect.value);
    });

    // 🔹 Agregar elementos al título
    titleContainer.appendChild(pinButton);
    titleContainer.appendChild(title);
    titleContainer.appendChild(categorySelect);

    header.appendChild(titleContainer);
    header.appendChild(lockButton);
    header.appendChild(deleteButton);
    body.appendChild(contentDiv);
    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);

    return container;
}


addImage() {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.addEventListener("change", (event) => {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = (e) => {
                this.createFloatingImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    input.click();
}

createFloatingImage(imageSrc) {
    let imgContainer = document.createElement("div");
    imgContainer.classList.add("floating-image-container");
    imgContainer.style.position = "absolute";
    imgContainer.style.left = "100px"; // Posición inicial
    imgContainer.style.top = "100px";
    imgContainer.style.width = "200px"; // Tamaño inicial
    imgContainer.style.height = "200px";
    imgContainer.style.border = "2px solid rgba(0,0,0,0.2)";
    imgContainer.style.cursor = "move";

    let img = document.createElement("img");
    img.src = imageSrc;
    img.classList.add("floating-image");
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    img.style.borderRadius = "8px";

    // 🔴 Botón de eliminar
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "❌";
    deleteButton.style.position = "absolute";
    deleteButton.style.top = "-10px";
    deleteButton.style.right = "-10px";
    deleteButton.style.border = "none";
    deleteButton.style.background = "red";
    deleteButton.style.color = "white";
    deleteButton.style.borderRadius = "50%";
    deleteButton.style.cursor = "pointer";
    deleteButton.addEventListener("click", () => imgContainer.remove());

    // 🔵 Esquina para redimensionar
    let resizeHandle = document.createElement("div");
    resizeHandle.classList.add("resize-handle");
    resizeHandle.style.width = "15px";
    resizeHandle.style.height = "15px";
    resizeHandle.style.background = "#000";
    resizeHandle.style.position = "absolute";
    resizeHandle.style.right = "0";
    resizeHandle.style.bottom = "0";
    resizeHandle.style.cursor = "nwse-resize";

    imgContainer.appendChild(img);
    imgContainer.appendChild(resizeHandle);
    imgContainer.appendChild(deleteButton);
    document.body.appendChild(imgContainer);

    this.makeImageDraggable(imgContainer);
    this.makeImageResizable(imgContainer, resizeHandle);
}

makeImageDraggable(imageContainer) {
    let isDragging = false;
    let offsetX, offsetY;

    imageContainer.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("resize-handle") || e.target.tagName === "BUTTON") return; // Evita conflicto con el botón y el redimensionador
        isDragging = true;
        offsetX = e.clientX - imageContainer.getBoundingClientRect().left;
        offsetY = e.clientY - imageContainer.getBoundingClientRect().top;

        document.addEventListener("mousemove", moveImage);
        document.addEventListener("mouseup", () => {
            isDragging = false;
            document.removeEventListener("mousemove", moveImage);
        });
    });

    function moveImage(e) {
        if (isDragging) {
            imageContainer.style.left = `${e.clientX - offsetX}px`;
            imageContainer.style.top = `${e.clientY - offsetY}px`;
        }
    }
}

makeImageResizable(imageContainer, resizeHandle) {
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isResizing = true;

        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(window.getComputedStyle(imageContainer).width, 10);
        startHeight = parseInt(window.getComputedStyle(imageContainer).height, 10);

        document.addEventListener("mousemove", resizeImage);
        document.addEventListener("mouseup", () => {
            isResizing = false;
            document.removeEventListener("mousemove", resizeImage);
        });
    });

    function resizeImage(e) {
        if (isResizing) {
            let newWidth = startWidth + (e.clientX - startX);
            let newHeight = startHeight + (e.clientY - startY);
            imageContainer.style.width = `${newWidth}px`;
            imageContainer.style.height = `${newHeight}px`;
        }
    }
}

  
 addNote() {
    let noteId = `note-${Date.now()}`;
    let newNote = this.createNote(noteId, "", "Trabajo");

    // Guardar en localStorage
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push({ id: noteId, content: "", category: "Trabajo", color: "#FEFEFF", pinned: false, position: { x: 0, y: 0 } });
    localStorage.setItem("notes", JSON.stringify(notes));

    // 📌 Mantener notas fijadas siempre arriba
    let pinnedNotes = Array.from(this.notesContainer.children).filter(note => {
        let pinIcon = note.querySelector(".note__pin");
        return pinIcon && pinIcon.innerHTML === "📌";
    });

    if (pinnedNotes.length > 0) {
        pinnedNotes[pinnedNotes.length - 1].after(newNote);
    } else {
        this.notesContainer.prepend(newNote);
    }

    // 🎯 Hacer la nota movible
    this.makeNoteDraggable(newNote);
}



filterNotes() {
    let selectedCategory = document.getElementById("filterCategory").value;
    let notes = document.querySelectorAll(".note__container");

    notes.forEach(note => {
        let categorySelect = note.querySelector("select");
        if (selectedCategory === "Todas" || categorySelect.value === selectedCategory) {
            note.style.display = "block";
        } else {
            note.style.display = "none";
        }
    });
}

loadNotes() {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];

    // 🔹 Ordenar notas: las fijadas 📌 van primero
    notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    this.notesContainer.innerHTML = ""; // Limpiar el contenedor antes de agregar notas

    notes.forEach(note => {
        let newNote = this.createNote(
            note.id, note.content, note.category, note.color, note.secret, note.password, note.pinned
        );

        // 🔹 Restaurar la posición de la nota si estaba guardada
        if (note.position) {
            newNote.style.position = "absolute";
            newNote.style.left = note.position.x;
            newNote.style.top = note.position.y;
        }

        if (note.images) {
            note.images.forEach(imageSrc => {
                let img = document.createElement("img");
                img.src = imageSrc;
                img.classList.add("note-image");
                img.style.maxWidth = "100%";
                img.style.borderRadius = "8px";
                img.style.marginTop = "10px";
                newNote.querySelector(".note__content").appendChild(img);
            });
        }

        this.notesContainer.appendChild(newNote);

        // 🎯 Hacer la nota movible
        this.makeNoteDraggable(newNote);
    });

    // 🔥 Restaurar el filtro de categorías después de cargar las notas
    this.filterNotes();

    // 🔥 Restaurar la búsqueda en tiempo real después de cargar las notas
    searchNotes();
}


  // 🔥 Funcionalidad de modo oscuro
  initDarkMode() {
    const btnDarkMode = document.getElementById("btnDarkMode");
    const body = document.body;

    if (localStorage.getItem("darkMode") === "enabled") {
      body.classList.add("dark-mode");
      btnDarkMode.textContent = "☀️";
    }

    btnDarkMode.addEventListener("click", () => {
      body.classList.toggle("dark-mode");

      if (body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
        btnDarkMode.textContent = "☀️";
      } else {
        localStorage.setItem("darkMode", "disabled");
        btnDarkMode.textContent = "🌙";
      }
    });
  }
}

let notes = new Notes();


document.getElementById("addEvent").addEventListener("click", () => {
    const date = document.getElementById("datePicker").value;
    const time = document.getElementById("timePicker").value;
    const eventNoteElement = document.getElementById("eventNote");

    if (!date || !time) {
        alert("⚠️ Selecciona una fecha y una hora.");
        return;
    }

    let noteText = eventNoteElement && eventNoteElement.value ? eventNoteElement.value.trim() : "";

    console.log("📌 Evento capturado:");
    console.log("Fecha:", date, "Hora:", time);
    console.log("Nota escrita:", noteText);

    if (!noteText) {
        noteText = "Sin nota";
    }

    const eventText = `📌 Evento el ${date} a las ${time} ⏰`;

    let events = JSON.parse(localStorage.getItem("events")) || [];
    events.push({ date, time, text: eventText, note: noteText });
    localStorage.setItem("events", JSON.stringify(events));

    console.log("✅ Guardado en LocalStorage", events);

    showEventNotification(date, time, eventText, noteText);
});

function showEventNotification(date, time, text, note) {
    console.log("🔔 Ejecutando showEventNotification");
    console.log("Nota enviada:", note);

    const notificationContainer = document.createElement("div");
    notificationContainer.classList.add("event-notification");
    
    // Estilos para asegurarse de que sea visible
    notificationContainer.style.position = "fixed";
    notificationContainer.style.top = "20px";
    notificationContainer.style.right = "20px";
    notificationContainer.style.backgroundColor = "#222";
    notificationContainer.style.color = "white";
    notificationContainer.style.padding = "15px";
    notificationContainer.style.borderRadius = "8px";
    notificationContainer.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.3)";
    notificationContainer.style.zIndex = "1000";

    notificationContainer.innerHTML = `
        <strong>📅 Evento Programado</strong>
        <br>
        📌 ${text} <br>
        📝 Nota: ${note} <br>
        <small>Recordatorio activado</small>
    `;

    document.body.appendChild(notificationContainer);

    console.log("🔔 Notificación agregada al DOM");

    setTimeout(() => {
        notificationContainer.remove();
        console.log("⏳ Notificación eliminada");
    }, 5000);
}

function saveEventToLocalStorage(event) {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    events.push(event);
    localStorage.setItem("events", JSON.stringify(events));
}


function deleteEventFromLocalStorage(date, time) {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    events = events.filter(event => event.date !== date || event.time !== time);
    localStorage.setItem("events", JSON.stringify(events));
}


function showNotification(event) {
    const notificationContainer = document.createElement("div");
    notificationContainer.classList.add("notification-container");

    notificationContainer.innerHTML = `
        <div class="notification">
            <header>
                <h2>📅 Evento Programado</h2>
                <span class="timestamp">${event.date} - ${event.time}</span>
            </header>
            <div class="content">
                <span class="event">${event.text}</span><br>
                <span class="note">📝 ${event.note || "Sin nota"}</span><br>
                <span class="more">Recordatorio activado</span>
            </div>
        </div>
    `;

    document.body.appendChild(notificationContainer);

    setTimeout(() => {
        notificationContainer.remove();
    }, 10000);

    if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500]); // Vibración de notificación
    }
}


function scheduleNotification(date, time, text, note) {
    const eventTime = new Date(`${date}T${time}`).getTime();
    const currentTime = new Date().getTime();
    const timeUntilEvent = eventTime - currentTime;

    if (timeUntilEvent > 0) {
        setTimeout(() => {
            showNotification({ date, time, text, note });
        }, timeUntilEvent);
    }
}




// 📌 Funcionalidad del calendario y eventos
document.addEventListener("DOMContentLoaded", () => {
    const btnCalendar = document.getElementById("btnCalendar");
    const calendarContainer = document.getElementById("calendarContainer");
    const closeCalendar = document.getElementById("closeCalendar");
    const addEventBtn = document.getElementById("addEvent");

    if (btnCalendar && calendarContainer) {
        btnCalendar.addEventListener("click", () => {
            calendarContainer.classList.toggle("active");
        });

        closeCalendar.addEventListener("click", () => {
            calendarContainer.classList.remove("active");
        });

        addEventBtn.addEventListener("click", () => {
            const date = document.getElementById("datePicker").value;
            const time = document.getElementById("timePicker").value;

            if (!date || !time) {
                alert("⚠️ Selecciona una fecha y una hora.");
                return;
            }

            const eventText = `📌 Evento el ${date} a las ${time} ⏰`;
            const eventNote = createEventNote(date, time, eventText);
            document.getElementById("notes").appendChild(eventNote);

            saveEventToLocalStorage({ date, time, text: eventText });

            calendarContainer.classList.remove("active");
        });
    }
});



function updateEventNoteInLocalStorage(date, time, newNote) {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    let event = events.find(event => event.date === date && event.time === time);
    
    if (event) {
        event.note = newNote;
        localStorage.setItem("events", JSON.stringify(events));
    }
}
function createEventNote(date, time, text, note) {
    // Guardar el evento en localStorage sin agregarlo a la interfaz
    saveEventToLocalStorage({ date, time, text, note });

    // Programar la notificación
    scheduleNotification(date, time, text, note);
}



// 📌 Función para buscar notas en tiempo real

function searchNotes() {
    const searchInput = document.getElementById("searchBar").value.toLowerCase();
    const notes = document.querySelectorAll(".note__container");

    notes.forEach(note => {
        const noteContent = note.querySelector(".note__content").textContent.toLowerCase();
        const noteTitle = note.querySelector(".note__title") ? note.querySelector(".note__title").textContent.toLowerCase() : "";
        
        if (noteContent.includes(searchInput) || noteTitle.includes(searchInput)) {
            note.style.display = "block";
        } else {
            note.style.display = "none";
        }
    });
}

// 📌 Event Listener para el buscador
document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("searchBar");

    if (searchBar) {
        searchBar.addEventListener("input", searchNotes);
    } else {
        console.error("❌ Error: No se encontró el campo de búsqueda.");
    }
});



document.getElementById("btnAddImage").addEventListener("click", () => {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*"; // Solo permite imágenes

    input.addEventListener("change", (event) => {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = (e) => {
                insertImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    input.click();
});

function insertImage(imageSrc) {
    let selectedNote = document.querySelector(".note__container.selected");
    if (!selectedNote) {
        alert("⚠️ Selecciona una nota primero para agregar una imagen.");
        return;
    }

    let img = document.createElement("img");
    img.src = imageSrc;
    img.classList.add("note-image");
    img.style.maxWidth = "100%";
    img.style.borderRadius = "8px";
    img.style.marginTop = "10px";

    selectedNote.querySelector(".note__content").appendChild(img);

    // Guardar en localStorage
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let noteId = selectedNote.dataset.id;
    let note = notes.find(n => n.id === noteId);
    if (note) {
        note.images = note.images || [];
        note.images.push(imageSrc);
        localStorage.setItem("notes", JSON.stringify(notes));
    }
}

// Marcar la nota seleccionada al hacer clic
document.addEventListener("click", (event) => {
    let notes = document.querySelectorAll(".note__container");
    notes.forEach(note => note.classList.remove("selected"));
    
    if (event.target.closest(".note__container")) {
        event.target.closest(".note__container").classList.add("selected");
    }
});









// 🔹 Mostrar/ocultar calendario al hacer clic en el botón 📆
document.getElementById("btnShowCalendar").addEventListener("click", () => {
    const calendarContainer = document.getElementById("calendarContainer");
    calendarContainer.classList.toggle("hidden");

    if (!calendarContainer.classList.contains("hidden")) {
        loadCalendarEvents();
    }
});

// 🔹 Ocultar calendario al hacer clic en "Cerrar"
document.getElementById("closeCalendar").addEventListener("click", () => {
    document.getElementById("calendarContainer").classList.add("hidden");
});

// 🔹 Cargar eventos en el calendario
function loadCalendarEvents() {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    let calendarDays = document.getElementById("calendarDays");

    calendarDays.innerHTML = ""; // Limpiar calendario antes de cargar eventos

    events.forEach(event => {
        let dayDiv = document.createElement("div");
        dayDiv.classList.add("day");

        let dateDiv = document.createElement("div");
        dateDiv.classList.add("date");
        dateDiv.innerHTML = `<p class="date-num">${new Date(event.date).getDate()}</p>
                             <p class="date-day">${new Date(event.date).toLocaleString('es-ES', { weekday: 'short' })}</p>`;

        let eventsDiv = document.createElement("div");
        eventsDiv.classList.add("events");

        let eventDiv = document.createElement("div");
        eventDiv.classList.add("event");
        eventDiv.innerHTML = `<p class="title">${event.text}</p>
                              <p class="time">${event.time}</p>
                              <p class="note">📝 ${event.note}</p>`;

        eventsDiv.appendChild(eventDiv);
        dayDiv.appendChild(dateDiv);
        dayDiv.appendChild(eventsDiv);
        calendarDays.appendChild(dayDiv);
    });
}

// 🔹 Agregar un nuevo evento al localStorage y al calendario
document.getElementById("addEvent").addEventListener("click", () => {
    const date = document.getElementById("datePicker").value;
    const time = document.getElementById("timePicker").value;
    const eventNoteElement = document.getElementById("eventNote");

    if (!date || !time) {
        alert("⚠️ Selecciona una fecha y una hora.");
        return;
    }

    let noteText = eventNoteElement.value.trim();
    if (!noteText) noteText = "Sin nota"; // 🔹 Corregido

    const eventText = `📌 Evento el ${date} a las ${time} ⏰`;

    let events = JSON.parse(localStorage.getItem("events")) || [];
    events.push({ date, time, text: eventText, note: noteText });
    localStorage.setItem("events", JSON.stringify(events));

    showEventNotification(date, time, eventText, noteText);
});

// 🔹 Mostrar notificación con la nota correcta
function showEventNotification(date, time, text, note) {
    const notificationContainer = document.createElement("div");
    notificationContainer.classList.add("event-notification");

    notificationContainer.innerHTML = `
        <strong>📅 Evento Programado</strong>
        <br>
        📌 ${text} <br>
        📝 Nota: ${note} <br>
        <small>Recordatorio activado</small>
    `;

    document.body.appendChild(notificationContainer);

    setTimeout(() => {
        notificationContainer.remove();
    }, 5000);
}



