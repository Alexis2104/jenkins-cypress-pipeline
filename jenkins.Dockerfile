# Extiende la imagen oficial de Jenkins LTS con JDK 17
FROM jenkins/jenkins:lts-jdk17

# Instala Docker CLI como root para que Jenkins pueda lanzar contenedores
USER root
RUN apt-get update && \
    apt-get install -y docker.io && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Agrega el usuario jenkins al grupo docker para acceder al socket sin sudo
RUN usermod -aG docker jenkins

# Vuelve al usuario jenkins por seguridad
USER jenkins
