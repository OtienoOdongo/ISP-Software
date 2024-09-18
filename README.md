
# Interlink

Interlink is a web application that allows users in remote areas to purchase and utilize internet services through Starlink. This MVP (Minimum Viable Product) provides users with daily, weekly, and monthly internet data bundles. Users can easily purchase these plans via the landing page and pay through MPesa. The admin panel allows for seamless management of users, plans, payments, and network monitoring.


# Table of Contents

* Project Overview
* Features
* Technology Stack
* API Documentation
* Installation
* Usage
* Testing
* Contributing
* License
* Contact

## Project Overview

Interlink provides internet reselling capabilities, using Starlink for remote connectivity. Users can visit the landing page to view available plans, features, and contact details. The application also integrates MPesa for secure payments, and users can access internet immediately after payment confirmation. Only the admin has access to the dashboard for managing orders, payments, and network status.

## Features

* Landing Page:
    * View internet plans (Daily, Weekly, Monthly)
    * Explore app features
    * Contact section for inquiries
* Payment System:
    * Integration with MPesa for seamless payments
* Admin Dashboard:
    * Manage users, orders, and payments
    * View data usage and Starlink network performance
    * Generate reports on usage and payments
* Responsive Design:
    * Fully responsive and mobile-friendly interface using Tailwind CSS.

## Technology Stack

**Front End:**

    * ReactJS – A JavaScript library for building user interfaces
    * Tailwind CSS – A utility-first CSS framework for fast UI development
    
**Back End:**

    * Flask – A lightweight Python web framework
    * MySQL – A relational database for storing user, order, and payment data

**Testing & Tools:**

    * Postman – API testing tool for validating endpoints and requests
    * SQLAlchemy – (Optional) ORM for managing MySQL queries






## API Documentation & Reference

1. User Endpoints (No Sign-in for Users)


#### Get All Plans

```http
  GET  /api/v1/plans
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `None` |  | **Required**. Retrieves all available internet plans (daily, weekly, monthly) |

  * Description: Users can view all available plans on the landing page.


### Create a New Order

```http
  POST /api/v1/orders
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `plan_id` | `string` | **Required**. The ID of the selected plan.|
| `user_phone` | `string` | **Required**. The phone number of the use.|

  * Description: Users can create a new order when they purchase an internet plan. This endpoint initiates the order when users click the "Buy Now" button.
  * Response: Confirms the order and provides details.

### Process Payment via MPesa

```http
  POST /api/v1/payments/mpesa
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `oder_id` | `string` | **Required**. The ID of the related order..|
| `amount` | `number` | **Required**. The total amount to be paid.|
| `phone_number` | `string` | **Required**. The user's phone number for payment processing.|
  * Description: This endpoint processes the payment through MPesa.
  * Response: Confirms payment status and provides a receipt or payment ID.

### Confirm Payment

```http
   POST /api/v1/orders/:id/confirm-payment
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. The ID of the related order. |
  * Description: Confirms payment after the MPesa transaction. Automatically invoked after payment confirmation to activate the purchased plan.


2. Admin Endpoints (For The Dashboard)

## User Management

### Get All Users

```http
   GET /api/v1/admin/users
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `None` |  | **Required**. Retrieves a list of all users. |
  * Description: Allows the admin to view all users interacting with the service.

### Get User by ID

```http
     GET /api/v1/admin/users/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. The ID of the user to fetch. |
  * Description: Retrieves the details of a specific user.

### Delete a User


```http
       DELETE /api/v1/admin/users/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. The ID of the user to delete. |
  * Description: Deletes a specific user from the system.


## Plan Management

### Create a New Plan

```http
       POST /api/v1/admin/plans
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `name` | `string` | **Required**. The name of the new plan. |
| `description` | `string` | **Required**.  A brief description of the plan. |
| `price` | `number` | **Required**. The price of the plan. |
| `data_limit` | `number` | **Required**. The data limit of the plan (in GB). |
| `duration` | `string` | **Required**. Duration of the plan (e.g., daily, weekly, monthly)|
  * Description: Allows the admin to create a new data plan.

### Update an Existing Plan

```http
       PUT /api/v1/admin/plans/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. The ID of the plan to update. |
| `name` | `string` | **Required**.  The updated name of the plan. |
| `description` | `string` | **Required**. he updated description of the plan. |
| `price` | `number` | **Required**. The updated price of the plan. |
| `data_limit` | `number` | **Required**. The updated data limit of the plan.|
| `duration` | `string` | **Required**. The updated duration of the plan.|
  * Description: Allows the admin to modify an existing plan.

### Delete a Plan


```http
        DELETE /api/v1/admin/plans/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. The ID of the plan to delete. |
  * Description: Allows the admin to delete a specific data plan.

