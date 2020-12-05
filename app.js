

// This is the first Block of the code ; it is responsible for connecting to the API  
class TimeReporter {
	constructor() {
		this.jira = null;

	}
	
	// We used the library of Jira-connecter to ease the work of dealing with the Jira Api insead of using node-fetch which is a bit complicated

	JiraConnect() {

		// creating a Jira instance
		var JiraClient = require("jira-connector");

		this.jira = new JiraClient({
			host: "cors-anywhere.herokuapp.com", // proxy to pypass cors middleware becasue it is not possible to connect directly to another webiste that is not from the same origin
			path_prefix: "https://teamfalcon.atlassian.net/",
			strictSSL: false,
			basic_auth: {
				email: "hammoudkhalaf7@gmail.com",
				api_token: "Ups9dGVIAQnDVs3NTU2S74F9"
			}
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
				maxResults: 50
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
			JiraIssueTypes
		};
	}

// This async function is used to search issue In the Jira website bases on the chosed values  In the UI
	// the usual node-fetch method is being used here because Jira-connecter was't working when trying to search for Issues
	async SearchJira(project, status, type, startDate, endDate) {

		let statusQuery = status == 0 ? " " : `status = ${status} AND  `; // status =0 or type = 0 means that the user has chosen All option on the drop menus of the UI ; which means the JQL query won't have the status or type fields
		let typeQuery = type == 0 ? " " : `type = ${type} AND  `;

		let encodeCreds = btoa("hammoudkhalaf7@gmail.com:Ups9dGVIAQnDVs3NTU2S74F9")// encoding the email and the api_token to attch them in the GET request
		const fetch = require('node-fetch');
		let encodeuri = encodeURI(`https://cors-anywhere.herokuapp.com/https://teamfalcon.atlassian.net/rest/api/2/search?jql= 
                            project = ${project} AND ${typeQuery} ${statusQuery}  created >= ${startDate} AND created <= ${endDate}`)

		console.log(`project = ${project} AND ${typeQuery} ${statusQuery}  created >= ${startDate} AND created <= ${endDate}`)
		try {
			var JiraIssuesInfo = await fetch(encodeuri, {  // sending the request with values to get the issues 
				method: 'GET',
				headers: {
					'Authorization': 'Basic ' + encodeCreds
				}
			})

		} catch (err) {
			console.log(err);
		}
		var JiraIssuesJson = await JiraIssuesInfo.json();
		var JiraIssues = await JiraIssuesJson.issues; // getting issues from the retrieved Json Data

		console.log(JiraIssues);
		return {
			JiraIssues
		}

	}
}

// This The UI class which is resppnsible for any thing that needs to be executed on the UI , it is totally seperated from The Searching in the Jira API
class UI {
	constructor() {
		this.loader = document.querySelector(".loader");// This loader element will be used In UI to be shown when user clicks (create Report) button and will be hidden when the data is retrieved from the Jira API
              // We used a library to get the dataPicker element in the UI to ease our work insead of hardcoding the datapicker
		$(function () {
			$('input[name="daterange"]').daterangepicker({
				opens: 'left'
			}, function (start, end, label) {
				console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
			});
		});
	}
       // this function is used to add the data retrieved from the API  to drop menus( HTML select elements) ( Status, Project,Type),
	addSelecttOptions(options, Component) {
		const component = document.getElementById(Component);
		let output = Component == "Project" ? "" : "<option value='0' selected>All</option>";// 
		options.forEach(option => {
			output += `<option value ="${option.id}">${option.name}</option>`;// the value of the option will be the ID , to be able to use later when the user choose an option form the select menu options
		});// the text content will be the name of the data ( status name, project name or type name) 
		component.innerHTML = output;
	}
            // this function is used to add the data retrieved from the API  to drop menu( HTML select elements) ( User),

	addUserOptions(options) {
		const user = document.getElementById("User");
		let output = "<option value='0' selected>none</option> <option value='2' selected>All</option>";
		options.forEach(option => {
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
		var minutes = Math.floor(seconds / (60));
		seconds -= minutes * (60);
		return ((0 < days) ? (days + " day, ") : "") + hours + "h, " + minutes + "m and " + seconds + "s"
	}
// This function is responsible for 
	showTableData(user, aggregationField, issues) {
		
		this.hideLoader();
		var timeLoggedin = 0;
		if (issues.length === 0) {
			this.showFeedback("no issues found. please, try to choose different options");
		} else {

			const moment = require("moment");

			for (var i = 0; i < issues.length; i++) {

				let assignee = issues[i].fields.assignee == null ? "Unassgined" : issues[i].fields.assignee.displayName;
				let estimated = this.formatDuration(issues[i].fields.aggregateprogress.total);
				let logged = this.formatDuration(issues[i].fields.aggregateprogress.progress);
				let remaining = this.formatDuration(issues[i].fields.aggregateprogress.total - issues[i].fields.aggregateprogress.progress);

				var row = document.createElement('tr');
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
							console.log("user is 0")
						}
					} else {
						if (user === issues[i].fields.assignee.accountId) {
							console.log("there is user chosen")

							timeLoggedin += issues[i].fields.aggregateprogress.progress;
						} else if (user === "2") {
							console.log("all users")

							timeLoggedin += issues[i].fields.aggregateprogress.progress;
						} else {
							console.log("there is a user chosen , but not this user")
						}
					}
				} else {
					timeLoggedin += issues[i].fields.aggregateprogress.progress;
				}
				document.getElementById("tbody").appendChild(row);
			}
		}
		document.getElementById("totalTime").textContent = this.formatDuration(timeLoggedin);

		$(document).ready(function () {
			$('#example').DataTable();
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
	    showLoader(){
	        this.loader.classList.add("showItem");
	    }
	     hideLoader(){
	        this.loader.classList.remove("showItem");
	    }

}
(function () {
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
		TimeReporting.getDropMenusDATA().then(data => {
			ui.addSelecttOptions(data.JiraProjects, "Project");
		});
		TimeReporting.getDropMenusDATA().then(data => {
			ui.addUserOptions(data.JiraUsers);
		});
		TimeReporting.getDropMenusDATA().then(data => {
			ui.addSelecttOptions(data.JiraWorkflows, "Status");
		});
		TimeReporting.getDropMenusDATA().then(data => {
			ui.addSelecttOptions(data.JiraIssueTypes, "Type");
		});
	});

	function searchJiraUI() {
		let startDate = $("#datarange").data('daterangepicker').startDate.format('YYYY-MM-DD');
		let endDate = $("#datarange").data('daterangepicker').endDate.format('YYYY-MM-DD');

		TimeReporting.SearchJira(parseInt(ProjectValue.value), parseInt(StatusValue.value), parseInt(TypeValue.value), startDate, endDate).then(data => {
            			document.getElementById("tbody").innerHTML = " ";
			ui.showTableData(UserValue.value, parseInt(aggerationFielMenu.value), data.JiraIssues)
		});
	}

	createReportBtn.addEventListener("click", () => {
        ui.showLoader();
		searchJiraUI();
	});
	exportbtn.addEventListener("click", () => {
	     console.log("se");
               exportbtn.setAttribute("href", 'data:application/vnd.ms-excel,' + escape(document.getElementById("example").outerHTML));
               exportbtn.setAttribute("download", "export.xls"); 
	});


	aggerationFielMenu.addEventListener("change", () => {
		if (parseInt(aggerationFielMenu.value)===1 || parseInt(aggerationFielMenu.value)===2){
			searchJiraUI();
			ui.showLoader();
		}else{
			ui.showFeedback("sorry, It is not implemented yet");
		}
		
	});




})();
