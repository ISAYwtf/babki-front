## ADDED Requirements

### Requirement: Category management entry point
The system SHALL provide an expense-category management action in the header of the monthly expenses-by-categories widget.

#### Scenario: Entry point in every widget state
- **WHEN** the monthly widget is loading, empty, or populated
- **THEN** its header displays a gear action with an accessible management label

#### Scenario: Open management dialog
- **WHEN** the user activates the gear action
- **THEN** the system opens a dialog titled "Категории" with an accessible close action

#### Scenario: Annual widget remains unchanged
- **WHEN** the annual expenses-by-categories widget is displayed
- **THEN** the category management action is not added to that widget

### Requirement: Category list presentation
The system SHALL present persisted categories as editable rows ordered from oldest to newest and SHALL keep category creation available below the list.

#### Scenario: Populated category list
- **WHEN** persisted categories are loaded
- **THEN** each row displays the category name, selected color, delete action, and a reserved save-action column

#### Scenario: Empty category list
- **WHEN** no categories exist and no temporary row is present
- **THEN** the dialog displays "Пока пусто" above the "Добавить категорию" action

#### Scenario: Long category list
- **WHEN** the category rows exceed the available dialog height
- **THEN** only the list region scrolls while the title and add action remain available

### Requirement: Independent category drafts
The system SHALL keep editable category values in dialog-local row drafts and SHALL persist only the row whose save action is activated.

#### Scenario: Dirty persisted row
- **WHEN** the user changes the name or color of a persisted category
- **THEN** that row displays its save action without shifting the name, color, or delete columns

#### Scenario: Reverted persisted row
- **WHEN** the user restores both fields to their baseline values
- **THEN** the row is no longer dirty and its save action is hidden while the reserved column remains

#### Scenario: Save one of several dirty rows
- **WHEN** multiple persisted rows are dirty and one valid row is saved successfully
- **THEN** only the saved row receives a new baseline and all other unsaved drafts remain unchanged

#### Scenario: Discard dialog drafts
- **WHEN** the user closes the idle dialog through the close action, backdrop, or Escape key
- **THEN** all unsaved category changes are discarded without changing query data

### Requirement: Category draft validation
The system MUST prevent saving a category row unless its normalized name and selected color are valid.

#### Scenario: Required name
- **WHEN** a touched category name is empty after trimming
- **THEN** the row displays a required-field error and its save action is disabled

#### Scenario: Maximum name length
- **WHEN** a touched category name exceeds 100 characters
- **THEN** the row displays a length error and its save action is disabled

#### Scenario: Case-insensitive duplicate
- **WHEN** a draft name matches another loaded or locally edited category after trimming and case folding
- **THEN** the row displays a uniqueness error and its save action is disabled

#### Scenario: Required color
- **WHEN** a dirty row has no selected palette color
- **THEN** its save action is disabled and a color validation error is available after interaction

#### Scenario: Reused color
- **WHEN** the user chooses a color already used by another category
- **THEN** the color remains valid

#### Scenario: Normalized request name
- **WHEN** a valid row is submitted
- **THEN** the system sends the name without leading or trailing whitespace

### Requirement: Fixed category color palette
The system SHALL restrict category color selection to a fixed palette of 25 HEX colors displayed as a compact accessible grid.

#### Scenario: Open color selector
- **WHEN** the user activates a row's color control
- **THEN** a 5-by-5 grid of 20-by-20-pixel circular color options with 10-pixel gaps is displayed

#### Scenario: Selected color indication
- **WHEN** a palette color is selected
- **THEN** the option is identified by a ring and check indicator in addition to its color

#### Scenario: Accessible color selection
- **WHEN** the user navigates the color selector with a keyboard or assistive technology
- **THEN** each color is focusable and exposes a localized accessible name

#### Scenario: Radio-group keyboard navigation
- **WHEN** focus is within the color selector
- **THEN** arrow keys move through the palette using a single radio-group tab stop

#### Scenario: Palette near viewport edge
- **WHEN** the color selector would overflow the viewport
- **THEN** it repositions to remain visible

### Requirement: Create one category at a time
The system SHALL allow at most one temporary category row and SHALL keep that row at the bottom before and after successful creation.

#### Scenario: Add temporary row
- **WHEN** the user activates "Добавить категорию"
- **THEN** one row with an empty name and no selected color appears at the bottom of the list

