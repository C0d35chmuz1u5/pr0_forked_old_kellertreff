# shared module

Used in BE and FE. Current solution is to symlink the `shared/src` to both projects. Works like a charm for now.

TODO:
- Use TypeScript composite projects (project references) as soon as CRA supports it natively (see https://github.com/facebook/create-react-app/issues/6799).
- Later, we can also add a path alias like `@/shared/*` (currently also not supported natively; see https://github.com/facebook/create-react-app/issues/5118).
- Create a separate tsconfig for the shared project.
