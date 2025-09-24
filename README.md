# ElimuPlan: CBC Scheme of Work Generator

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Araptoo/generated-app-20250924-110355)

ElimuPlan is a visually stunning and intuitive web application designed for Kenyan educators. It streamlines the creation of CBC (Competency-Based Curriculum) Schemes of Work by intelligently parsing curriculum design documents from a provided Google Drive link. The application features a minimalist, clean interface that guides the user through a simple three-step process: inputting a link, customizing parameters like term and weeks, and generating a beautifully formatted, ready-to-use Scheme of Work.

The focus is on exceptional user experience, with smooth animations, clear visual hierarchy, and a design that makes a tedious task feel effortless and elegant.

## Key Features

-   **Intelligent Parsing**: Generates schemes of work directly from a Google Drive link to a curriculum design document.
-   **Simple User Flow**: A guided, three-step process makes generation quick and intuitive.
-   **Customization**: Easily configure parameters such as Grade, Subject, Term, and the number of weeks.
-   **Beautiful Output**: Produces a clean, well-structured, and professional Scheme of Work.
-   **Export Options**: Print the generated scheme or download it as a PDF.
-   **Modern UI/UX**: A minimalist, responsive design with light and dark modes for a delightful user experience.

## Technology Stack

-   **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
-   **Backend**: Cloudflare Workers, Hono
-   **Animations & Icons**: Framer Motion, Lucide React
-   **Forms & State**: React Hook Form, Zod
-   **Deployment**: Cloudflare Pages & Workers

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/) package manager
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for Cloudflare development

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/elimu-plan.git
    cd elimu-plan
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

### Running Locally

This project uses Vite for the frontend and a Cloudflare Worker for the backend.

1.  **Start the Vite development server for the frontend:**
    This will run the React application on `http://localhost:3000` (or another available port).
    ```sh
    bun dev
    ```

2.  **For full-stack development, run the Cloudflare Worker locally:**
    This command starts a local server that simulates the Cloudflare environment, allowing you to test the Hono API endpoints.
    ```sh
    wrangler dev
    ```

## Project Structure

The codebase is organized into three main directories:

-   `src/`: Contains the entire frontend React application, including pages, components, hooks, and styles.
-   `worker/`: Houses the Cloudflare Worker backend code, built with Hono. All API routes and logic are defined here.
-   `shared/`: Includes TypeScript types and interfaces that are shared between the frontend and the backend to ensure type safety.

## Development

### Frontend

-   **Pages**: Add new pages in the `src/pages` directory.
-   **Components**: Create reusable components in `src/components`. We use `shadcn/ui`, so prefer using existing UI components from `src/components/ui`.
-   **API Calls**: Use the pre-configured `api` client in `src/lib/api-client.ts` to make requests to the backend.

### Backend

-   **API Routes**: Add new API endpoints in `worker/user-routes.ts`. The Hono app instance is passed to this file, where you can define new routes.
-   **Types**: Ensure any new request/response body types are defined in `shared/types.ts` to be accessible by the frontend.

## Deployment

This project is designed for seamless deployment to the Cloudflare ecosystem.

1.  **Login to Cloudflare:**
    If you haven't already, authenticate the Wrangler CLI with your Cloudflare account.
    ```sh
    wrangler login
    ```

2.  **Deploy the application:**
    The `deploy` script in `package.json` handles building the frontend and deploying both the static assets (to Cloudflare Pages) and the worker function.
    ```sh
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Araptoo/generated-app-20250924-110355)

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.