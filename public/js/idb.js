let db;

const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
  // this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
  const db = event.target.result;
  // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts
  db.createObjectStore("budget_item", { autoIncrement: true });
};

//   upon a successful
request.onsuccess = function (event) {
  db = event.target.result;

  // check if app is online, if yes run uploadPizza() function to send all local db data to api
  if (navigator.onLine) {
    // coming soon
  }
};

request.oneerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  // open a new transaction with the database with read and write permissions
  const transaction = db.transaction(["budget_item"], "readwrite");

  // access the object store for "budget_item"
  const budgetObjectStore = transaction.objectStore("budget_item");

  // add record to your store with add method
  budgetObjectStore.add(record);
}

function uploadBudget() {
  const transaction = db.transaction(["budget_item"], "readwrite");

  const budgetObjectStore = transaction.objectStore("budget_item");

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(["budget_item"], "readwrite");

          const budgetObjectStore = transaction.objectStore("budget_item");

          budgetObjectStore.clear();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", uploadBudget);
