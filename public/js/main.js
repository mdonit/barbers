import { request } from "./request.js";
import { dateFormat, dateDetails } from "./dateFunc.js";
import { strModalWindow } from "./modal.tpl.js";
import { strBarberHours, strBarberCard, strBarberCardSelected } from "./card.tpl.js";

("use strict");

const s_modalElementId = "modal";
const s_contentElementId = "content";
const s_barbersElementId = "barbers";
const s_SelectDayId = "selectedDate";
const s_barberAppointments = "barberAppointments";
const s_daySelectOptionsId = "daySelectOptions";
const s_formButtonId = "formButton";
const s_formCloseId = "formCloseButton";

const s_btnSelectedCl = "btnSelected";
const s_barberButtonCl = "barberButton";
const s_barberButtonDisabledCl = "barberButtonDisabled";
const s_backButtonCl = "backButton";
const s_povSelectedCl = "povSelected";
const s_daySelectCl = "daySelect";
const s_barberDayCl = "barberDay";
const s_barberNameCl = "barberName";

const css_appointmentSelected = "appointmentSelected";

const contentEl = document.getElementById(s_contentElementId);
const modalEl = document.getElementById(s_modalElementId);
const povList = document.querySelector("nav ul");

let BARBERS = [];
let isUser = true;

// User / Admin pov switch
povList.querySelectorAll("li").forEach((pov) => {
    pov.addEventListener("click", () => {
        if (!pov.classList.contains(s_povSelectedCl)) {
            povList.querySelectorAll("li").forEach((li) => {
                li.classList.toggle(s_povSelectedCl);
            });

            if (isUser) isUser = false;
            else isUser = true;

            renderBarberCards(contentEl);
        }
    });
});

// Open and close modal; save appointment according to inputs
function renderModal(renderTo, dateString) {
    let brbName = document.querySelector(`.${s_barberNameCl}`).innerText;
    console.log(brbName);
    const selectedHour = document.querySelector(`.${css_appointmentSelected}`).innerText;
    const modalString = strModalWindow(dateString, selectedHour);

    renderTo.style.display = "flex";
    renderTo.innerHTML = modalString;

    const firstName = document.getElementById("fName");
    const lastName = document.getElementById("lName");

    const formButton = document.getElementById(s_formButtonId);
    const formCloseButton = document.getElementById(s_formCloseId);

    formCloseButton.onclick = () => {
        renderTo.style.display = "none";
    };

    formButton.onclick = () => {
        if (firstName.value.trim() === "" || lastName.value.trim() === "") alert("Minden mezőt ki kell tölteni!");
        else {
            formCloseButton.click();

            const barberName = document.querySelector(`.${s_barberNameCl}`).innerText;
            const dateString = document.getElementById(s_SelectDayId).value;
            const selectedDate = dateDetails(new Date(dateString));
            const selectedHour = document.querySelector(`.${css_appointmentSelected}`).innerText;

            const barberAppointments = BARBERS.find((b) => b.name === brbName).appointments;

            const newAppointment = {
                appointments: [
                    ...barberAppointments,
                    {
                        day: selectedDate.dayName.charAt(0).toUpperCase() + selectedDate.dayName.slice(1),
                        dayIndex: Number(selectedDate.dayNumber),
                        aDate: dateString,
                        aName: lastName.value.trim() + " " + firstName.value.trim(),
                        aHour: selectedHour,
                    },
                ],
            };

            request.post(`/make-appointment/${barberName}`, newAppointment, (res) => {
                const response = JSON.parse(res);

                if (response.saved) {
                    request.get("/barbers", function (res) {
                        BARBERS = JSON.parse(res);
                        renderBarberSelected(contentEl, barberName);

                        alert(response.message);
                    });
                }
            });
        }
    };
}

// Makes param button unclickable/unfunctional and vice versa
function disableButton(btnEl, disableBtn = true) {
    if (disableBtn) {
        btnEl.classList.add(s_barberButtonDisabledCl);
    } else btnEl.classList.remove(s_barberButtonDisabledCl);
}

// When choosing an appointment from the list, this handles the style of the selected appointment
// It also makes reserved hours unavailable
function selectAppointment(element, brbName = undefined, date = undefined) {
    element.querySelectorAll("li").forEach((hour) => {
        if (brbName && date) {
            let searchedHour = BARBERS.find((b) => b.name === brbName)
                .appointments.filter((b) => b.aDate === date)
                .find((b) => b.aHour === hour.innerText);

            if (searchedHour) hour.classList.add(s_barberButtonDisabledCl);
        }

        if (!hour.classList.contains(s_barberButtonDisabledCl))
            hour.addEventListener("click", () => {
                if (hour.parentElement.querySelector(`.${css_appointmentSelected}`)) {
                    hour.parentElement.querySelector(`.${css_appointmentSelected}`).classList.remove(css_appointmentSelected);
                }

                hour.classList.add(css_appointmentSelected);

                disableButton(document.querySelector(`.${s_barberButtonCl}`), false);
            });
    });
}

