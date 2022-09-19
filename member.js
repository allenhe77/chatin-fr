const PAGINATION_NUM = 10;

let currentPageNum = 1;

let organisedSessionsArr = [];

let rowsParent = document.getElementById("table-content");

let pageNumberEntryPoint = document.querySelector(
  ".table10_pagination-page-button-wrapper"
);

let previousButton = document.querySelector(".is-previous");
let nextButton = document.querySelector(".is-next");

previousButton.addEventListener("click", (e) => {
  // validations if currentPageNum is 1
  if (currentPageNum === 1) return;

  currentPageNum -= 1;
  displayPage();
});

nextButton.addEventListener("click", (e) => {
  // validations if currentPageNum is the last page
  console.log(organisedSessionsArr.length / PAGINATION_NUM);
  let lastPageNum = getTotalPages(organisedSessionsArr.length, PAGINATION_NUM);
  if (currentPageNum === lastPageNum) return;
  currentPageNum += 1;
  displayPage();
});

let rowsHtml = "";

let baseUrl = "https://service.mediastudio.hk";

let queryId = getQueryId(window.location.href);

async function main() {
  // console.log(queryId)

  let empRecord = await fetch(`${baseUrl}/employee/by-id/${queryId}`)
    .then((r) => r.json())
    .then((r) => r.record);
  // console.log(empRecord)

  let sessions = await fetch(`${baseUrl}/sessions/employee/by-id/${queryId}`)
    .then((r) => r.json())
    .then((r) => r.record);
  // console.log(sessions);

  for (let session of sessions) {
    const { fields } = session;

    let beginDate = moment(fields["Begin Date"]);
    let endTime = "";

    if (fields["End Date"]) {
      let endDate = moment(fields["End Date"]);

      endTime = endDate.format("HH:mm");
    }

    let date = beginDate.format("DD/MM/YYYY");
    let sessionType = fields["Session Type"];
    let beginTime = beginDate.format("HH:mm");

    let duration = Math.round(fields["Duration (Hours)"]);

    organisedSessionsArr.push({
      date,
      sessionType,
      beginTime,
      endTime,
      duration,
    });
  }
  console.log("Session array after organising");
  console.log(organisedSessionsArr);

  // display paginate pages
  // organisedSessionsArr.forEach((session) => {
  //   const { date, sessionType, beginTime, endTime, duration } = session;
  //   rowsHtml += getRows(date, sessionType, beginTime, endTime, duration);
  // });

  // reset inner html and add the generated html
  // rowsParent.innerHTML = "";
  // rowsParent.innerHTML += rowsHtml;

  displayPage();

  // get page number buttons
  displayPageButtons();
}

main().then((r) => console.log("Finished Running!"));

function displayPageButtons() {
  pageNumberEntryPoint.innerHTML = "";
  let totalPages = getTotalPages(organisedSessionsArr.length, PAGINATION_NUM);
  let pageButtonsHtml = "";
  for (let i = 1; i <= totalPages; i++) {
    pageButtonsHtml += getPageButtons(i);
  }

  pageNumberEntryPoint.innerHTML += pageButtonsHtml;
}

function getTotalPages(arrayLength, paginationNum) {
  return Math.ceil(arrayLength / paginationNum);
}

function getPageButtons(number) {
  return (
    `<a onclick="handlePageButtonClick(this)" fs-cmsload-element="page-button" href="#" class="table10_page-button w-inline-block" data-page-number="${number}">` +
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

function displayPage() {
  let startingIndex = (currentPageNum - 1) * PAGINATION_NUM;
  rowsParent.innerHTML = "";
  let htmlStr = "";

  for (
    startingIndex;
    startingIndex < PAGINATION_NUM * currentPageNum;
    startingIndex++
  ) {
    console.log(`Starting index is: ${startingIndex}`);

    // check if index is out of array range, if yes, exit loop
    if (startingIndex > organisedSessionsArr.length - 1) break;

    const { date, sessionType, beginTime, endTime, duration } =
      organisedSessionsArr[startingIndex];
    htmlStr += getRows(date, sessionType, beginTime, endTime, duration);
  }
  rowsParent.innerHTML += htmlStr;
}

function getQueryId(url) {
  return url.split("?id=")[1];
}

function getRows(date, sessionType, beginTime, endTime, duration) {
  return (
    '<div id="table-item" role="row" class="table10_item">' +
    '<div role="cell" class="table10_column">' +
    `<div fs-cmssort-type="date" fs-cmssort-field="IDENTIFIER" class="truncate-width">${date}` +
    "</div>" +
    "</div>" +
    '<div role="cell" class="table10_column is-width-medium">' +
    '<div class="table10_status-wrapper">' +
    `<div fs-cmssort-field="IDENTIFIER" class="text-size-small text-weight-medium">${sessionType}</div>` +
    "</div>" +
    "</div>" +
    '<div role="cell" class="table10_column is-width-medium">' +
    '<div fs-cmssort-type="date" fs-cmssort-field="IDENTIFIER" class="truncate-width">' +
    `${beginTime}</div></div>` +
    '<div role="cell" class="table10_column is-width-medium">' +
    '<div fs-cmssort-type="date" fs-cmssort-field="IDENTIFIER" class="truncate-width">' +
    `${endTime}</div></div>` +
    '<div role="cell" class="table10_column is-width-small">' +
    `<div fs-cmssort-field="IDENTIFIER" class="truncate-width">${duration}</div></div>` +
    '<div class="table10_column-button-wrapper">' +
    '<div data-hover="false" data-delay="200" data-w-id="99c3d17f-c852-4b54-6900-3021dd295f3d" class="table10_dropdown w-dropdown">' +
    '<div class="table10_dropdown-toggle w-dropdown-toggle" id="w-dropdown-toggle-0" aria-controls="w-dropdown-list-0" aria-haspopup="menu" aria-expanded="false" role="button" tabindex="0">' +
    '<div class="table10_dots-wrapper"><div class="table10_dot"></div>' +
    '<div class="table10_dot"></div>' +
    '<div class="table10_dot"></div></div></div>' +
    '<nav data-w-id="99c3d17f-c852-4b54-6900-3021dd295f43" style="transform: translate3d(0px, 3rem, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); transform-style: preserve-3d; opacity: 0;" class="table10_dropdown-list w-dropdown-list" id="w-dropdown-list-0" aria-labelledby="w-dropdown-toggle-0">' +
    '<a href="#" class="table10_dropdown-link w-dropdown-link" tabindex="0">Edit</a>' +
    '<a href="#" class="table10_dropdown-link w-dropdown-link" tabindex="0">Remove</a>' +
    "</nav></div></div></div>"
  );
}
