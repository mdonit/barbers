import { dateFormat } from "./dateFunc.js";

const strModalWindow = (dateString, dateHour) => `
    <div class="form">
        <div id="formCloseButton">X</div>
        <div class="formTitle">Időpontfoglalás</div>
        <div class="formDetails">
            <div>
                <label for="lName">Vezetéknév</label>
                <input type="text" name="lName" id="lName">
            </div>
            <div>
                <label for="fName">Keresztnév</label>
                <input type="text" name="fName" id="fName">
            </div>
            <div class="formDate">
                <span>Kiválasztott időpont</span>
                <div>${dateString}</div>
                <div id="formDay">${dateFormat(dateString, true)}</div>
                <div id="formHour">${dateHour}</div>
            </div>
            <div id="formButton">Küldés</div>
        </div>
    </div>
`;

export { strModalWindow };
