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
  /* This function is responsible for displaying the Issues retrieved from the API 
   It also aggregates the time logged depending on the aggregation fild chosen from the drop menu
   It aggregates by default by issues ; this means that all the time logged for the issues will be added together 
   whether the issue has an assignee or not .
   If Users had been chosen as an aggregation filed , then depending on the user (assignee) chosen form the user drop menu,
   the time looged will be added 
    This function always displays the whole issues in the Jira depending on the project , Type and statuse filters , no matter what is the aggregation field or the user drop menu contains
    
  */
  showTableData(user, aggregationField, issues) {
    this.hideLoader();
    var timeLoggedin = 0;
    if (issues.length === 0) {
      // no issues found fo the selected options
      this.showFeedback(
        "no issues found. please, try to choose different options"
      );
    } else {
      for (var i = 0; i < issues.length; i++) {
        let assignee =
          issues[i].fields.assignee == null
            ? "Unassgined"
            : issues[i].fields.assignee.displayName; // assignee name
        let estimated = this.formatDuration(
          issues[i].fields.aggregateprogress.total // estimated time of the issue from the time trackng field
        );
        let logged = this.formatDuration(
          issues[i].fields.aggregateprogress.progress // logged time of the issue from the time trackng field
        );
        let remaining = this.formatDuration(
          issues[i].fields.aggregateprogress.total -
            issues[i].fields.aggregateprogress.progress // remainning time of the issue  (estimated - logged)
        );
        // making rows for the table in the HTML document and putting the fields inside them
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

        /*these nested if-else blocks simply aggregate the time logged of issues
                       if users chosen as an aggregation field , the User drop menu wil be checked 
                       if none is chosen , then the logged time of the issues which don't have an assingee will be aggregated
                       if  All is chosen from the user drop menu , then the time logged of only the issues which have an assignee will be aggregated
                       if a specific user is chosen , then then the time logged of only the issues which have an assignee equals to the chosed user will be aggregated
                    */
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
              // 2 ( value of the DOM element (option)) means -ALL- is chosen from the users drop menu
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
      timeLoggedin // coverting time to be displayed in a a form of days , hours , minutes and seconds
    );

    $(document).ready(function () {
      $("#example").DataTable(); // preparting the table for the data
    });
  }
  // this function show a a feedback In the UI in a form of a DOM element
  // It is used to make a bit of interaction with the user
  showFeedback(text) {
    const feedback = document.querySelector(".feedback");
    feedback.classList.add("showItem");
    feedback.innerHTML = `<p>${text}</p>`;

    setTimeout(() => {
      feedback.classList.remove("showItem");
    }, 6000);
  }

  // a loader image (gif media type) that will be diplayed while the app making a GET request to get the data and will be hidden once the data is retireved
  showLoader() {
    this.loader.classList.add("showItem");
  }
  hideLoader() {
    this.loader.classList.remove("showItem");
  }
};
