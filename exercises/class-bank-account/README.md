# Classes: a bank account invariant

**Skills:** public/private, class invariants, const methods
· **Difficulty:** beginner · **~30 min**

A small class that protects an invariant: the balance can never go negative.

## Requirements

- The balance is **private**; callers touch it only through methods.
- `BankAccount()` starts at balance 0.
- `BankAccount(opening)` starts at `opening`, but a negative opening clamps to 0.
- `balance()` is a const getter.
- `deposit(amount)` accepts only `amount > 0` and returns whether it was accepted.
- `withdraw(amount)` accepts only `0 < amount <= balance` and returns whether it
  succeeded. A rejected operation must not change the balance.

Edit only `bank_account.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh class-bank-account
# ...edit exercises/class-bank-account/work/bank_account.hpp...
scripts/exercises/test.sh class-bank-account
scripts/exercises/reset.sh class-bank-account
```

When all tests pass, mark the exercise complete in cppFan.
