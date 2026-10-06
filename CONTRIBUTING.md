# Contributing

Thanks for wanting to contribute.
One rule up front:

**Human-authored pull requests targeting `main` must be raised through [`no-mistakes`](https://github.com/kunchenguid/no-mistakes).**
This keeps review cheap for the maintainer, and it is the same rule [kunchenguid/axi](https://github.com/kunchenguid/axi/blob/main/CONTRIBUTING.md) uses.

`no-mistakes` puts a local git proxy in front of your real remote.
Pushing through it runs an AI-driven review/test/build pipeline in an isolated worktree, forwards the push only after every check passes, and opens a clean PR automatically.
Fork-based contributions need no-mistakes **v1.30.1** or newer.

A GitHub Actions check (`Require no-mistakes`) runs on PRs targeting `main` and fails if the body is missing the signature and pipeline attestation that no-mistakes writes.
Bot accounts are exempt; other PRs without the signature will not be reviewed or merged.

## Workflow

1. Fork the repo, then clone the parent repo or set your local `origin` back to it (`git@github.com:simkimsia/one-true-shell.git`).
2. Create a branch and make your changes.
3. Initialize the gate with your fork as the push target: `no-mistakes init --fork-url git@github.com:<you>/one-true-shell.git`.
4. Commit your changes.
5. Push through the gate instead of pushing to `origin`:

   ```sh
   git push no-mistakes
   ```

6. Run `no-mistakes` to attach to the pipeline, watch findings, and auto-fix or review as needed.
7. Once the pipeline passes, it pushes your branch to your fork and opens the PR against this repo for you.

See the [no-mistakes quick start](https://kunchenguid.github.io/no-mistakes/start-here/quick-start/) for the first-run walkthrough.

## Listing your implementation

Your implementation lives in your own repo; this repo only lists it.

1. Make it pass the suite at a spec tag, as [IMPLEMENTATIONS.md](IMPLEMENTATIONS.md#add-yours) describes.
2. Add your row to the **Community** table in both `IMPLEMENTATIONS.md` and `README.md` (replace the "waiting for you to implement" row if it is your stack).
3. Open the PR through the workflow above.

## Changing the contract

Spec and test changes follow [VISION.md](VISION.md): structure and behavior only, every MUST has exactly one test, and the test wins over the prose.
[AGENTS.md](AGENTS.md#changing-the-contract) lists every file a version bump touches.
Open an issue first for a new behavior, so the rule can be agreed before anyone writes the test.

## Repo conventions

- Use conventional commit messages (`feat:`, `fix:`, `docs:`).
- Run the suite against at least one implementation before pushing a test change:

  ```sh
  cd conformance && npm ci && npx playwright install chromium
  IMPL_DIR=/path/to/impl npx playwright test
  ```
