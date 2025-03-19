# mechanism-of-distributed-processors

### How to Launch

1. Copy `.env.example` to `.env`.
2. Run the following command to install dependencies:
    ```bash
    npm install
    ```
3. Start the Docker containers with:
    ```bash
    docker-compose up
    ```
4. Compile all TypeScript files by running:
    ```bash
    npm run build
    ```
5. Initialize the database with:
    ```bash
    npm run prepare-db
    ```
6. Launch the script using:
    ```bash
    npm run start
    ```

**Note:** The DB admin UI is available at `http://localhost:5051/` after the third step.
