const PAGINATION_NUM = 10;

let currentPageNum = 1;

let empRecordsArr = [];

let userRowsParent = document.getElementById("table-content");

let pageNumberEntryPoint = document.querySelector(
  ".table8_pagination-page-button-wrapper"
);

let previousButton = document.querySelector(".is-previous");
let nextButton = document.querySelector(".is-next");

previousButton.addEventListener("click", (e) => {
  if (currentPageNum === 1) return; // if currentPageNum is 1

  currentPageNum -= 1;
  displayPage();
});

nextButton.addEventListener("click", (e) => {
  // validations if currentPageNum is the last page
  console.log(empRecordsArr.length / PAGINATION_NUM);
  let lastPageNum = getTotalPages(empRecordsArr.length, PAGINATION_NUM);
  if (currentPageNum === lastPageNum) return;
  currentPageNum += 1;
  displayPage();
});

async function main() {
  let baseUrl = "https://service.mediastudio.hk";
  let allSessionUrl = `${baseUrl}/sessions/all`;

  let WORK_SESSION_TYPE = "Work Session";

  //employee
  let allEmployeeUrl = `${baseUrl}/employee/all`;
  let allEmployeeRecord = await fetch(allEmployeeUrl)
    .then((r) => r.json())
    .then((r) => r.record);
  // console.log(allEmployeeRecord)

  for (const empRecord of allEmployeeRecord) {
    let fields = empRecord.fields;
    let record = {};
    record.userRecordId = empRecord.id;
    record.ID = fields.ID;
    record.telegramName = fields["Telegram Username"];
    record.timezone = fields["Timezone"];
    record.team = fields["Team Name (from Teams)"][0];
    // gonna be pushing all the session by record_id to this array
    record.sessions = [];
    empRecordsArr.push(record);
  }
  // console.log(empRecordsArr)

  // sessions
  let allSessions = await fetch(allSessionUrl)
    .then((r) => r.json())
    .then((r) => r.record);
  // console.log(`All Sessions:`)
  // console.log(allSessions)

  for (let session of allSessions) {
    const { fields } = session;
    let userRecordId = fields["Affected User ID"][0];

    let sessionObj = {};
    sessionObj.duration = fields["Duration (Hours)"];
    sessionObj.sessionType = fields["Session Type"];
    sessionObj.beginDate = fields["Begin Date"];
    sessionObj.endDate = fields["End Date"];

    // console.log(sessionObj)

    for (let empRecord of empRecordsArr) {
      if (empRecord.userRecordId === userRecordId) {
        empRecord.sessions.push(sessionObj);
        break;
      }
    }
  }

  // getting total duration, meaning loop through session type: work, and add all the duration hours
  // getting total number of days worked, using moment js, create a set, format each check-in time to dd/mm/yyyy, and finally do set.size

  for (let empRecord of empRecordsArr) {
    const { sessions } = empRecord;
    let totalHours = 0;
    let totalDaysWorked = new Set();
    let totalDaysLeaves = new Set();

    sessions.forEach((session) => {
      if (session.sessionType === WORK_SESSION_TYPE) {
        // total hours worked
        totalHours += session.duration;

        // total days worked
        let day = moment(session.beginDate).format("DD-MM-YYYY");

        totalDaysWorked.add(day);
      }

      // for leaves
      if (session.sessionType !== WORK_SESSION_TYPE) {
        let day = moment(session.beginDate).format("DD-MM-YYYY");
        totalDaysLeaves.add(day);
      }
    });

    empRecord.totalHours = Math.round(totalHours);
    empRecord.numberOfWorkDays = totalDaysWorked.size;
    empRecord.numberOfLeaveDays = totalDaysLeaves.size;
  }

  console.log(empRecordsArr);

  // reset, and rendering user rows

  displayPage();

  displayPageButtons();
}
// first record id: recM33finOrsduvt9
main().then((r) => console.log("finished"));

