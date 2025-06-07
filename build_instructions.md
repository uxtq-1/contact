# Build Process and Deployment Instructions

This project uses [Vite](https://vitejs.dev/) as a build tool to optimize assets (HTML, CSS, JavaScript) for production and to provide a modern, fast development server.

## Purpose of a Build Process

A build process is essential for modern web development for several reasons:

*   **Minification:** Reduces the file size of HTML, CSS, and JavaScript by removing unnecessary characters (whitespace, comments) and shortening variable names. This leads to faster page load times.
*   **Bundling:** Combines multiple JavaScript or CSS files into fewer files, reducing the number of HTTP requests a browser needs to make, which also improves load times.
*   **Optimization:** Can include tree-shaking (removing unused code), image optimization, and other performance enhancements.
*   **Modern JavaScript Support:** Allows developers to use the latest JavaScript features and then transpile them (if necessary) to ensure compatibility with older browsers (though this project currently targets modern browsers).
*   **Developer Experience:** Vite provides a very fast development server with Hot Module Replacement (HMR), meaning changes in your code are reflected in the browser almost instantly without a full page reload.

## Prerequisites

Before you can build or run the development server, you need to have Node.js and npm (Node Package Manager) or yarn installed on your system.

*   **Node.js (which includes npm):** Download from [nodejs.org](https://nodejs.org/). It's recommended to use an LTS (Long Term Support) version.
*   **yarn (optional):** If you prefer yarn over npm, you can install it after Node.js: `npm install --global yarn`.

## Project Setup

1.  **Clone the Repository:**
    If you haven't already, clone the project repository to your local machine.
    ```bash
    # Example:
    # git clone https://your-repository-url.git
    cd your-project-directory
    ```

2.  **Navigate to Project Root:**
    Ensure your terminal or command prompt is in the root directory of the project (where `package.json` is located).

3.  **Install Dependencies:**
    This command reads the `package.json` file and installs the necessary development tools (like Vite) into a `node_modules` folder in your project.
    Using npm:
    ```bash
    npm install
    ```
    Or, if using yarn:
    ```bash
    yarn install
    ```

## Running the Development Server

To start the development server:

Using npm:
```bash
npm run dev
```
Or, if using yarn:
```bash
yarn dev
```

This command will typically:
*   Start a local web server (often at `http://localhost:5173` or another port if 5173 is busy).
*   Open your default web browser to this address.
*   Watch your source files for changes and automatically update the browser (Hot Module Replacement).
*   This mode is **not** optimized for production but is excellent for development.

## Building for Production

When you are ready to deploy your website, you need to create an optimized build:

Using npm:
```bash
npm run build
```
Or, if using yarn:
```bash
yarn build
```

This command will:
*   Invoke Vite to bundle and minify your HTML, CSS, and JavaScript.
*   Optimize images and other assets.
*   Output the processed files into a `dist/` directory in your project root.
*   The contents of this `dist/` directory are what you will deploy.

## Deployment

After running the `build` command, the `dist/` directory will contain all the static assets for your website, optimized for production.

1.  **Locate the `dist/` directory** in your project.
2.  **Deploy its contents:** Upload all files and folders *inside* the `dist/` directory to your web hosting provider (e.g., Netlify, Vercel, GitHub Pages, traditional shared hosting, VPS, etc.).
    *   Ensure your web server is configured to serve `index.html` as the default page for the root directory.
    *   If using a static hosting provider, they often detect `index.html` automatically.

**Example:** If you have `dist/index.html`, `dist/contact.html`, `dist/assets/main.js.[hash].js`, `dist/assets/index.css.[hash].css`, etc., all of these files and the `assets` folder from `dist/` should be uploaded to the root public directory of your web host.

By following these steps, you can efficiently develop and deploy an optimized version of the website.
