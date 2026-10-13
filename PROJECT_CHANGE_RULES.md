# Project Change Control Rules

1. Change only the specific elements, behaviors, or files explicitly requested by the user in the current task.
2. Never redesign, refactor, restyle, rename, delete, or optimize unrelated components or files without explicit permission.
3. Before editing, identify the smallest necessary set of files and the exact target element.
4. Preserve all existing page designs, layout, assets, routes, animations, interactions, and application state outside the approved scope.
5. Do not make additional aesthetic improvements or infer permission to change neighboring elements.
6. If the requested change cannot be implemented without affecting unrelated behavior, stop and explain the dependency before proceeding.
7. Review the final diff and revert all accidental unrelated changes.
8. Run only the checks necessary to verify the requested change and confirm that unrelated pages remain intact.
9. In future tasks, read and follow this file before editing. A new user instruction may authorize a specific change, but does not authorize unrelated modifications.
