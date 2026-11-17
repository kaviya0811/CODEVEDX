import java.util.Scanner;
import java.math.BigInteger;
public class FibonacciSeries {
    public static void generateFibonacci(int terms) {
        BigInteger first = BigInteger.ZERO;
        BigInteger second = BigInteger.ONE;
        System.out.println("Fibonacci Series:");
        for (int i = 1; i <= terms; i++) {
            System.out.print(first + " ");
            BigInteger next = first.add(second);
            first = second;
            second = next;
        }
        System.out.println();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter the number of terms (1-100): ");
        if (!sc.hasNextInt()) {
            System.out.println("Invalid input! Please enter an integer.");
            sc.close();
            return;
        }
        int terms = sc.nextInt();
        if (terms < 1 || terms > 100) {
            System.out.println("Please enter a value between 1 and 100.");
        } else {
            generateFibonacci(terms);
        }
        sc.close();
    }
}
