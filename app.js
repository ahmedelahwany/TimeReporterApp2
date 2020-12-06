(function () {
  const UI = require("./js/UI");
  const TimeReporter = require("./js/TimeReporter");

  const createReportBtn = document.getElementById("CreateReport");

  const exportbtn = document.getElementById("export");

  const UserValue = document.getElementById("User");
  const StatusValue = document.getElementById("Status");
  const ProjectValue = document.getElementById("Project");
  const TypeValue = document.getElementById("Type");

  const aggerationFielMenu = document.getElementById("AggregationField");

  const TimeReporting = new TimeReporter();
  TimeReporting.JiraConnect();

  const ui = new UI();

  // add select optiions
  document.addEventListener("DOMContentLoaded", () => {
    TimeReporting.getDropMenusDATA().then((data) => {
      ui.addSelecttOptions(data.JiraProjects, "Project");
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

  function searchJiraUI() {
    let startDate = $("#datarange")
      .data("daterangepicker")
      .startDate.format("YYYY-MM-DD");
    let endDate = $("#datarange")
      .data("daterangepicker")
      .endDate.format("YYYY-MM-DD");

    TimeReporting.SearchJira(
      parseInt(ProjectValue.value),
      parseInt(StatusValue.value),
      parseInt(TypeValue.value),
      startDate,
      endDate
    ).then((data) => {
      document.getElementById("tbody").innerHTML = " ";
      ui.showTableData(
        UserValue.value,
        parseInt(aggerationFielMenu.value),
        data.JiraIssues
      );
    });
  }

  createReportBtn.addEventListener("click", () => {
    ui.showLoader();
    searchJiraUI();
  });
  exportbtn.addEventListener("click", () => {
    console.log("se");
    exportbtn.setAttribute(
      "href",
      "data:application/vnd.ms-excel," +
        escape(document.getElementById("example").outerHTML)
    );
    exportbtn.setAttribute("download", "export.xls");
  });

  aggerationFielMenu.addEventListener("change", () => {
    if (
      parseInt(aggerationFielMenu.value) === 1 ||
      parseInt(aggerationFielMenu.value) === 2
    ) {
      searchJiraUI();
      ui.showLoader();
    } else {
      ui.showFeedback("sorry, It is not implemented yet");
    }
  });
})();