document.getElementById("daterange").addEventListener("change", (e) => {
  console.log("date changed");
});

// for getting the value of the date picker
// document.querySelector('.applyBtn').addEventListener('click',()=>{
//
//   setTimeout(()=>{
//
//     console.log(  document.getElementById('daterange').value )
//   },300)
//
// })

function displayPageButtons() {
  pageNumberEntryPoint.innerHTML = "";
  let totalPages = getTotalPages(empRecordsArr.length, PAGINATION_NUM);
  let pageButtonsHtml = "";
  for (let i = 1; i <= totalPages; i++) {
    pageButtonsHtml += getPageButtons(i);
  }

  pageNumberEntryPoint.innerHTML += pageButtonsHtml;
}

function displayPage() {
  let startingIndex = (currentPageNum - 1) * PAGINATION_NUM;
  userRowsParent.innerHTML = "";
  let htmlStr = "";

  for (
    startingIndex;
    startingIndex < PAGINATION_NUM * currentPageNum;
    startingIndex++
  ) {
    // check if index is out of array range, if yes, exit loop
    if (startingIndex > empRecordsArr.length - 1) break;

    const {
      telegramName,
      team,
      totalHours,
      numberOfWorkDays,
      numberOfLeaveDays,
      ID,
    } = empRecordsArr[startingIndex];

    htmlStr += getUserRowHtml(
      telegramName,
      team,
      totalHours,
      numberOfWorkDays,
      numberOfLeaveDays,
      ID
    );
  }

  userRowsParent.innerHTML += htmlStr;
}

function getPageButtons(number) {
  return (
    `<a onclick="handlePageButtonClick(this)" fs-cmsload-element="page-button" href="#" class="table8_page-button w-inline-block" data-page-number="${number}">` +
    `<div>${number}</div>` +
    "</a>"
  );
}

function handlePageButtonClick(element) {
  // if currentPageNum is clicked, Eg, on page 2, and page 2 is clicked
  if (currentPageNum === parseInt(element.getAttribute("data-page-number")))
    return;

  currentPageNum = parseInt(element.getAttribute("data-page-number"));
  displayPage();
}

function getTotalPages(arrayLength, paginationNum) {
  return Math.ceil(arrayLength / paginationNum);
}

function getUserRowHtml(
  telegramName,
  team,
  totalHours,
  numberOfWorkDays,
  numberOfLeaveDays,
  employeeId
) {
  return (
    '<div id="table-item" role="row" class="table8_item">' +
    '<div role="cell" class="table8_column">' +
    '<div class="table8_column-content-wrapper">' +
    '<img src="https://assets.website-files.com/624380709031623bfe4aee60/631035b9698714c1fee46997_Placeholder%20Small%20Image.svg" loading="lazy" alt="" class="table8_image">' +
    '<div class="table8_column-text-wrapper">' +
    '<div fs-cmssort-field="IDENTIFIER" class="text-weight-medium">Full name</div>' +
    `<a href="#" class="text-size-small">@${telegramName}</a></div>` +
    "</div>" +
    "</div>" +
    '<div role="cell" class="table8_column is-width-medium">' +
    `<div fs-cmssort-field="IDENTIFIER">${team}</div>` +
    "</div>" +
    '<div role="cell" class="table8_column is-width-medium">' +
    `<div fs-cmssort-field="IDENTIFIER">${totalHours}</div>` +
    "</div>" +
    '<div role="cell" class="table8_column is-width-medium">' +
    `<div fs-cmssort-field="IDENTIFIER">${numberOfWorkDays}</div>` +
    "</div>" +
    '<div role="cell" class="table8_column is-width-small">' +
    `<div fs-cmssort-type="date" fs-cmssort-field="IDENTIFIER">${numberOfLeaveDays}</div>` +
    "</div>" +
    '<div class="table8_column-button-wrapper">' +
    `<a href="/member?id=${employeeId}" class="table8_link">View</a>` +
    "</div>" +
    "</div>"
  );
}
