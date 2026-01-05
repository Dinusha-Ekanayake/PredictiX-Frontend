#!/bin/bash
# Script to complete the pull and merge operation
# Run this script locally (outside the sandbox) to merge master into copilot/pull-and-merge-changes

set -e  # Exit on error

echo "=========================================="
echo "Pull and Merge Helper Script"
echo "=========================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "Error: Not in a git repository"
    echo "Please cd to the PredictiX-Frontend directory and run this script again"
    exit 1
fi

# Display current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Check if we're on the right branch
if [ "$CURRENT_BRANCH" != "copilot/pull-and-merge-changes" ]; then
    echo "Switching to copilot/pull-and-merge-changes branch..."
    git checkout copilot/pull-and-merge-changes || {
        echo "Error: Could not switch to copilot/pull-and-merge-changes branch"
        exit 1
    }
fi

# Fetch latest changes
echo "Fetching latest changes from origin..."
git fetch origin

# Show what we're about to merge
echo ""
echo "Master branch has the following commits that will be merged:"
if git log --oneline copilot/pull-and-merge-changes..origin/master 2>/dev/null; then
    MERGE_BRANCH="origin/master"
elif git log --oneline copilot/pull-and-merge-changes..master 2>/dev/null; then
    MERGE_BRANCH="master"
    echo "Note: Using local master branch (origin/master not available)"
else
    echo "Warning: Could not find master or origin/master branch."
    echo "Please ensure you have run 'git fetch origin' and that the master branch exists."
    echo "You can check available branches with: git branch -a"
    exit 1
fi
echo ""

# Confirm merge
read -p "Do you want to merge ${MERGE_BRANCH} into copilot/pull-and-merge-changes? (y/n) " -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Merge cancelled"
    exit 0
fi

# Perform the merge
echo "Merging ${MERGE_BRANCH} into copilot/pull-and-merge-changes..."
git merge ${MERGE_BRANCH} -m "Merge master branch into copilot/pull-and-merge-changes" || {
    echo ""
    echo "========================================"
    echo "Merge conflict detected!"
    echo "========================================"
    echo "Please resolve the conflicts manually:"
    echo "1. Edit the conflicting files"
    echo "2. Run: git add <resolved-files>"
    echo "3. Run: git commit"
    echo "4. Run: git push origin copilot/pull-and-merge-changes"
    exit 1
}

# Push the changes
echo ""
echo "Pushing merged changes to origin..."
git push origin copilot/pull-and-merge-changes

echo ""
echo "=========================================="
echo "✅ Merge completed successfully!"
echo "=========================================="
echo ""
echo "The master branch has been merged into copilot/pull-and-merge-changes"
echo "and pushed to origin."