#### Scenario: Prevent a second temporary row
- **WHEN** a temporary row exists
- **THEN** "Добавить категорию" remains visible but disabled

#### Scenario: Remove temporary row
- **WHEN** the user activates delete on a temporary row
- **THEN** the row is removed immediately without a confirmation or API request and the add action becomes enabled

#### Scenario: Create category successfully
- **WHEN** the user saves a valid temporary row and the create request succeeds
- **THEN** the returned persisted category replaces the temporary row at the bottom and the add action becomes enabled

#### Scenario: Create category fails
- **WHEN** the create request fails
- **THEN** the temporary row and entered values remain available with a row-specific error

### Requirement: Update a persisted category
The system SHALL update a valid dirty persisted row independently and SHALL preserve its draft when the request fails.

#### Scenario: Update succeeds
- **WHEN** the user activates save on a valid dirty persisted row and the update request succeeds
- **THEN** the returned category becomes that row's baseline and the save action disappears

#### Scenario: Duplicate conflict from API
- **WHEN** the update or create API rejects a duplicate name
- **THEN** the system associates the conflict with the name field and preserves the draft

#### Scenario: Generic save failure
- **WHEN** a create or update request fails for another reason
- **THEN** the system displays an error for the affected row and preserves its draft for correction or retry

#### Scenario: Pending save
- **WHEN** a create or update request is pending
- **THEN** the management dialog fields and actions are disabled and the dialog cannot be closed

### Requirement: Confirm deletion of persisted categories
The system MUST require confirmation before requesting deletion of a persisted category.

#### Scenario: Request persisted deletion
- **WHEN** the user activates delete on a persisted row
- **THEN** the system opens a confirmation dialog instead of immediately sending a delete request

#### Scenario: Cancel persisted deletion
- **WHEN** the user cancels the confirmation
- **THEN** no delete request is sent and the category row remains unchanged

#### Scenario: Confirm persisted deletion
- **WHEN** the user confirms deletion and the request succeeds
- **THEN** the confirmation closes and the category is removed from the local list

#### Scenario: Category is linked to expenses
- **WHEN** the delete API rejects the request because the category is linked to expenses
- **THEN** the confirmation remains open and explains that the category cannot be deleted while expenses reference it

#### Scenario: Generic deletion failure
- **WHEN** the delete request fails for another reason
- **THEN** the confirmation remains open, displays the error, and keeps the category row

#### Scenario: Pending deletion
- **WHEN** the delete request is pending
- **THEN** the confirmation controls are disabled and the confirmation cannot be closed

### Requirement: Category cache consistency
The system SHALL refresh category-dependent data after successful category mutations without overwriting open dialog drafts.

#### Scenario: Refresh category consumers
- **WHEN** a category is created, updated, or deleted successfully
- **THEN** category query data is invalidated so widgets, selectors, and category lookups can refresh

#### Scenario: Refresh embedded category data
- **WHEN** a category name or color is updated successfully
- **THEN** expense and expense-limit list query data containing embedded category objects is invalidated

#### Scenario: Refresh limits after category deletion
- **WHEN** a category is deleted successfully
- **THEN** expense-limit list data containing embedded category objects is invalidated

#### Scenario: Preserve open drafts during refetch
- **WHEN** invalidated category data refetches while other dialog rows are dirty
- **THEN** the refetch does not replace the open dialog's local drafts

#### Scenario: Preserve monthly progress styling
- **WHEN** a category color changes
- **THEN** the monthly expenses-by-categories widget retains its existing red progress-bar styling

### Requirement: Responsive and accessible management controls
The system SHALL keep category management usable at narrow viewport widths and expose accessible names and states for all icon-only controls.

#### Scenario: Narrow viewport
- **WHEN** the dialog is displayed at approximately 320 pixels viewport width
- **THEN** the row retains name, color, delete, and reserved save columns without horizontal clipping

#### Scenario: Icon-only controls
- **WHEN** assistive technology inspects the gear, close, color, delete, or save control
- **THEN** each control exposes a descriptive accessible label

#### Scenario: Validation and pending state
- **WHEN** a row is invalid or a request is pending
- **THEN** disabled and error states are conveyed programmatically as well as visually

#### Scenario: Submit a row from the keyboard
- **WHEN** focus is in a dirty valid category name and the user presses Enter
- **THEN** only that category row is submitted
