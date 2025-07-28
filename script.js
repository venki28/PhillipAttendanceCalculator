const holidays = [
  { id: 1, Date: "01-Jan-25", Day: "Wednesday", eventName: "New Year's Day" },
  { id: 2, Date: "14-Jan-25", Day: "Tuesday", eventName: "Pongal" },
  { id: 3, Date: "15-Jan-25", Day: "Wednesday", eventName: "Thiruvalluvar Day" },
  { id: 4, Date: "26-Jan-25", Day: "Sunday", eventName: "Republic Day" },
  { id: 5, Date: "31-Mar-25", Day: "Monday", eventName: "Ramzan" },
  { id: 6, Date: "14-Apr-25", Day: "Monday", eventName: "Dr Ambedkar Jayanti / Tamil New Year" },
  { id: 7, Date: "18-Apr-25", Day: "Friday", eventName: "Good Friday" },
  { id: 8, Date: "01-May-25", Day: "Thursday", eventName: "May Day" },
  { id: 9, Date: "07-Jun-25", Day: "Saturday", eventName: "Bakrid" },
  { id: 10, Date: "15-Aug-25", Day: "Friday", eventName: "Independence Day" },
  { id: 11, Date: "16-Aug-25", Day: "Saturday", eventName: "Krishna Jayanthi" },
  { id: 12, Date: "27-Aug-25", Day: "Wednesday", eventName: "Vinayakar Chathurthi" },
  { id: 13, Date: "01-Oct-25", Day: "Wednesday", eventName: "Ayudha Pooja" },
  { id: 14, Date: "02-Oct-25", Day: "Thursday", eventName: "Vijaya Dasami / Gandhi Jayanthi" },
  { id: 15, Date: "20-Oct-25", Day: "Monday", eventName: "Deepavali" },
  { id: 16, Date: "25-Dec-25", Day: "Thursday", eventName: "Christmas" }
];

document.addEventListener("DOMContentLoaded", function () {
  function enforceInputLimits(inputId, min, max) {
    const input = document.getElementById(inputId);

    input.addEventListener("input", function () {
      let val = parseInt(this.value, 10);
      if (isNaN(val)) return;
      if (val < min) this.value = min;
      if (val > max) this.value = max;
    });
  }
  enforceInputLimits("presentDays", 0, 30);
  enforceInputLimits("personalLeaves", 0, 30);
});

function getMonthIndex(monAbbr) {
  const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  return monthMap[monAbbr];
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getWeekendCount(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (date.getDay() === 0 || date.getDay() === 6) {
      count++;
    }
  }
  return count;
}

function getHolidayCountForMonth(monthIndex, year) {
  return holidays.filter(holiday => {
    const [day, monAbbr, yy] = holiday.Date.split("-");
    const holidayDate = new Date(`20${yy}`, getMonthIndex(monAbbr), day);
    const isWeekend = holidayDate.getDay() === 0 || holidayDate.getDay() === 6;
    return holidayDate.getMonth() === monthIndex && holidayDate.getFullYear() === year && !isWeekend;
  });
}

function onMonthChange() {
  //Reset the Office present days and Sick leave
  document.getElementById("presentDays").value = "";
  document.getElementById("personalLeaves").value = "";

  const month = parseInt(document.getElementById("monthSelect").value);
  const year = new Date().getFullYear();

  const daysInMonth = getDaysInMonth(year, month);
  const holidays = getHolidayCountForMonth(month, year);
  const weekends = getWeekendCount(year, month);

  document.getElementById("totalDays").value = daysInMonth;
  document.getElementById("govtHolidays").value = holidays.length;
  document.getElementById("weekends").value = weekends;

  displayHolidays(holidays);
  calculateAttendance(false);

  document.getElementById("currentMonth").textContent =
    `${new Date(year, month).toLocaleString('default', { month: 'long' })} - ${year}`;
}

function displayHolidays(holidays) {
  const holidayList = document.getElementById("holidayList");
  holidayList.innerHTML = ""; // Clear previous list

  if (holidays.length === 0) {
    holidayList.innerHTML = "<li>No holidays this month</li>";
    return;
  }

  holidays.forEach(h => {
    const li = document.createElement("li");
    li.textContent = `${h.Date} (${h.Day}) - ${h.eventName}`;
    holidayList.appendChild(li);
  });
}

function calculateAttendance(isButtonClick) {
  const workingDays =
    parseInt(document.getElementById("totalDays").value || 0) -
    parseInt(document.getElementById("govtHolidays").value || 0) -
    parseInt(document.getElementById("weekends").value || 0);

  const personalLeaves = parseInt(document.getElementById("personalLeaves").value || 0);
  const presentDays = parseInt(document.getElementById("presentDays").value || 0);
  const holidays =  parseInt(document.getElementById("govtHolidays").value || 0);
  const actualPresent = presentDays + personalLeaves + holidays;

  const percentage = ((actualPresent / workingDays) * 100).toFixed(2);
  const requiredDaysFor60 = Math.ceil(0.6 * workingDays);
  const remaining = Math.max(0, requiredDaysFor60 - actualPresent);

  if (isButtonClick) {
    let message = ""
    if(percentage >= 60){
      message = `Woahhh your target is completed. Your attendance is ${percentage}%.`
    }
    else{
      message = `Your attendance is ${percentage}%. You need ${remaining} more day(s) to reach 60%.`;
    }   
    showPopup(message);
  }
  else {
    const target = document.getElementById("target");
    target.innerHTML = ""; // Clear previous data

    if (target) {
      target.innerHTML = `You have to come ${remaining} day(s) to office to cover 60%`;
      return;
    }
  }  
}

function showPopup(message) {
  const popup = document.getElementById("popup");
  popup.innerText = message;
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 5000);
}

// Initial display when page loads
document.addEventListener("DOMContentLoaded", () => {
  const currentMonth = new Date().getMonth();
  document.getElementById("monthSelect").value = currentMonth;
  onMonthChange();
});