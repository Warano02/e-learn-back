# Contributing Guide — E-Learning Platform

## Purpose

This document defines the contribution rules to ensure:

* High code quality
* Project consistency
* Efficient team collaboration

All contributors must follow these guidelines.


## Branching Strategy

* `main` → production (protected, no direct push)
* `develop` → main development branch
* `feature/*` → new features



## Mandatory Workflow

1. Checkout `develop`
2. Create a new branch:

   * `feature/feature-name`
3. Implement your changes
4. Write clean commits
5. Push your branch
6. Open a Pull Request to `develop`

Restrictions:

* No direct push to `main` or `develop`
* No merge without approval



## Commit Convention (REQUIRED)

Use the following format:

* `feat: add course module`
* `fix: resolve login issue`
* `refactor: improve auth service`
* `docs: update README`


## Code Standards

* ESLint and Prettier are mandatory
* Write clean and readable code
* Use meaningful variable and function names
* Keep functions small and focused
* Remove unused code


## Frontend Guidelines 

* Build reusable components
* Avoid heavy logic inside components
* Use custom hooks when needed


## Code Review

* At least 1 approval required before merge
* Code must be tested before opening a PR
* PR descriptions must be clear and detailed


## Testing

* Test your code before pushing
* Do not break existing features



## Strict Rules

* No untested code
* No console.log in production
* No unnecessary duplication
* Follow all conventions



## Important

Any code that does not follow these rules will be rejected.
