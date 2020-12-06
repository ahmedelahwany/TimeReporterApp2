// This The UI class which is resppnsible for any thing that needs to be executed on the UI , it is totally seperated from The Searching in the Jira API

module.exports = class UI {
  constructor() {
    this.loader = document.querySelector(".loader"); // This loader element will be used In UI to be shown when user clicks (create Report) button and will be hidden when the data is retrieved from the Jira API
    // We used a library to get the dataPicker element in the UI to ease our work insead of hardcoding the datapicker
    $(function () {
      $('input[name="daterange"]').daterangepicker(
        {
          opens: "left",
        },
        function (start, end, label) {
          console.log(
            "A new date selection was made: " +
              start.format("YYYY-MM-DD") +
              " to " +
              end.format("YYYY-MM-DD")
          );
        }
      );
    });
  }
  // this function is used to add the data retrieved from the API  to drop menus( HTML select elements) ( Status, Project,Type),
  addSelecttOptions(options, Component) {
    const component = document.getElementById(Component);
    let output =
      Component == "Project" ? "" : "<option value='0' selected>All</option>"; //
    options.forEach((option) => {
      output += `<option value ="${option.id}">${option.name}</option>`; // the value of the option will be the ID , to be able to use later when the user choose an option form the select menu options
    }); // the text content will be the name of the data ( status name, project name or type name)
    component.innerHTML = output;
  }
  // this function is used to add the data retrieved from the API  to drop menu( HTML select elements) ( User),

  addUserOptions(options) {
    const user = document.getElementById("User");
    let output =
      "<option value='0' selected>none</option> <option value='2' selected>All</option>";
    options.forEach((option) => {
      output += `<option value ="${option.accountId}">${option.displayName}</option>`;
    });
    user.innerHTML = output;
  }
  // This function  (we Got it from the Internet) is used to convert seconds to days , hours , minutes and seconds. It is used to convert the estimated , remaining and logged time of the issues
  //we tried to use some libraries instead of this function, but they weren't work fine
  formatDuration(seconds) {
    var days = Math.floor(seconds / (24 * 60 * 60));
    seconds -= days * (24 * 60 * 60);
    var hours = Math.floor(seconds / (60 * 60));
    seconds -= hours * (60 * 60);
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return (
      (0 < days ? days + " day, " : "") +
      hours +
      "h, " +
      minutes +
      "m and " +
      seconds +
      "s"
    );
  }
  // This function is responsible for
  showTableData(user, aggregationField, issues) {
    this.hideLoader();
    var timeLoggedin = 0;
    if (issues.length === 0) {
      this.showFeedback(
        "no issues found. please, try to choose different options"
      );
    } else {
      const moment = require("moment");

      for (var i = 0; i < issues.length; i++) {
        let assignee =
          issues[i].fields.assignee == null
            ? "Unassgined"
            : issues[i].fields.assignee.displayName;
        let estimated = this.formatDuration(
          issues[i].fields.aggregateprogress.total
        );
        let logged = this.formatDuration(
          issues[i].fields.aggregateprogress.progress
        );
        let remaining = this.formatDuration(
          issues[i].fields.aggregateprogress.total -
            issues[i].fields.aggregateprogress.progress
        );

        var row = document.createElement("tr");
        row.innerHTML = `
                    <td>${issues[i].key}</td>
                    <td>${issues[i].fields.summary}</td>
                    <td>${issues[i].fields.status.name}</td>
                    <td>${assignee}</td>
                    <td>${estimated}</td>
                    <td>${remaining}</td>
                     <td>${logged}</td>
                    `;
        if (aggregationField === 2) {
          if (issues[i].fields.assignee === null) {
            if (user === "0") {
              timeLoggedin += issues[i].fields.aggregateprogress.progress;
              console.log("user is 0");
            }
          } else {
            if (user === issues[i].fields.assignee.accountId) {
              console.log("there is user chosen");

              timeLoggedin += issues[i].fields.aggregateprogress.progress;
            } else if (user === "2") {
              console.log("all users");

              timeLoggedin += issues[i].fields.aggregateprogress.progress;
            } else {
              console.log("there is a user chosen , but not this user");
            }
          }
        } else {
          timeLoggedin += issues[i].fields.aggregateprogress.progress;
        }
        document.getElementById("tbody").appendChild(row);
      }
    }
    document.getElementById("totalTime").textContent = this.formatDuration(
      timeLoggedin
    );

    $(document).ready(function () {
      $("#example").DataTable();
    });
  }
  showFeedback(text) {
    const feedback = document.querySelector(".feedback");
    feedback.classList.add("showItem");
    feedback.innerHTML = `<p>${text}</p>`;

    setTimeout(() => {
      feedback.classList.remove("showItem");
    }, 5000);
  }
  showLoader() {
    this.loader.classList.add("showItem");
  }
  hideLoader() {
    this.loader.classList.remove("showItem");
  }
};
