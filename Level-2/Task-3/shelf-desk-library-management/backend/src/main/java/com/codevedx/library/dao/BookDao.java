package com.codevedx.library.dao;

import com.codevedx.library.model.Book;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class BookDao {
    public void add(Connection connection, Book book) throws SQLException {
        String sql = "INSERT INTO books (book_id, title, author, category, isbn, total_quantity, available_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, book.getBookId());
            statement.setString(2, book.getTitle());
            statement.setString(3, book.getAuthor());
            statement.setString(4, book.getCategory());
            statement.setString(5, book.getIsbn());
            statement.setInt(6, book.getTotalQuantity());
            statement.setInt(7, book.getTotalQuantity());
            statement.executeUpdate();
        }
    }

    public List<Book> findAll(Connection connection, String search) throws SQLException {
        String sql = "SELECT book_id, title, author, category, isbn, total_quantity, available_quantity FROM books WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR isbn LIKE ? ORDER BY title";
        String query = "%" + (search == null ? "" : search.trim().toLowerCase()) + "%";
        List<Book> books = new ArrayList<>();
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, query);
            statement.setString(2, query);
            statement.setString(3, query);
            try (ResultSet results = statement.executeQuery()) {
                while (results.next()) books.add(fromRow(results));
            }
        }
        return books;
    }

    public Book findForUpdate(Connection connection, String bookId) throws SQLException {
        String sql = "SELECT book_id, title, author, category, isbn, total_quantity, available_quantity FROM books WHERE book_id = ? FOR UPDATE";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, bookId);
            try (ResultSet results = statement.executeQuery()) {
                return results.next() ? fromRow(results) : null;
            }
        }
    }

    public int countActiveIssues(Connection connection, String bookId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM issue_records WHERE book_id = ? AND status = 'Issued'";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, bookId);
            try (ResultSet results = statement.executeQuery()) {
                results.next();
                return results.getInt(1);
            }
        }
    }

    public void update(Connection connection, Book book) throws SQLException {
        String sql = "UPDATE books SET title = ?, author = ?, category = ?, isbn = ?, total_quantity = ?, available_quantity = ? WHERE book_id = ?";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, book.getTitle());
            statement.setString(2, book.getAuthor());
            statement.setString(3, book.getCategory());
            statement.setString(4, book.getIsbn());
            statement.setInt(5, book.getTotalQuantity());
            statement.setInt(6, book.getAvailableQuantity());
            statement.setString(7, book.getBookId());
            if (statement.executeUpdate() != 1) throw new SQLException("Book was not found.");
        }
    }

    /** Historical issue rows are intentionally retained, so deletion is blocked for any reference. */
    public boolean delete(Connection connection, String bookId) throws SQLException {
        String sql = "DELETE FROM books WHERE book_id = ? AND NOT EXISTS (SELECT 1 FROM issue_records WHERE book_id = ?)";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, bookId);
            statement.setString(2, bookId);
            return statement.executeUpdate() == 1;
        }
    }

    private Book fromRow(ResultSet results) throws SQLException {
        return new Book(results.getString("book_id"), results.getString("title"), results.getString("author"), results.getString("category"), results.getString("isbn"), results.getInt("total_quantity"), results.getInt("available_quantity"));
    }
}
