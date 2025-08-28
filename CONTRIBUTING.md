# Contributing to The Garnish

First off, thank you for considering contributing to The Garnish! It's people like you that make The Garnish such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, [make one](https://github.com/your-repo/the-garnish/issues/new)! It's generally best if you get confirmation of your bug or approval for your feature request this way before starting to code.

### Fork & create a branch

If this is something you think you can fix, then [fork The Garnish](https://github.com/your-repo/the-garnish/fork) and create a branch with a descriptive name.

A good branch name would be (where issue #38 is the ticket you're working on):

```sh
git checkout -b 38-add-a-new-feature
```

### Get the test suite running

Make sure you're able to run the test suite locally. We've documented how to get started in the [README](README.md#testing).

### Implement your fix or feature

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first :smile_cat:

### Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with The Garnish's master branch:

```sh
git remote add upstream git@github.com:your-repo/the-garnish.git
git checkout master
git pull upstream master
```

Then update your feature branch from your local copy of master, and push it!

```sh
git checkout 38-add-a-new-feature
git rebase master
git push --force-with-lease origin 38-add-a-new-feature
```

Finally, go to GitHub and [make a Pull Request](https://github.com/your-repo/the-garnish/compare) :D

## Code Style

We use Prettier and ESLint to enforce code style. Please make sure your code conforms to the style.

```sh
# Run linting
npm run lint

# Fix linting errors
npm run lint:fix
```

## Thank you!

Your contribution is crucial for the success of this project. We appreciate your effort and dedication.