package com.codevedx.library.web;

import com.codevedx.library.service.LibraryService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@WebServlet("/api/issues")
public class IssueServlet extends HttpServlet {
    private final LibraryService libraryService = new LibraryService();

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) {
        ApiSupport.allowCors(response);
        response.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ApiSupport.allowCors(response);
        response.setContentType("application/json");
        try {
            String action = request.getParameter("action");
            if ("return".equalsIgnoreCase(action)) {
                int issueId = Integer.parseInt(request.getParameter("issueId"));
                libraryService.returnBook(issueId, parseDate(request.getParameter("returnDate"), "Return date"));
            } else if ("issue".equalsIgnoreCase(action) || action == null || action.isBlank()) {
                libraryService.issueBook(request.getParameter("bookId"), request.getParameter("borrowerName"), request.getParameter("studentId"), parseDate(request.getParameter("issueDate"), "Issue date"));
            } else {
                ApiSupport.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unknown issue action.");
                return;
            }
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"success\":true}");
        } catch (NumberFormatException | DateTimeParseException error) {
            ApiSupport.error(response, HttpServletResponse.SC_BAD_REQUEST, "Use a numeric issue ID and dates in YYYY-MM-DD format.");
        } catch (IllegalArgumentException error) {
            ApiSupport.error(response, HttpServletResponse.SC_BAD_REQUEST, error.getMessage());
        } catch (IllegalStateException error) {
            ApiSupport.error(response, HttpServletResponse.SC_CONFLICT, error.getMessage());
        } catch (Exception error) {
            ApiSupport.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database operation failed.");
        }
    }

    private LocalDate parseDate(String value, String label) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(label + " is required.");
        return LocalDate.parse(value);
    }
}
