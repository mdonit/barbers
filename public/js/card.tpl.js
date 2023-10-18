import { dateFormat } from "./dateFunc.js";

const strBarberHours = (barbersData, dateString, brbName, isUser) => {
    let date = new Date(dateString);
    let dayIndex = date.getDay();
    let bHours = [];
    let bHoursString = "";

    const selectedBarber = barbersData.find((brb) => brb.name === brbName);

    if (isUser) {
        if (selectedBarber.openDays.find((dd) => dd.dayIndex === dayIndex)) {
            bHours = selectedBarber.openDays.find((dd) => dd.dayIndex === dayIndex).oHours;

            bHours.sort(function (a, b) {
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            });

            bHoursString = `<ul><li>${bHours.join("</li><li>")}</li></ul>`;
        } else bHoursString = "<span>Nincs elérhető időpont erre a napra.</span>";
    } else {
        if (selectedBarber.appointments.find((dd) => dd.aDate === dateString)) {
            for (const day of selectedBarber.appointments) {
                if (day.aDate === dateString) bHours.push(day.aHour);
            }

            bHours.sort(function (a, b) {
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            });

            bHoursString = `<ul><li>${bHours.join("</li><li>")}</li></ul>`;
        }
    }

    return bHoursString;
};

const strBarberCard = (barberData, isUser) => `
<div class="barberCard">
    <div class="barberImg">
        <img src="img/${barberData.image}" alt="barber img" />
    </div>
    <div class="barberDetails">
        <div class="barberName">${barberData.name}</div>
        <div class="barberPos">${barberData.position}</div>
        <div class="barberDesc">${barberData.description}</div>
    </div>
    <div class="barberButton">${isUser ? "Időpontfoglalás" : "Időpontok"}</div>
</div>
`;

const strBarberCardSelected = (barbersData, isUser, brbName) => {
    const date = new Date();

    let dayIndex = date.getDay();

    let bHoursString = "";
    let foundHours = false;

    const selectedBarber = barbersData.find((brb) => brb.name === brbName);

    if (selectedBarber.openDays.find((dd) => dd.dayIndex === dayIndex)) {
        let bHours = selectedBarber.openDays.find((dd) => dd.dayIndex === dayIndex).oHours;

        bHours.sort(function (a, b) {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });

        bHoursString = `<li>${bHours.join("</li><li>")}</li>`;

        foundHours = true;
    } else bHoursString = "Nincs elérhető időpont erre a napra.";

    let povHtmlString = "";

    if (isUser)
        povHtmlString = `
        
        <input type="date" id="selectedDate" value=${date.toISOString().split("T")[0]} />
        <div class="barberDay">
            ${dateFormat(dateFormat())}
        </div>
        <div class="barberTimes">Időpontok</div>
        <div id="barberAppointments">
            ${
                foundHours
                    ? `
                <ul>
                    ${bHoursString}
                </ul>`
                    : `<span>${bHoursString}</span><ul id="barberAppointments"></ul>`
            }
        </div>
    `;
    else {
        let aDateString = [];

        for (const ap of selectedBarber.appointments) {
            if (!aDateString.includes(ap.aDate)) aDateString.push(ap.aDate);
        }

        aDateString.sort(function (a, b) {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });

        povHtmlString = `
            <div class="barberDates">
                <div class="daysContainer">
                    <div class="daySelect">
                        <span class="selectText">Válassz Napot</span>
                    </div>
                    <div id="daySelectOptions">
                        <span>${aDateString.join("</span><span>")}</span>
                    </div>
                </div>
                <div id="barberAppointments">
                    
                </div>
            </div>
        `;
    }

    return `
    <div class="barberSelected">
        <div class="barberImg">
            <img src="img/${selectedBarber.image}" alt="barber img" />
        </div>
        <div class="barberDetails">
            <div class="barberName">${selectedBarber.name}</div>
            <div class="barberPos">${selectedBarber.position}</div>
            ${povHtmlString}
        </div>
        <div class="backButton">
            Vissza
        </div>
        <div class="barberButton">
            ${isUser ? "Lefoglalom" : "Időpont Törlése"}
        </div>
    </div>
    `;
};

export { strBarberHours, strBarberCard, strBarberCardSelected };
