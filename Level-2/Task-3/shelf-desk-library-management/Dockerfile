# Build the existing Java 17 Servlet/JDBC backend without changing its source.
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
RUN mvn -B -f backend/pom.xml package

# Run the WAR on Tomcat 10.1, which matches Jakarta Servlet 6.0.
FROM tomcat:10.1-jdk17-temurin
RUN rm -rf /usr/local/tomcat/webapps/ROOT
COPY --from=build /workspace/backend/target/library-management.war /usr/local/tomcat/webapps/library-management.war
EXPOSE 8080

# Render supplies PORT when needed; Tomcat listens on 8080 in this image.
CMD ["catalina.sh", "run"]