## Order Management

### Get All Orders

```http
        GET /api/v1/admin/orders
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `None` |  | **Required**. Retrieves a list of all orders placed by users.|
  * Description: Allows the admin to track all user orders.

### Get Order Details by ID

```http
        GET /api/v1/admin/orders/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. The ID of the order to fetch. |
  * Description: Retrieves the details of a specific order.

### Update Order Status

```http
       PUT /api/v1/admin/orders/:id/status
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. The ID of the order to update. |
| `status` | `string` | **Required**. The new status of the order (e.g., "processing", "completed"). |
  * Description: Allows the admin to manually update the status of an order.


## Network & Data Usage Management

### Get Network Status

```http
        GET /api/v1/admin/network-status
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `None` |  | **Required**. Retrieves the real-time status of the Starlink network. |
  * Description: Allows the admin to monitor network performance, connection strength, and uptime.


### Get User Data Usage

```http
        GET /api/v1/admin/users/:id/data-usage
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. The ID of the user to fetch data usage for. |
  * Description: Allows the admin to view a user's data usage.

### Adjust Network Settings

```http
         POST /api/v1/admin/network-settings
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `user_id` | `string` | **Required**. The ID of the user to adjust settings for. |
| `bandwidth_limit` | `number` | **Required**. The new bandwidth limit for the user. |
  * Description: Allows the admin to manage bandwidth allocation and other network settings using the Starlink API.


## Analytics & Reporting

### Generate Data Usage Reports

```http
         GET /api/v1/admin/reports/usage
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `None` |  | **Required**. Generates a report on overall data usage. |
  * Description: Provides insights into how the network is being used.


## Payment Management

### Get All Payments

```http
           GET /api/v1/admin/payments
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `None` |  | **Required**. Retrieves a list of all payments processed via MPesa. |
  * Description: Allows the admin to track all payments and transactions.

### Get Payment Details by ID

```http
           GET /api/v1/admin/payments/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. The ID of the payment to fetch. |
  * Description: Retrieves details of a specific payment transaction.


## Authentication

### Admin Login

```http
           POST /api/v1/admin/login
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required**. The admin's username. |
| `password` | `string` | **Required**. The admin's password. |
  * Description: Authenticates the admin and grants access to the dashboard.


## Installation

**Prerequisites:**
  * Node.js (v14 or later)
  * Yarn (v1.22.10 or later)

**Setup**

**Install React using Vite and Yarn**

1. **Clone the Repository:**

```bash
  git clone https://github.com/yourusername/ISP-Software.git
  cd ISP-Software
```

2. **Frontend Setup:**
  * Navigate to frontend directory

```bash
  clinton@DESKTOP-A5CII7B:~/ISP-Software$ cd Front-End
  clinton@DESKTOP-A5CII7B:~/ISP-Software/Front-End$
```

  * Create a new React project using Vite

  ```bash
  clinton@DESKTOP-A5CII7B:~/ISP-Software/Front-End$ yarn create vite .
```

  * When prompted, select React as the framework and JavaScript or TypeScript as per your preference.

  * Install project dependencies

   ```bash
  clinton@DESKTOP-A5CII7B:~/ISP-Software/Front-End$ yarn 
```

 3. **Install and Configure Tailwind CSS**
 
  * Install Tailwind CSS and its dependencies

   ```bash
  clinton@DESKTOP-A5CII7B:~/ISP-Software/Front-End$ yarn add -D tailwindcss postcss autoprefixer 
```

  * Generate the tailwind.config.js and postcss.config.js files

   ```bash
  clinton@DESKTOP-A5CII7B:~/ISP-Software/Front-End$ npx tailwindcss init -p
```

  * In the tailwind.config.js file, configure the content paths to include all relevant files:

  ```bash
  module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

```

  * Add Tailwind's directives to your ./src/index.css file:

   ```bash
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
```

  * Run the Development Server

  
   ```bash
  clinton@DESKTOP-A5CII7B:~/ISP-Software/Front-End$ yarn dev 



  yarn run v1.22.21
$ vite

  VITE v5.4.6  ready in 1983 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

```
 



    
## Running Tests

To test the API:

```bash
 Open Postman
 Import the Postman collection in the repository.
 Test endpoints by interacting with them (e.g., creating orders, processing payments).
 
```


## License

This project is licensed under the MIT License. See the
[MIT](https://choosealicense.com/licenses/mit/) file for more details.


## Authors

- [@OtienoOdongo](https://www.github.com/OtienoOdongo)


## Contacts

If you have any questions or suggestions about the project, feel free to contact the project maintainer:

* **Name:** `Clinton Odongo`
* **Email:** `Clinton.Odongo@outlook.com`
* **Github:** `OtienoOdongo`