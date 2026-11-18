# PokéScout

A React and Vite Pokémon explorer, built as a static site and served by Nginx in Docker.

## Build and run with Docker

From the project directory:

```sh
docker build -t pokescout .
docker run -d --name pokescout --restart unless-stopped -p 8080:80 pokescout
```

Open `http://SERVER_ADDRESS:8080`. Change the host-side port in `-p` to a port available on your server. To update the deployment, rebuild the image, remove the old container with `docker rm -f pokescout`, then run the new image with the same `docker run` command.

## Deploy behind an existing reverse proxy

You can bind the container only to the server itself and let your existing proxy handle HTTPS and public traffic:

```sh
docker run -d --name pokescout --restart unless-stopped -p 127.0.0.1:8080:80 pokescout
```

Configure the proxy to forward the chosen local port to the container. Nginx serves the static app, supports SPA fallback, and caches built assets while revalidating `index.html`.

## Local development

```sh
npm ci
npm run dev
```

The browser fetches Pokémon data directly from PokéAPI, so users' browsers need access to `https://pokeapi.co`.
