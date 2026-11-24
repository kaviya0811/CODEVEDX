package com.codevedx.library.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/** Keeps database configuration in one place and opens short-lived JDBC connections. */
public final class DBConnection {
    private DBConnection() { }

    private static String value(String key, String fallback) {
        String environment = System.getenv(key);
        return environment == null || environment.isBlank() ? fallback : environment;
    }

    private static String requiredValue(String key) throws SQLException {
        String environment = System.getenv(key);
        if (environment == null || environment.isBlank()) {
            throw new SQLException(key + " is not set. Enter it in the current terminal before starting Tomcat.");
        }
        return environment;
    }

    public static Connection getConnection() throws SQLException {
        String url = value("DB_URL", "jdbc:mysql://localhost:3306/library_management?useSSL=false&serverTimezone=UTC");
        String user = value("DB_USER", "root");
        String password = requiredValue("DB_PASSWORD");
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException error) {
            throw new SQLException("MySQL JDBC driver is not available.", error);
        }
        return DriverManager.getConnection(url, user, password);
    }
}
