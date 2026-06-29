# Getting Started with Create React App and Redux

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

## Authentication Flow
The SignIn component uses `jwtAuthService.loginWithEmailAndPassword` to submit user credentials. This method makes an HTTP request, which should return the following object upon a successful sign-in:
```
{
    role: "ADMIN",
    displayName: "Watson Joyce",
    email: "watsonjoyce@gmail.com",
    photoURL: "/assets/images/face-7.jpg",
    token: "faslkhfh423oiu4h4kj432rkj23h432u49ufjaklj423h4jkhkjh"
}
```
The `jwtAuthService.loginWithEmailAndPassword` method also saves the token and user information in the browser's local storage. It sets the token in the Axios header so that future HTTP calls automatically include the token. The `setSession` and `setUser` methods of `jwtAuthService` are responsible for these tasks.

## AuthGuard
`AuthGuard` is used for protected routes in `routes.js`. This guard prevents unauthorized access. Ensure that unauthorized access to server APIs is also prevented.

## User Access control
Access control settings can be added in child route files. For example:
```
//app/views/dashboard/dashboardRoutes.js
{
    path: "/dashboard/v1",
    element: <DashboardV1 />,
    auth: authRoles.admin, // Only super admin and admin can access as authRoles.admin returns ['SA', 'ADMIN']
}
```





## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**