package com.codevedx.library.dao;

import com.codevedx.library.model.IssueRecord;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class IssueRecordDao {
    public int create(Connection connection, IssueRecord record) throws SQLException {
        String sql = "INSERT INTO issue_records (book_id, borrower_name, student_id, issue_date, status) VALUES (?, ?, ?, ?, 'Issued')";
        try (PreparedStatement statement = connection.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, record.getBookId());
            statement.setString(2, record.getBorrowerName());
            statement.setString(3, record.getStudentId());
            statement.setDate(4, Date.valueOf(record.getIssueDate()));
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
        }
        throw new SQLException("No issue ID was generated.");
    }

    public IssueRecord findIssuedForUpdate(Connection connection, int issueId) throws SQLException {
        String sql = "SELECT issue_id, book_id, borrower_name, student_id, issue_date, return_date, status FROM issue_records WHERE issue_id = ? FOR UPDATE";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, issueId);
            try (ResultSet results = statement.executeQuery()) {
                return results.next() ? fromRow(results) : null;
            }
        }
    }

    public void markReturned(Connection connection, int issueId, LocalDate returnDate) throws SQLException {
        String sql = "UPDATE issue_records SET return_date = ?, status = 'Returned' WHERE issue_id = ? AND status = 'Issued'";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setDate(1, Date.valueOf(returnDate));
            statement.setInt(2, issueId);
            if (statement.executeUpdate() != 1) throw new SQLException("Issue is missing or has already been returned.");
        }
    }

    public List<IssueRecord> findAll(Connection connection) throws SQLException {
        String sql = "SELECT issue_id, book_id, borrower_name, student_id, issue_date, return_date, status FROM issue_records ORDER BY issue_id DESC";
        List<IssueRecord> records = new ArrayList<>();
        try (PreparedStatement statement = connection.prepareStatement(sql); ResultSet results = statement.executeQuery()) {
            while (results.next()) records.add(fromRow(results));
        }
        return records;
    }

    private IssueRecord fromRow(ResultSet results) throws SQLException {
        IssueRecord record = new IssueRecord();
        record.setIssueId(results.getInt("issue_id"));
        record.setBookId(results.getString("book_id"));
        record.setBorrowerName(results.getString("borrower_name"));
        record.setStudentId(results.getString("student_id"));
        record.setIssueDate(results.getDate("issue_date").toLocalDate());
        Date returnDate = results.getDate("return_date");
        record.setReturnDate(returnDate == null ? null : returnDate.toLocalDate());
        record.setStatus(results.getString("status"));
        return record;
    }
}
