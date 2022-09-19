# Lite List

## Description

_Duration: 30 Hours_

Welcome to Lite List!

This is a basic to-do list application. It helps keep track of tasks that need to be completed and previously completed tasks! Your tasks listed on the main screen in a table format on desktop or large enough screens. Tablet/mobile screen sizes use a single column format. Tasks may be added and edited from the main screen on either version. Clicking the add button or edit button will open a add or edit form at the top of the page. You will be moved to the top if you click an edit button wiht the top of the list not in view. This application utilizes a database to make sure your data is persistent. Each task has a name, description, a due date, indicator for complete or in progress, date completed, and the date added. Tasks all have own buttons for edit mode on that task, mark that task complete and delete the task. Marking complete will add the current date by default as the complete date (you may edit date complete in edit mode). If you unmark complete, the complete date is cleared out. Toggling complete or not will update the main background color to indicate complete or not. When adding a new task, the current date is added as the date added. There are multiple sort options. Desktop and mobile versions both have a drop down select sort options. The desktop also has two sort options in the table headings, indicated by up/down arrows. These toggle the opposite order as they are clicked.

<!-- To see the fully functional site, please visit: [DEPLOYED VERSION OF APP](www.heroku.com) -->

## Screen Shot

<img src='./server/public/img/Screen Shot 2022-09-19 at 8.08.53 AM.jpg'>
<img src='./server/public/img/Screen Shot 2022-09-19 at 8.09.15 AM.jpg'>
<img src='./server/public/img/Screen Shot 2022-09-19 at 8.09.30 AM.jpg'>
<img src='./server/public/img/Screen Shot 2022-09-19 at 8.09.45 AM.jpg'>
<img src='./server/public/img/Screen Shot 2022-09-19 at 8.09.57 AM.jpg'>
<img src='./server/public/img/Screen Shot 2022-09-19 at 8.10.20 AM.jpg'>
<img src='./server/public/img/Screen Shot 2022-09-19 at 8.10.28 AM.jpg'>
<img src='./server/public/img/Screen Shot 2022-09-19 at 8.10.39 AM.jpg'>
<img src='./server/public/img/Screen Shot 2022-09-19 at 8.10.50 AM.jpg'>
<img src='./server/public/img/Screen Shot 2022-09-19 at 8.11.03 AM.jpg'>
<img src='./server/public/img/Screen Shot 2022-09-19 at 8.11.12 AM.jpg'>

### Prerequisites

Link to software that is required to install the app (e.g. node).

- [Node.js](https://nodejs.org/en/)
- [PostgreSQL](https://www.postgresql.org)

## Installation

1. Clone Repo
2. Create database called 'weekend-to-do-app' in [PostgreSQL](https://www.postgresql.org)
3. Use SQL in database.sql from Repo to create required tables ([Postico](https://eggerapps.at/postico/))recommended to setup table)
4. Run 'npm install'
5. Run 'npm start'
6. Open 'localhost:5000' in a modern browser (Chrome, Firefox preferred)

## Usage
How does someone use this application? Tell a user story here.

1. If database is setup and app running in browser, start adding tasks!
2. Use the Add Button to create new taks.
3. Manage your existing tasks.
4. Use the Edit button associated with each task to make changes as needed. (Current information is pre-filled in the inputs)
5. Use the Delete button associated with each task to remove tasks from app and database (cannot be undone).
6. Mark tasks complete as they are finished.
7. Re-click the Mark Complete button to mark as not complete and clear the complete date.


## Built With

 - HTML
 - CSS
 - Javascript
 - jQuery
 - PG.js
 - Express.js
 - PostgresSQL
 - Postico
 - Postman
 - Sweet Alerts
 - Git
 - GitHub
 - VScode

## License

- Free to use

## Acknowledgement
 - Thank you to [Emerging Digital Academy](http://emergingacademy.org/) for the skills to make this calculator!
 - Thanks to [express.js](https://expressjs.com) for the ability to create a server and run the calculator.
 - Thanks to [pg.js](https://www.npmjs.com/package/pg) for being able to connect my database to the server.
 - Thanks to [icons8](https://icons8.com) for the nice icons used.
 - Thanks to [unSplash](https://unsplash.com) for nice background images.
 - Thanks to [Coolors.co](https://coolors.co/) for the color palette used.
 - Thanks to [W3 SChools](https://www.w3schools.com) for the refernce material on HTML, Javascript and CSS.
 - Thanks to [Mozilla](https://developer.mozilla.org/en-US/) for the in-depth reference material when a deeper understanding is need.

## Support
If you have suggestions or issues, please email [me!](ddvetter23@gmail.com)