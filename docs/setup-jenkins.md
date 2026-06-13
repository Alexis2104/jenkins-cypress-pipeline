# Jenkins Setup Guide

End-to-end setup guide for running the `jenkins-cypress-pipeline` project with Jenkins LTS and Docker.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Docker Desktop | 24.x or later |
| Docker Compose | v2 (included with Docker Desktop) |
| Git | Any recent version |

> **Windows note:** Docker Desktop must be running before executing any `docker compose` command. Ensure the Docker socket is accessible (`/var/run/docker.sock` is emulated by Docker Desktop on Windows/Mac).

---

## 1. Start Jenkins

Clone the repository and start the stack:

```bash
git clone https://github.com/Alexis2104/jenkins-cypress-pipeline.git
cd jenkins-cypress-pipeline
docker compose up -d --build
```

The first build takes 2–4 minutes while Docker downloads the Jenkins LTS image and installs Docker CLI inside it. Subsequent starts are near-instant.

Check that Jenkins is running:

```bash
docker compose ps
# jenkins   running   0.0.0.0:8080->8080/tcp
```

Open Jenkins at **http://localhost:8080**.

---

## 2. Initial Admin Setup

Retrieve the one-time admin password:

```bash
docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Paste the password in the browser, then:

1. Click **Install suggested plugins** and wait for the installation to complete.
2. Create the first admin user (e.g., `admin` / choose a strong password).
3. Accept the default Jenkins URL (`http://localhost:8080/`) and click **Save and Finish**.

---

## 3. Install Required Plugins

Navigate to **Manage Jenkins → Plugins → Available plugins** and install:

| Plugin | Purpose |
|---|---|
| **Docker Pipeline** (`docker-workflow`) | Enables `agent { docker { ... } }` in declarative pipelines |
| **JUnit** (`junit`) | Publishes XML test results from `cypress/results/*.xml` |

After selecting both, click **Install** and check **Restart Jenkins when installation is complete**.

> The **Git** and **Pipeline** plugins are pre-installed with the suggested plugins bundle.

---

## 4. Create the Pipeline Job

1. From the Jenkins dashboard, click **New Item**.
2. Enter the name `jenkins-cypress-pipeline`, select **Pipeline**, and click **OK**.
3. In the job configuration:
   - **General → Discard old builds:** Keep max 10 builds (matches `buildDiscarder` in the Jenkinsfile).
   - **Build Triggers → GitHub hook trigger for GITScm polling:** Check this box (required for the webhook in Step 5).
4. Scroll to **Pipeline → Definition:** select **Pipeline script from SCM**.
   - **SCM:** Git
   - **Repository URL:** `https://github.com/Alexis2104/jenkins-cypress-pipeline.git`
   - **Branches to build:** `*/develop`
   - **Script Path:** `Jenkinsfile`
5. Click **Save**.

Run a first manual build: click **Build Now** and watch the **Console Output** to confirm all 5 stages (Checkout → Lint → Build → Test → Report) complete successfully.

---

## 5. Configure the GitHub Webhook

The webhook tells GitHub to notify Jenkins on every push to `develop`, triggering an automatic build.

### 5a. Expose Jenkins publicly (local dev)

If Jenkins is running on `localhost`, GitHub cannot reach it. Use **ngrok** to create a public tunnel:

```bash
# Install ngrok from https://ngrok.com/download, then:
ngrok http 8080
# Note the forwarding URL, e.g.: https://abc123.ngrok-free.app
```

### 5b. Add the webhook in GitHub

1. Go to your repository on GitHub → **Settings → Webhooks → Add webhook**.
2. Fill in the form:
   - **Payload URL:** `https://<your-jenkins-url>/github-webhook/`  
     *(ngrok URL in local dev, or your server's public IP/domain in production)*
   - **Content type:** `application/json`
   - **Which events:** `Just the push event`
3. Click **Add webhook**. GitHub will send a ping — you should see a green checkmark.

### 5c. Verify

Push a commit to `develop` and confirm a new build starts automatically in Jenkins.

---

## Pipeline Stages Reference

| Stage | What it does |
|---|---|
| **Checkout** | Clones the repository via `checkout scm` |
| **Lint** | Runs `npm run lint` (ESLint + eslint-plugin-cypress) |
| **Build** | Runs `npm ci` for a clean install, then `npx cypress verify` |
| **Test** | Runs `npx cypress run --browser electron` (headless); marks build UNSTABLE on failures |
| **Report** | Archives `cypress/videos` and `cypress/screenshots`; publishes JUnit XML from `cypress/results` |

The `post { always }` block archives videos/screenshots and cleans the workspace regardless of build outcome.

---

## Troubleshooting

**`docker: command not found` inside Jenkins container**

The `jenkins.Dockerfile` installs `docker.io` and adds `jenkins` to the `docker` group. If you see this error, rebuild the image:

```bash
docker compose build --no-cache
docker compose up -d
```

**`Permission denied` on `/var/run/docker.sock`**

The `docker-compose.yml` sets `user: root` for the Jenkins service. If you changed it, revert to `user: root` or adjust the Docker socket permissions on the host.

**Tests fail in CI but pass locally**

Check that `CYPRESS_CACHE_FOLDER` is set to `/root/.cache/Cypress` in the pipeline environment — this points to the binary pre-installed in the `cypress/included` image, avoiding a re-download.
