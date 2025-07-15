document.addEventListener("DOMContentLoaded", () => {
    loadCalendarEvents();
});

function loadCalendarEvents() {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    let calendarDays = document.getElementById("calendarDays");

    calendarDays.innerHTML = ""; // Limpiar antes de cargar eventos

    let daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    let today = new Date();

    // Crear las cabeceras de los días
    for (let i = 0; i < 7; i++) {
        let date = new Date();
        date.setDate(today.getDate() - today.getDay() + i + 1);

        let dayHeader = document.createElement("div");
        dayHeader.classList.add("date-header");
        dayHeader.innerHTML = `<strong>${daysOfWeek[i]}</strong> <br> ${date.getDate()}`;

        calendarDays.appendChild(dayHeader);
    }

    // Crear los espacios para cada hora en cada día
    for (let hour = 9; hour <= 20; hour++) { 
        for (let i = 0; i < 7; i++) {
            let cell = document.createElement("div");
            cell.classList.add("day");
            calendarDays.appendChild(cell);
        }
    }

    // Agrupar eventos por fecha
    let groupedEvents = {};
    events.forEach(event => {
        let dateKey = event.date;
        if (!groupedEvents[dateKey]) {
            groupedEvents[dateKey] = [];
        }
        groupedEvents[dateKey].push(event);
    });

    // Insertar eventos en el calendario
    let dayCells = document.querySelectorAll(".day");
    Object.keys(groupedEvents).forEach((date, index) => {
        groupedEvents[date].forEach(event => {
            let eventDiv = document.createElement("div");
            eventDiv.classList.add("event");
            eventDiv.innerHTML = `<p>📌 ${event.text}</p>
                                  <p>🕒 ${event.time}</p>
                                  <p>📝 ${event.note || "Sin nota"}</p>`;
            dayCells[index].appendChild(eventDiv);
        });
    });
}

