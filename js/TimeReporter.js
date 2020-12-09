// This is the first Block is responsible for connecting to the API
module.exports = class TimeReporter {
  constructor() {
    this.jira = null;
  }

  // We used the library of Jira-connecter to ease the work of dealing with the Jira Api insead of using node-fetch which is a bit complicated

  JiraConnect() {
    // creating a Jira instance
    var JiraClient = require("jira-connector");

    this.jira = new JiraClient({
      host: "127.0.0.1",
      port: 5000,
      protocol: "http", // proxy to pypass cors middleware becasue it is not possible to connect directly to another webiste that is not from the same origin
      path_prefix: "https://teamfalcon.atlassian.net/",
      strictSSL: false,
      basic_auth: {
        email: "hammoudkhalaf7@gmail.com",
        api_token: "Ups9dGVIAQnDVs3NTU2S74F9",
      },
    });
  }
  // This async function is responsible for populating the drop menus in the UI ( User, Status , Type ,Project)
  // get requests are sent to the Jira API through the Jira-connector to get the data needed
  // try and catch blocks are used to catch any errors while retrieving data

  async getDropMenusDATA() {
    try {
      var JiraProjects = await this.jira.project.getAllProjects();
    } catch (err) {
      console.log(err);
    }

    try {
      var JiraUsers = await this.jira.user.all({
        startAt: 0,
        maxResults: 50,
      });
    } catch (err) {
      console.log(err);
    }

    try {
      var JiraWorkflows = await this.jira.status.getAllStatuses();
    } catch (err) {
      console.log(err);
    }
    try {
      var JiraIssueTypes = await this.jira.issueType.getAllIssueTypes();
    } catch (err) {
      console.log(err);
    }

    return {
      JiraProjects,
      JiraWorkflows,
      JiraUsers,
      JiraIssueTypes,
    };
  }

  // This async function is used to search issue In the Jira website bases on the chosed values  In the UI
  // the usual node-fetch method is being used here because Jira-connecter was't working when trying to search for Issues
  async SearchJira(
    aggregationField,
    user,
    project,
    status,
    type,
    startDate,
    endDate
  ) {
    let assigneeQuery = "";

    /*                 these  if-else blocks simply aggregate the time logged of issues
                       if users chosen as an aggregation field , the User drop menu wil be checked 
                       if none is chosen , then the logged time of the issues which don't have an assingee will be aggregated
                       if  All is chosen from the user drop menu , then the time logged of only the issues which have an assignee will be aggregated
                       if a specific user is chosen , then then the time logged of only the issues which have an assignee equals to the chosed user will be aggregated
                    */
    if (aggregationField == 2) {
      if (user === "none") {
        assigneeQuery = " assignee is EMPTY AND"; // 0( value of the DOM element (option)) means -ALL- is chosen from the users drop menu
      } else if (user === "All") {
        // 2 ( value of the DOM element (option)) means -ALL- is chosen from the users drop menu
        assigneeQuery = " assignee is not EMPTY AND";
      } else {
        console.log("there is a user chosen");
        assigneeQuery = `assignee = ${user} AND `;
      }
    }
    let statusQuery = status == 0 ? " " : `status = ${status} AND  `; // status =0 or type = 0 means that the user has chosen All option on the drop menus of the UI ; which means the JQL query won't have the status or type fields
    let typeQuery = type == 0 ? " " : `type = ${type} AND  `;

    let encodeCreds = btoa("hammoudkhalaf7@gmail.com:Ups9dGVIAQnDVs3NTU2S74F9"); // encoding the email and the api_token to attch them in the GET request
    const fetch = require("node-fetch");
    let encodeuri = encodeURI(`http://127.0.0.1:5000/https://teamfalcon.atlassian.net/rest/api/2/search?jql= ${assigneeQuery}
                              project = ${project} AND ${typeQuery} ${statusQuery}  created >= ${startDate} AND created <= ${endDate}`); //

    console.log(
      ` ${assigneeQuery} project = ${project} AND ${typeQuery} ${statusQuery}  created >= ${startDate} AND created <= ${endDate}`
    );
    try {
      var JiraIssuesInfo = await fetch(encodeuri, {
        // sending the request with values to get the issues
        method: "GET",
        headers: {
          Authorization: "Basic " + encodeCreds,
        },
      });
    } catch (err) {
      console.log(err);
    }
    var JiraIssuesJson = await JiraIssuesInfo.json();
    var JiraIssues = await JiraIssuesJson.issues; // getting issues from the retrieved Json Data

    console.log(JiraIssues);
    return {
      JiraIssues,
    };
  }
};
