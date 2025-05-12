# Project Name

> Brief description of what your SvelteKit application does, who it's for, and key features.

## Table of Contents

- [Project Name](#project-name)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Demo](#demo)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
    - [Authenitcation](#authenitcation)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
  - [Developing](#developing)
  - [Building](#building)
    - [Installation](#installation)
    - [Running the Application](#running-the-application)
  - [Project Structure](#project-structure)
  - [Configuration](#configuration)
  - [Deployment](#deployment)
  - [Testing](#testing)
  - [Contributing](#contributing)
  - [TODO](#todo)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)

## Overview

Provide a high-level overview of your project, detailing the problem it solves or the functionality it provides. Clearly state the main objectives and outcomes.

## Demo

Include a link or embed a screenshot/gif showcasing your application in action.

## Features

* List the primary features of your application
* Clearly state unique functionalities or integrations

## Technologies Used

* **SvelteKit**: Frontend framework
* **Tailwind CSS**: CSS framework
* **Flowbite**: Component library (if used)
* **TypeScript** (optional but recommended)
* **Prisma / Supabase / Firebase / AWS Amplify** (if backend integration exists)
* List other libraries or services

### Authenitcation
Currently uses AWS Cognito with Grant Authorization and PKCE

## Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/) (recommended version: v20.x or newer)
* [npm](https://www.npmjs.com/) (comes with Node.js)

## Getting Started
## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

Install the dependencies:

```bash
npm install
```

### Running the Application

To start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Project Structure

Provide an overview of your project's directory structure:

```
src/
├── lib/
├── routes/
├── app.html
├── app.d.ts
└── hooks.server.ts
static/
├── favicon.png
└── robots.txt
.env
package.json
svelte.config.js
```

Explain any key files or directories briefly.

## Configuration

Describe any environment variables required, and provide an example `.env` file:

```env
PUBLIC_API_URL=https://api.example.com
SECRET_KEY=your-secret-key
```

## Deployment

Detail how to deploy your application. Common deployment platforms for SvelteKit applications include:

* **Vercel**
* **Netlify**
* **AWS Amplify**

Provide step-by-step instructions or link to relevant documentation.

## Testing

Explain how to run tests if your application includes unit or end-to-end tests:

```bash
npm run test
```

Mention testing frameworks or tools you're using (Vitest, Playwright, Cypress).

## Contributing

State clearly how users can contribute to your project:

* Fork the repository
* Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
* Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
* Push to the Branch (`git push origin feature/AmazingFeature`)
* Open a Pull Request

## TODO
- Websockets should use a Cognito Authorizer to connect
- At the moment, every user receives all changes in the table. They should only receive changes for items that belong to the user

## License

Specify your project's license clearly. Example:

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgments

List any resources, libraries, tutorials, or people who helped you build this project.
