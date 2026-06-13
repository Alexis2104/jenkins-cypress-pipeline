pipeline {
    agent {
        docker {
            // cypress/included trae Node, Cypress binario y dependencias de sistema
            // --ipc=host es necesario para Electron/Chrome headless
            // --entrypoint="" sobreescribe el ENTRYPOINT de la imagen para que Jenkins
            //   pueda ejecutar comandos de shell arbitrarios
            image 'cypress/included:13.17.0'
            args  '--ipc=host --entrypoint=""'
        }
    }

    environment {
        // Evita re-descargar el binario de Cypress (ya está en la imagen)
        CYPRESS_INSTALL_BINARY = '0'
        CYPRESS_CACHE_FOLDER   = '/root/.cache/Cypress'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Evita el checkout implícito que Jenkins hace antes del primer stage;
        // el checkout explícito en la etapa Checkout es el único que corre.
        skipDefaultCheckout()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Rama: ${env.GIT_BRANCH} — Commit: ${env.GIT_COMMIT?.take(8)}"
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build') {
            steps {
                // npm ci garantiza instalación limpia y reproducible desde package-lock.json
                sh 'npm ci'
                sh 'npx cypress verify'
            }
        }

        stage('Test') {
            steps {
                // catchError permite que el pipeline continúe hasta la etapa Report
                // aunque fallen tests, marcando el build como UNSTABLE
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    sh 'mkdir -p cypress/results'
                    sh 'npx cypress run --browser electron'
                }
            }
        }

        stage('Report') {
            steps {
                archiveArtifacts(
                    artifacts: 'cypress/videos/**/*.mp4,cypress/screenshots/**/*.png',
                    allowEmptyArchive: true
                )
                junit(
                    testResults: 'cypress/results/*.xml',
                    allowEmptyResults: true
                )
            }
        }
    }

    post {
        always {
            // Limpia el workspace independientemente del resultado del pipeline
            // y archiva artefactos como red de seguridad si Report no corrió
            archiveArtifacts(
                artifacts: 'cypress/videos/**/*.mp4,cypress/screenshots/**/*.png',
                allowEmptyArchive: true
            )
            cleanWs()
        }
        success {
            echo 'Pipeline completado — todos los tests pasaron.'
        }
        unstable {
            echo 'Pipeline inestable — algunos tests fallaron. Revisar el reporte JUnit.'
        }
        failure {
            echo 'Pipeline fallido — revisar logs de las etapas Lint o Build.'
        }
    }
}
