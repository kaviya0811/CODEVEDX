package com.codevedx.library.web;

import com.codevedx.library.config.DBConnection;
import com.codevedx.library.dao.IssueRecordDao;
import com.codevedx.library.model.IssueRecord;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.util.List;

@WebServlet("/api/history")
public class HistoryServlet extends HttpServlet {
    private final IssueRecordDao issueRecordDao = new IssueRecordDao();

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) {
        ApiSupport.allowCors(response);
        response.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ApiSupport.allowCors(response);
        response.setContentType("application/json");
        try (Connection connection = DBConnection.getConnection()) {
            List<IssueRecord> records = issueRecordDao.findAll(connection);
            StringBuilder json = new StringBuilder("[");
            for (int index = 0; index < records.size(); index++) {
                IssueRecord record = records.get(index);
                if (index > 0) json.append(',');
                json.append("{\"issueId\":").append(record.getIssueId()).append(",\"bookId\":\"").append(escape(record.getBookId())).append("\",\"borrowerName\":\"").append(escape(record.getBorrowerName())).append("\",\"studentId\":\"").append(escape(record.getStudentId())).append("\",\"issueDate\":\"").append(record.getIssueDate()).append("\",\"returnDate\":").append(record.getReturnDate() == null ? "null" : "\"" + record.getReturnDate() + "\"").append(",\"status\":\"").append(escape(record.getStatus())).append("\"}");
            }
            response.getWriter().write(json.append(']').toString());
        } catch (Exception error) {
            ApiSupport.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Could not load history.");
        }
    }

    private String escape(String value) { return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\""); }
}