// The button located on a barber's card. Renders the appointment table; content depends on User/Admin
function getBarberButton(isItCard) {
    if (isItCard)
        document.querySelectorAll(`.${s_barberButtonCl}`).forEach((brbBtn) => {
            brbBtn.addEventListener("click", () => {
                let brbName = brbBtn.parentElement.querySelector(`.${s_barberNameCl}`).innerText;
                renderBarberSelected(contentEl, brbName);
            });
        });
    else {
        const brbName = document.querySelector(`.${s_barberNameCl}`).innerText;

        const btn = document.querySelector(`.${s_barberButtonCl}`);
        disableButton(btn);

        if (!isUser) btn.style.backgroundColor = "rgb(196, 29, 46)";

        btn.addEventListener("click", () => {
            if (!btn.classList.contains(s_barberButtonDisabledCl)) {
                // if USER pushes the button, they make an appointment
                if (isUser) {
                    const dayInputValue = document.getElementById(s_SelectDayId).value;
                    renderModal(modalEl, dayInputValue);
                }
                // ADMIN deletes an appointment
                else {
                    const date = document.querySelector(`.${s_daySelectCl}`).innerText;
                    const hour = document.querySelector(`.${css_appointmentSelected}`).innerText;

                    if (confirm("Biztosan törölni kívánja a kiválasztott időpontot?")) {
                        request.post(`/delete-appointment/${brbName}/${date}/${hour}`, {}, (res) => {
                            const response = JSON.parse(res);

                            if (response.saved) {
                                request.get("/barbers", function (res) {
                                    BARBERS = JSON.parse(res);
                                    renderBarberSelected(contentEl, brbName);

                                    alert(response.message);
                                });
                            }
                        });
                    }
                }
            }
        });
    }
}

// Renders the list of available barbers
function renderBarberCards(renderTo) {
    request.get("/barbers", function (res) {
        let brbString = "";

        BARBERS = JSON.parse(res);

        for (const brb of BARBERS) {
            brbString += strBarberCard(brb, isUser);
        }

        renderTo.innerHTML = `<div id="${s_barbersElementId}">${brbString}</div>`;
        getBarberButton(true);
    });
}

// Renders the appointment table of the selected barber after clicking on said barber's card button
function renderBarberSelected(renderTo, brbName) {
    renderTo.innerHTML = strBarberCardSelected(BARBERS, isUser, brbName);

    const barberAppointments = document.getElementById(s_barberAppointments);
    const daySelectOptions = document.getElementById(s_daySelectOptionsId);
    const daySelect = document.querySelector(`.${s_daySelectCl}`);
    const backButton = document.querySelector(`.${s_backButtonCl}`);
    const barberDay = document.querySelector(`.${s_barberDayCl}`);
    const selectedDate = document.getElementById(s_SelectDayId);

    if (barberAppointments && selectedDate) selectAppointment(barberAppointments, brbName, selectedDate.value);

    backButton.addEventListener("click", () => {
        renderBarberCards(contentEl);
    });

    getBarberButton(false);

    // if ADMIN selects existing appointments
    if (!isUser) {
        daySelect.addEventListener("click", () => {
            if (daySelectOptions.style.display === "none" || daySelectOptions.style.display === "") {
                daySelectOptions.style.display = "flex";
                daySelect.classList.add(s_btnSelectedCl);
            } else {
                daySelectOptions.style.display = "none";
                daySelect.classList.remove(s_btnSelectedCl);
            }
        });

        daySelectOptions.querySelectorAll("span").forEach((date) => {
            date.addEventListener("click", () => {
                barberAppointments.innerHTML = strBarberHours(BARBERS, date.innerText, brbName, false);
                daySelect.innerText = date.innerText;

                selectAppointment(barberAppointments);
                disableButton(document.querySelector(`.${s_barberButtonCl}`));
            });
        });
    }
    // if USER changes the date in the date input
    else {
        selectedDate.onchange = () => {
            let dayInputValue = document.getElementById(s_SelectDayId).value;

            disableButton(document.querySelector(`.${s_barberButtonCl}`));

            barberAppointments.innerHTML = strBarberHours(BARBERS, dayInputValue, brbName, true, barberDay.innerText);
            barberDay.innerText = dateFormat(dayInputValue);

            selectAppointment(barberAppointments, brbName, selectedDate.value);
        };
    }
}

renderBarberCards(contentEl);
