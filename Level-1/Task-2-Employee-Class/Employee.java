public class Employee {
    private int id;
    private String name;
    private String department;
    private double salary;
    public Employee() {
        this(0, "Not Assigned", "Not Assigned", 0.0);
    }
    public Employee(int id, String name, String department, double salary) {
        setId(id);
        setName(name);
        setDepartment(department);
        setSalary(salary);
    }
    public int getId() {
        return id;
    }
    public void setId(int id) {
        if (id >= 0) {
            this.id = id;
        }
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        if (name != null && !name.trim().isEmpty()) {
            this.name = name;
        }
    }
    public String getDepartment() {
        return department;
    }
    public void setDepartment(String department) {
        if (department != null && !department.trim().isEmpty()) {
            this.department = department;
        }
    }
    public double getSalary() {
        return salary;
    }
    public void setSalary(double salary) {
        if (salary >= 0) {
            this.salary = salary;
        }
    }
    public double calculateAnnualSalary() {
        return salary * 12;
    }
    public double calculateAnnualSalary(double annualBonus) {
        if (annualBonus < 0) {
            throw new IllegalArgumentException("Bonus cannot be negative.");
        }
        return calculateAnnualSalary() + annualBonus;
    }
    public void displayDetails() {
        System.out.println(this.toString());
    }
    public void displayDetails(String heading) {
        System.out.println("\n" + heading);
        displayDetails();
    }
    @Override
    public String toString() {
        return "Employee Details:\n" +
               "ID: " + id + "\n" +
               "Name: " + name + "\n" +
               "Department: " + department + "\n" +
               "Monthly Salary: " + salary + "\n" +
               "Annual Salary: " + calculateAnnualSalary();
    }
    public static void main(String[] args) {
        Employee emp = new Employee(
            101,
            "Rahul",
            "IT",
            30000
        );
        emp.displayDetails();
        System.out.println("\nAnnual Salary with Bonus: " +
            emp.calculateAnnualSalary(10000));
        emp.displayDetails("Employee Information");
    }
}
