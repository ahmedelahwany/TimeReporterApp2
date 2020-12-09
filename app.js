// This is simply the brain the controller of the app
(function () {
  const UI = require("./js/UI"); // importing UI class
  const TimeReporter = require("./js/TimeReporter"); // importing the TimeReporter class

  // Getting some DOM elements

  const createReportBtn = document.getElementById("CreateReport");

  const exportbtn = document.getElementById("export");

  const UserValue = document.getElementById("User");
  const StatusValue = document.getElementById("Status");
  const ProjectValue = document.getElementById("Project");
  const TypeValue = document.getElementById("Type");

  const aggerationFielMenu = document.getElementById("AggregationField");

  const TimeReporting = new TimeReporter(); // creating an instance of the TimeReporter class
  const ui = new UI(); // creating an instance of the UI class

  TimeReporting.JiraConnect();
  // connecting to The Jira through TimeReporter instance to get the data which will populate the drop menus in the UI

  // add The options ( retireved data) to the select menus
  document.addEventListener("DOMContentLoaded", () => {
    ui.showFeedback(
      "please, wait few moments until the drop menus's data is loaded form the API"
    );
    TimeReporting.getDropMenusDATA()
      .then((data) => {
        ui.addSelecttOptions(data.JiraProjects, "Project");
      })
      .catch(function (error) {
        console.log("Promise catch: " + error);
        ui.showFeedback(
          "Faild to connect to the API and getting your data . Please, reload the page"
        );
      });

    TimeReporting.getDropMenusDATA().then((data) => {
      ui.addUserOptions(data.JiraUsers);
    });
    TimeReporting.getDropMenusDATA().then((data) => {
      ui.addSelecttOptions(data.JiraWorkflows, "Status");
    });
    TimeReporting.getDropMenusDATA().then((data) => {
      ui.addSelecttOptions(data.JiraIssueTypes, "Type");
    });
  });

  // This function is responsible for searching Issues in Jira when the user clicks the create Report button or change the aggregation field
  function searchJiraUI() {
    // getting the chosen start end date from the Date picker and  formatting them to user them in the URI of the Get request
    let startDate = $("#datarange")
      .data("daterangepicker")
      .startDate.format("YYYY-MM-DD");
    let endDate = $("#datarange")
      .data("daterangepicker")
      .endDate.format("YYYY-MM-DD");
    // searching Jira Depending on the values selected by the user in the UI
    TimeReporting.SearchJira(
      parseInt(aggerationFielMenu.value),
      UserValue.value,
      parseInt(ProjectValue.value),
      parseInt(StatusValue.value),
      parseInt(TypeValue.value),
      startDate,
      endDate
    )
      .then((data) => {
        $("#tbody").empty();
        $("#tfoot").empty();
        ui.hideLoader();
        ui.showTableData(
          // displaying retrieved issues in the table
          data.JiraIssues
        );
      })
      .catch(function (error) {
        console.log("Promise catch: " + error);
        ui.hideLoader();
        ui.showFeedback(
          "Faild to connect to the API and getting your data . Please, try again"
        );
      });
  }

  createReportBtn.addEventListener("click", () => {
    ui.showLoader();
    searchJiraUI();
  });
  // setting up the export buttom which will convet the table to xls files when clicked
  exportbtn.addEventListener("click", () => {
    exportbtn.setAttribute(
      "href",
      "data:application/vnd.ms-excel," +
        escape(document.getElementById("example").outerHTML)
    );
    exportbtn.setAttribute("download", "export.xls");
  });

  /*If the user choosees a different value from the aggregation field drop menu, Jira will be searched again for issues ,
   and the new retireved  issues will be displayed
   This is why our app is dynamic
  */
  aggerationFielMenu.addEventListener("change", () => {
    if (
      parseInt(aggerationFielMenu.value) === 1 ||
      parseInt(aggerationFielMenu.value) === 2
    ) {
      searchJiraUI();
      ui.showLoader();
    } else {
      ui.showFeedback("sorry, It is not implemented yet"); // only (Users , issues ) aggregation fields are implemented , the rest will be implemented in next versions
    }
  });

  $(document).ready(function () {
    $("#example").DataTable(); // preparting the table for the data
  });
})();
