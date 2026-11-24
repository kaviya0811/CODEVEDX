CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;

CREATE TABLE IF NOT EXISTS books (
    book_id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    author VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    total_quantity INT NOT NULL,
    available_quantity INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_books_total_quantity CHECK (total_quantity > 0),
    CONSTRAINT chk_books_available_quantity CHECK (available_quantity >= 0 AND available_quantity <= total_quantity)
);

CREATE TABLE IF NOT EXISTS issue_records (
    issue_id INT PRIMARY KEY AUTO_INCREMENT,
    book_id VARCHAR(20) NOT NULL,
    borrower_name VARCHAR(120) NOT NULL,
    student_id VARCHAR(30) NOT NULL,
    issue_date DATE NOT NULL,
    return_date DATE NULL,
    status ENUM('Issued', 'Returned') NOT NULL DEFAULT 'Issued',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_issue_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_return_date CHECK ((status = 'Issued' AND return_date IS NULL) OR (status = 'Returned' AND return_date IS NOT NULL))
);

SET @create_books_search_index = (
    SELECT IF(COUNT(*) = 0,
        'CREATE INDEX idx_books_search ON books(title, author, isbn)',
        'SELECT 1')
    FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'books' AND index_name = 'idx_books_search'
);
PREPARE create_books_search_index FROM @create_books_search_index;
EXECUTE create_books_search_index;
DEALLOCATE PREPARE create_books_search_index;

SET @create_issue_status_index = (
    SELECT IF(COUNT(*) = 0,
        'CREATE INDEX idx_issue_status ON issue_records(status)',
        'SELECT 1')
    FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'issue_records' AND index_name = 'idx_issue_status'
);
PREPARE create_issue_status_index FROM @create_issue_status_index;
EXECUTE create_issue_status_index;
DEALLOCATE PREPARE create_issue_status_index;

SET @create_issue_book_status_index = (
    SELECT IF(COUNT(*) = 0,
        'CREATE INDEX idx_issue_book_status ON issue_records(book_id, status)',
        'SELECT 1')
    FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'issue_records' AND index_name = 'idx_issue_book_status'
);
PREPARE create_issue_book_status_index FROM @create_issue_book_status_index;
EXECUTE create_issue_book_status_index;
DEALLOCATE PREPARE create_issue_book_status_index;

-- Seed rows are inserted only when their key does not already exist.
-- This keeps rerunning the setup script from overwriting user data.
INSERT INTO books (book_id, title, author, category, isbn, total_quantity, available_quantity) VALUES
('BK-1042', 'The Design of Everyday Things', 'Don Norman', 'Design', '9780262525671', 8, 7),
('BK-1043', 'The Pragmatic Programmer', 'Andrew Hunt', 'Technology', '9780135957059', 6, 5),
('BK-1044', 'A Room of One''s Own', 'Virginia Woolf', 'Literature', '9780156787338', 5, 5),
('BK-1045', 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Psychology', '9780374533557', 10, 9),
('BK-1046', 'Sapiens', 'Yuval Noah Harari', 'History', '9780062316097', 12, 12),
('BK-1047', 'The Midnight Library', 'Matt Haig', 'Fiction', '9780525559474', 7, 6),
('BK-1048', 'Atomic Habits', 'James Clear', 'Self development', '9780735211292', 9, 9),
('BK-1049', 'Braiding Sweetgrass', 'Robin Wall Kimmerer', 'Nature', '9781571313560', 4, 4)
ON DUPLICATE KEY UPDATE book_id = books.book_id;

INSERT INTO issue_records (book_id, borrower_name, student_id, issue_date, status)
SELECT 'BK-1042', 'Aarav Mehta', 'ST-2048', '2026-11-12', 'Issued'
WHERE NOT EXISTS (SELECT 1 FROM issue_records WHERE book_id = 'BK-1042' AND borrower_name = 'Aarav Mehta' AND student_id = 'ST-2048' AND issue_date = '2026-11-12');

INSERT INTO issue_records (book_id, borrower_name, student_id, issue_date, status)
SELECT 'BK-1043', 'Maya Patel', 'ST-2031', '2026-11-11', 'Issued'
WHERE NOT EXISTS (SELECT 1 FROM issue_records WHERE book_id = 'BK-1043' AND borrower_name = 'Maya Patel' AND student_id = 'ST-2031' AND issue_date = '2026-11-11');

INSERT INTO issue_records (book_id, borrower_name, student_id, issue_date, status)
SELECT 'BK-1047', 'Jonas Reed', 'ST-1988', '2026-11-10', 'Issued'
WHERE NOT EXISTS (SELECT 1 FROM issue_records WHERE book_id = 'BK-1047' AND borrower_name = 'Jonas Reed' AND student_id = 'ST-1988' AND issue_date = '2026-11-10');

INSERT INTO issue_records (book_id, borrower_name, student_id, issue_date, status)
SELECT 'BK-1045', 'Lina Okafor', 'ST-1976', '2026-11-08', 'Issued'
WHERE NOT EXISTS (SELECT 1 FROM issue_records WHERE book_id = 'BK-1045' AND borrower_name = 'Lina Okafor' AND student_id = 'ST-1976' AND issue_date = '2026-11-08');

INSERT INTO issue_records (book_id, borrower_name, student_id, issue_date, return_date, status)
SELECT 'BK-1046', 'Elena Rossi', 'ST-1964', '2026-11-05', '2026-11-12', 'Returned'
WHERE NOT EXISTS (SELECT 1 FROM issue_records WHERE book_id = 'BK-1046' AND borrower_name = 'Elena Rossi' AND student_id = 'ST-1964' AND issue_date = '2026-11-05');

INSERT INTO issue_records (book_id, borrower_name, student_id, issue_date, return_date, status)
SELECT 'BK-1044', 'Noah Williams', 'ST-1921', '2026-11-04', '2026-11-10', 'Returned'
WHERE NOT EXISTS (SELECT 1 FROM issue_records WHERE book_id = 'BK-1044' AND borrower_name = 'Noah Williams' AND student_id = 'ST-1921' AND issue_date = '2026-11-04');
