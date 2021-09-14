// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array

let gameTable = [];
let clues = [];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ a[i], a[j] ] = [ a[j], a[i] ];
  }
  return a;
}

let NUM_CATEGORIES = 6;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const res = await axios.get("https://jservice.io/api/categories?count=100");
  const catArr = shuffle(res.data);
  let categories = [];
  for (let i = 0; i <= NUM_CATEGORIES; i++) {
    if (categories.length === NUM_CATEGORIES) {
      return categories;
    } else {
      categories.push(catArr[i].id);
    }
  }
  return categories;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const res = await axios.get(`https://jservice.io/api/category?id=${catId}`);
  return {
    title: res.data.title,
    clues: res.data.clues,
  };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  showLoadingView();
  const $table = $(
    `
    <table id="jeopardy">
      <thead>
        <tr class="header-row"></tr>
      </thead>
      <tbody class="body"></tbody>
    </table>
    `
  );
  $(".container").prepend($table);
  const catArr = await getCategoryIds();
  for (let id of catArr) {
    let category = await getCategory(id);
    clues.push(shuffle(category.clues));
    let $catHeader = $(`<th>${category.title}</th>`);
    $(".header-row").append($catHeader);
  }
  hideLoadingView();

  for (let x = 0; x < NUM_CATEGORIES - 1; x++) {
    const $row = $("<tr>").addClass("body-row");
    gameTable.push([]);
    for (let y = 0; y < NUM_CATEGORIES; y++) {
      gameTable[x].push(null);
      const $cell = $("<td>")
        .addClass("data-cell")
        .attr("id", `${y}-${x}`)
        .html("?");
      $row.append($cell);
    }
    $(".body").append($row);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(element) {
  const [ y, x ] = element.id.split("-");

  if (gameTable[x][y] === null) {
    $(`#${element.id}`).html(`${clues[y][x].question}`);
    gameTable[x][y] = "question";
  } else if (gameTable[x][y] === "question") {
    $(`#${element.id}`).html(`${clues[y][x].answer}`);
    gameTable[x][y] = "answer";
  } else {
    return;
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  const $loading = $(
    '<div id="loading"><img src="./loading.svg" alt="text" /></div>'
  );
  $(".container").append($loading);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#loading").remove();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  const newIds = await getCategoryIds();
  await fillTable();
}

function clearTable() {
  for (let i = 0; i < gameTable.length; i++) {
    for (let j = 0; j < gameTable[i].length; j++) {
      gameTable[i][j] = null;
    }
  }
}

/** On click of start / restart button, set up game. */
$(".start").on("click", async function() {
  $("#jeopardy").empty();
  clearTable();
  await setupAndStart();
  $(".start").text("Restart");
});

// TODO

/** On page load, add event handler for clicking clues */
$(document).on("click", ".data-cell", function() {
  // to extract y and x
  const element = $(this)[0];
  handleClick(element);
});

// TODO
