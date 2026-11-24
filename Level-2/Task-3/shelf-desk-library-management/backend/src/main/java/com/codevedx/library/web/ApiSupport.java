package com.codevedx.library.web;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

final class ApiSupport {
    private ApiSupport() { }

    static void allowCors(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    static void error(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.getWriter().write("{\"success\":false,\"message\":\"" + escape(message) + "\"}");
    }

    private static String escape(String value) { return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\""); }
}
