function dateFormat(dateString = undefined, dayOnly = undefined) {
    const date = new Date(dateString ?? Date.now());

    if (dateString) {
        const { month, dayNumber, dayName } = dateDetails(date);

        if (dayOnly) return dayName.charAt(0).toUpperCase() + dayName.slice(1);

        return `${month.charAt(0).toUpperCase() + month.slice(1)} ${dayNumber}. (${dayName.charAt(0).toUpperCase() + dayName.slice(1)})`;
    } else return `${date.getFullYear()}-${date.getMonth() < 9 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`}-${dateDetails(date).dayNumber}`;
}

function dateDetails(date) {
    const month = date.toLocaleDateString("hu-HU", { month: "long" });
    const dayNumber = date.toLocaleDateString("hu-HU", { day: "numeric" });
    const dayName = date.toLocaleDateString("hu-HU", { weekday: "long" });

    return { month, dayNumber, dayName };
}

export { dateFormat, dateDetails };
