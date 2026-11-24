package com.codevedx.library.service;

import com.codevedx.library.config.DBConnection;
import com.codevedx.library.dao.BookDao;
import com.codevedx.library.dao.IssueRecordDao;
import com.codevedx.library.model.Book;
import com.codevedx.library.model.IssueRecord;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;

/** Business rules live here so servlets stay thin and easy to explain. */
public class LibraryService {
    private final BookDao bookDao = new BookDao();
    private final IssueRecordDao issueRecordDao = new IssueRecordDao();

    public void issueBook(String bookId, String borrowerName, String studentId, LocalDate issueDate) throws SQLException {
        validatePattern(bookId, "Book ID", "[A-Za-z0-9-]{3,20}");
        validatePattern(borrowerName, "Borrower name", "[A-Za-z .'-]{2,120}");
        validatePattern(studentId, "Student ID", "[A-Za-z0-9-]{2,30}");
        if (issueDate == null) throw new IllegalArgumentException("Issue date is required.");
        try (Connection connection = DBConnection.getConnection()) {
            connection.setAutoCommit(false);
            try {
                Book book = bookDao.findForUpdate(connection, bookId);
                if (book == null) throw new IllegalArgumentException("Book was not found.");
                if (book.getAvailableQuantity() <= 0) throw new IllegalStateException("No copies are available.");
                book.setAvailableQuantity(book.getAvailableQuantity() - 1);
                bookDao.update(connection, book);
                IssueRecord record = new IssueRecord();
                record.setBookId(bookId);
                record.setBorrowerName(borrowerName.trim());
                record.setStudentId(studentId.trim());
                record.setIssueDate(issueDate);
                issueRecordDao.create(connection, record);
                connection.commit();
            } catch (Exception error) {
                connection.rollback();
                throw error;
            } finally {
                connection.setAutoCommit(true);
            }
        }
    }

    public void returnBook(int issueId, LocalDate returnDate) throws SQLException {
        if (issueId < 1 || returnDate == null) throw new IllegalArgumentException("Issue ID and return date are required.");
        try (Connection connection = DBConnection.getConnection()) {
            connection.setAutoCommit(false);
            try {
                IssueRecord record = issueRecordDao.findIssuedForUpdate(connection, issueId);
                if (record == null || !"Issued".equals(record.getStatus())) throw new IllegalStateException("Issue is missing or already returned.");
                Book book = bookDao.findForUpdate(connection, record.getBookId());
                if (book == null) throw new IllegalStateException("The related book was not found.");
                book.setAvailableQuantity(Math.min(book.getTotalQuantity(), book.getAvailableQuantity() + 1));
                bookDao.update(connection, book);
                issueRecordDao.markReturned(connection, issueId, returnDate);
                connection.commit();
            } catch (Exception error) {
                connection.rollback();
                throw error;
            } finally {
                connection.setAutoCommit(true);
            }
        }
    }

    private void validatePattern(String value, String field, String pattern) {
        if (value == null || !value.trim().matches(pattern)) throw new IllegalArgumentException(field + " is invalid.");
    }
}
