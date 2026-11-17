import java.util.Scanner;
public class ArmstrongNumber {
    public static long power(int base, int exponent) {
        long result = 1;
        for (int i = 1; i <= exponent; i++) {
            result *= base;
        }
        return result;
    }
    public static boolean isArmstrong(int number) {
        int original = number;
        int digits = String.valueOf(number).length();
        long sum = 0;
        while (number > 0) {
            int digit = number % 10;
            sum += power(digit, digits);
            number /= 10;
        }
        return sum == original;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter a non-negative integer: ");
        if (!sc.hasNextLong()) {
            System.out.println("Invalid input! Please enter an integer.");
            sc.close();
            return;
        }
        long input = sc.nextLong();
        if (input < 0 || input > Integer.MAX_VALUE) {
            System.out.println("Please enter a valid non-negative integer.");
        } else {
            int number = (int) input;
            if (isArmstrong(number)) {
                System.out.println(number + " is an Armstrong number.");
            } else {
                System.out.println(number + " is not an Armstrong number.");
            }
        }
        sc.close();
    }
}
