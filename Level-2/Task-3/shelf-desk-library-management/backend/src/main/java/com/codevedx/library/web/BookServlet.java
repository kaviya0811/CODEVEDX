package com.codevedx.library.web;

import com.codevedx.library.config.DBConnection;
import com.codevedx.library.dao.BookDao;
import com.codevedx.library.model.Book;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.util.List;

@WebServlet("/api/books")
public class BookServlet extends HttpServlet {
    private final BookDao bookDao = new BookDao();

    @Override
    protected void doOptions(jakarta.servlet.http.HttpServletRequest request, HttpServletResponse response) {
        ApiSupport.allowCors(response);
        response.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ApiSupport.allowCors(response);
        response.setContentType("application/json");
        try (Connection connection = DBConnection.getConnection()) {
            response.getWriter().write(toJson(bookDao.findAll(connection, request.getParameter("search"))));
        } catch (Exception error) {
            ApiSupport.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Could not load books.");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ApiSupport.allowCors(response);
        response.setContentType("application/json");
        String bookId = trim(request.getParameter("bookId"));
        String title = trim(request.getParameter("title"));
        String author = trim(request.getParameter("author"));
        String category = trim(request.getParameter("category"));
        String isbn = trim(request.getParameter("isbn"));
        String action = trim(request.getParameter("action"));
        try {
            int totalQuantity = Integer.parseInt(request.getParameter("totalQuantity"));
            validate(bookId, title, author, category, isbn, totalQuantity);
            try (Connection connection = DBConnection.getConnection()) {
                connection.setAutoCommit(false);
                try {
                    if ("update".equalsIgnoreCase(action)) {
                        Book existing = bookDao.findForUpdate(connection, bookId);
                        if (existing == null) throw new IllegalArgumentException("Book was not found.");
                        int activeIssues = bookDao.countActiveIssues(connection, bookId);
                        if (totalQuantity < activeIssues) throw new IllegalArgumentException("Total quantity cannot be below active loans.");
                        bookDao.update(connection, new Book(bookId, title, author, category, isbn, totalQuantity, totalQuantity - activeIssues));
                    } else {
                        bookDao.add(connection, new Book(bookId, title, author, category, isbn, totalQuantity, totalQuantity));
                    }
                    connection.commit();
                } catch (Exception error) {
                    connection.rollback();
                    throw error;
                } finally {
                    connection.setAutoCommit(true);
                }
            }
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"success\":true}");
        } catch (NumberFormatException error) {
            ApiSupport.error(response, HttpServletResponse.SC_BAD_REQUEST, "Total quantity must be a positive whole number.");
        } catch (IllegalArgumentException error) {
            ApiSupport.error(response, HttpServletResponse.SC_BAD_REQUEST, error.getMessage());
        } catch (Exception error) {
            ApiSupport.error(response, HttpServletResponse.SC_CONFLICT, "Book ID or ISBN already exists.");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ApiSupport.allowCors(response);
        response.setContentType("application/json");
        String bookId = trim(request.getParameter("bookId"));
        if (bookId.isBlank()) {
            ApiSupport.error(response, HttpServletResponse.SC_BAD_REQUEST, "Book ID is required.");
            return;
        }
        try (Connection connection = DBConnection.getConnection()) {
            boolean deleted = bookDao.delete(connection, bookId);
            if (!deleted) {
                ApiSupport.error(response, HttpServletResponse.SC_CONFLICT, "This book has issue history and cannot be deleted.");
                return;
            }
            response.getWriter().write("{\"success\":true}");
        } catch (Exception error) {
            ApiSupport.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Could not delete the book.");
        }
    }

    private void validate(String bookId, String title, String author, String category, String isbn, int totalQuantity) {
        if (bookId.isBlank() || title.isBlank() || author.isBlank() || category.isBlank() || isbn.isBlank()) throw new IllegalArgumentException("Book ID, title, author, category and ISBN are required.");
        if (!bookId.matches("[A-Za-z0-9-]{3,20}")) throw new IllegalArgumentException("Book ID must be 3–20 letters, numbers or hyphens.");
        if (!isbn.matches("[0-9-]{10,17}")) throw new IllegalArgumentException("ISBN must contain 10–17 digits or hyphens.");
        if (totalQuantity < 1) throw new IllegalArgumentException("Total quantity must be positive.");
    }

    private String trim(String value) { return value == null ? "" : value.trim(); }

    private String toJson(List<Book> books) {
        StringBuilder json = new StringBuilder("[");
        for (int index = 0; index < books.size(); index++) {
            Book book = books.get(index);
            if (index > 0) json.append(',');
            json.append("{\"bookId\":\"").append(escape(book.getBookId())).append("\",\"title\":\"").append(escape(book.getTitle())).append("\",\"author\":\"").append(escape(book.getAuthor())).append("\",\"category\":\"").append(escape(book.getCategory())).append("\",\"isbn\":\"").append(escape(book.getIsbn())).append("\",\"totalQuantity\":").append(book.getTotalQuantity()).append(",\"availableQuantity\":").append(book.getAvailableQuantity()).append('}');
        }
        return json.append(']').toString();
    }

    private String escape(String value) { return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\""); }
}
