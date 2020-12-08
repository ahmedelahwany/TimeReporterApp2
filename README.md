# Time Reporter APP for Jira made by TEAM FALCON

In Jira cloud there are very limited possibilities to track the invested time of a team on a project. We want to help team members and managers to be able to track and get insights into time usage. Our easy to use application helps organizations to successfully deliver projects.

## Installation

The package manager [npm](https://www.npmjs.com/) and [node js](https://nodejs.org/en/) have to be usef to install The TimeReporter app.
Before opening the index.html file to run the site , It is a must to run these three commands in the app directory to install the packages required for the app and build the application . Then, everything is fine.



The first command is for installing the dependecies required for the application.
```bash
npm install
```

The second command is for building the application and creating bundle.js file.
```bash
npm run build
```
The third command is for listening on host 127.0.0.1 and port 5000 and running cors-anywhere (proxy) which is responsible for creating headers in the requests between two servers that don't have the same origin ; this allows limitless requests to the API by the end-user.
```bash
node js/ProxyOnlocalHost.js
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
